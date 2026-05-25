/**
 * Clashgram Outbound Payload Assembler
 *
 * Constructs spoofed custom emoji sticker payloads for non-premium users.
 * Replaces the inline rasterization logic from messages.ts with improved:
 *   - Transparent background (no purple #8774E1)
 *   - Support for up to 8 spoofed emoji assets (raised from 5)
 *   - Mixed text+emoji up to 100 chars
 *   - Proper grid layout for multi-emoji stickers
 */

import { Api as GramJs } from '../../lib/gramjs';
import { generateRandomBigInt } from '../../lib/gramjs/Helpers';

import type { ApiMessageEntity, ApiOnProgress } from '../../api/types';
import { ApiMediaFormat, ApiMessageEntityTypes } from '../../api/types';

import { DEBUG } from '../../config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpoofedMediaResult {
  media: GramJs.InputMediaUploadedDocument;
  clearedText: boolean;
}

interface EmojiAsset {
  blob: Blob;
  docId: string;
  emojiDoc: GramJs.Document;
  mimeType: string;
}

interface ClientMethods {
  downloadMedia: (
    args: { url: string; mediaFormat: ApiMediaFormat; start?: number; end?: number; isHtmlAllowed?: boolean },
    onProgress?: ApiOnProgress,
  ) => Promise<{ dataBlob?: unknown; mimeType?: string } | undefined>;
  uploadFile: (file: File, onProgress?: ApiOnProgress) => Promise<any>;
  invokeRequest: <T extends GramJs.AnyRequest>(
    request: T,
    params?: Record<string, unknown>,
  ) => Promise<any>;
  localDb: { documents: Record<string, GramJs.Document> };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_SPOOFED_ASSETS = 8;
const MAX_TEXT_LENGTH = 100;
const STICKER_CANVAS_SIZE = 512;

// ---------------------------------------------------------------------------
// Document Fetching
// ---------------------------------------------------------------------------

async function fetchAndCacheEmojiDocuments(
  docIds: string[],
  client: ClientMethods,
): Promise<void> {
  const missingDocIds = docIds.filter((id) => !client.localDb.documents[id]);
  if (missingDocIds.length === 0) return;

  try {
    const docs = await client.invokeRequest(
      new GramJs.messages.GetCustomEmojiDocuments({
        documentId: missingDocIds.map((id) => BigInt(id)),
      }),
    );
    if (docs) {
      for (const doc of docs) {
        if (doc instanceof GramJs.Document) {
          client.localDb.documents[String(doc.id)] = doc;
        }
      }
    }
  } catch (e) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('Failed to batch-fetch custom emoji documents', e);
    }
  }
}

// ---------------------------------------------------------------------------
// Asset Download
// ---------------------------------------------------------------------------

async function downloadEmojiAsset(
  docId: string,
  emojiDoc: GramJs.Document,
  totalCount: number,
  client: ClientMethods,
): Promise<EmojiAsset | undefined> {
  try {
    const dl = await client.downloadMedia({
      url: `sticker${docId}`,
      mediaFormat: ApiMediaFormat.BlobUrl,
    });
    if (!dl || !dl.dataBlob) return undefined;

    const mimeType = (dl.mimeType as string) || 'image/webp';
    const isAnimated = mimeType.includes('webm') || mimeType.includes('tgsticker');

    // For animated stickers in multi-emoji messages, fall back to static thumbnail
    if (isAnimated && totalCount > 1) {
      for (const size of ['m', 's']) {
        try {
          const thumbDl = await client.downloadMedia({
            url: `sticker${docId}?size=${size}`,
            mediaFormat: ApiMediaFormat.BlobUrl,
          });
          if (thumbDl && thumbDl.dataBlob) {
            return {
              blob: thumbDl.dataBlob as Blob,
              docId,
              emojiDoc,
              mimeType: (thumbDl.mimeType as string) || 'image/jpeg',
            };
          }
        } catch {
          // Try next size
        }
      }
    }

    return { blob: dl.dataBlob as Blob, docId, emojiDoc, mimeType };
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to download custom emoji', docId, err);
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Blob → File wrapper (cross-env safe)
// ---------------------------------------------------------------------------

function blobToFile(blob: Blob, fileName: string, mimeType: string): File | Blob {
  try {
    return new File([blob], fileName, { type: mimeType });
  } catch {
    try {
      Object.defineProperty(blob, 'name', {
        value: fileName,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      (blob as any).name = fileName;
    }
    return blob;
  }
}

// ---------------------------------------------------------------------------
// Sticker Merging — Grid layout for emoji-only messages
// ---------------------------------------------------------------------------

async function mergeEmojisToSingleSticker(blobs: Blob[]): Promise<Blob | undefined> {
  const count = blobs.length;
  if (count === 0) return undefined;
  if (typeof OffscreenCanvas === 'undefined') return undefined;

  try {
    const bitmaps = await Promise.all(blobs.map((blob) => createImageBitmap(blob)));

    // Calculate grid layout
    let cols: number;
    let rows: number;
    if (count <= 3) {
      cols = count;
      rows = 1;
    } else if (count <= 6) {
      cols = 3;
      rows = Math.ceil(count / 3);
    } else {
      cols = 4;
      rows = Math.ceil(count / 4);
    }

    const emojiSize = Math.floor(STICKER_CANVAS_SIZE / Math.max(cols, rows));
    const canvasWidth = cols * emojiSize;
    const canvasHeight = rows * emojiSize;

    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmaps.forEach((bmp) => bmp.close());
      return undefined;
    }

    for (let j = 0; j < count; j++) {
      const bmp = bitmaps[j];
      const col = j % cols;
      const row = Math.floor(j / cols);
      const x = col * emojiSize;
      const y = row * emojiSize;
      ctx.drawImage(bmp, x, y, emojiSize, emojiSize);
      bmp.close();
    }

    const resultBlob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: 0.92,
    });
    return resultBlob;
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to merge emojis onto single canvas', err);
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Text+Emoji Rasterizer — TRANSPARENT background, no purple
// ---------------------------------------------------------------------------

async function renderTextEmojiToSticker(
  textStr: string,
  textEntities: ApiMessageEntity[],
  client: ClientMethods,
): Promise<Blob | undefined> {
  if (typeof OffscreenCanvas === 'undefined') return undefined;

  try {
    const customEmojiEntities = textEntities
      .filter((e) => e.type === ApiMessageEntityTypes.CustomEmoji)
      .sort((a, b) => a.offset - b.offset);

    // Build segment list
    type Segment = {
      type: 'text' | 'emoji';
      content?: string;
      docId?: string;
      bitmap?: ImageBitmap;
    };

    const segments: Segment[] = [];
    let lastIdx = 0;

    for (const entity of customEmojiEntities) {
      if (entity.offset > lastIdx) {
        segments.push({
          type: 'text',
          content: textStr.substring(lastIdx, entity.offset),
        });
      }
      segments.push({
        type: 'emoji',
        docId: (entity as any).documentId,
      });
      lastIdx = entity.offset + entity.length;
    }
    if (lastIdx < textStr.length) {
      segments.push({
        type: 'text',
        content: textStr.substring(lastIdx),
      });
    }

    // Download emoji bitmaps
    await Promise.all(
      segments.map(async (seg) => {
        if (seg.type !== 'emoji' || !seg.docId) return;
        for (const urlSuffix of ['', '?size=s']) {
          try {
            const dl = await client.downloadMedia({
              url: `sticker${seg.docId}${urlSuffix}`,
              mediaFormat: ApiMediaFormat.BlobUrl,
            });
            if (dl && dl.dataBlob) {
              seg.bitmap = await createImageBitmap(dl.dataBlob as Blob);
              return;
            }
          } catch {
            // Try next
          }
        }
      }),
    );

    // Measure and lay out
    const maxLineWidth = 440;
    const fontSize = 26;
    const lineHeight = 36;
    const emojiSize = 32;
    const padding = 16;

    const measureCanvas = new OffscreenCanvas(1, 1);
    const measureCtx = measureCanvas.getContext('2d')!;
    measureCtx.font = `${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

    const lines: Segment[][] = [[]];
    let currentLineWidth = 0;

    for (const seg of segments) {
      if (seg.type === 'emoji') {
        if (currentLineWidth + emojiSize > maxLineWidth && currentLineWidth > 0) {
          lines.push([]);
          currentLineWidth = 0;
        }
        lines[lines.length - 1].push(seg);
        currentLineWidth += emojiSize + 4;
      } else if (seg.type === 'text' && seg.content) {
        const words = seg.content.split(/(\s+)/);
        for (const word of words) {
          if (!word) continue;
          const wordWidth = measureCtx.measureText(word).width;
          if (currentLineWidth + wordWidth > maxLineWidth && currentLineWidth > 0) {
            lines.push([]);
            currentLineWidth = 0;
          }
          lines[lines.length - 1].push({ type: 'text', content: word });
          currentLineWidth += wordWidth;
        }
      }
    }

    // Calculate canvas dimensions
    let maxContentWidth = 0;
    for (const line of lines) {
      let lineWidth = 0;
      for (const seg of line) {
        if (seg.type === 'emoji') {
          lineWidth += emojiSize + 4;
        } else if (seg.type === 'text' && seg.content) {
          lineWidth += measureCtx.measureText(seg.content).width;
        }
      }
      if (lineWidth > maxContentWidth) {
        maxContentWidth = lineWidth;
      }
    }

    const canvasWidth = Math.ceil(maxContentWidth + padding * 2);
    const canvasHeight = lines.length * lineHeight + padding * 2;

    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d')!;

    // TRANSPARENT background — no purple fill
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Semi-transparent dark backdrop for readability on any chat bg
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    const r = 14;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, canvasWidth, canvasHeight, r);
    } else {
      ctx.rect(0, 0, canvasWidth, canvasHeight);
    }
    ctx.fill();

    // Render text and emojis
    ctx.font = `${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';

    let currentY = padding + lineHeight / 2;
    for (const line of lines) {
      let currentX = padding;
      for (const seg of line) {
        if (seg.type === 'text' && seg.content) {
          // Text shadow for readability
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;
          ctx.fillText(seg.content, currentX, currentY);
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          currentX += ctx.measureText(seg.content).width;
        } else if (seg.type === 'emoji') {
          if (seg.bitmap) {
            const emojiY = currentY - emojiSize / 2;
            ctx.drawImage(seg.bitmap, currentX, emojiY, emojiSize, emojiSize);
            seg.bitmap.close();
          }
          currentX += emojiSize + 4;
        }
      }
      currentY += lineHeight;
    }

    // Scale to sticker dimensions
    let targetWidth = canvasWidth;
    let targetHeight = canvasHeight;
    if (canvasWidth > canvasHeight) {
      targetWidth = STICKER_CANVAS_SIZE;
      targetHeight = Math.round(canvasHeight * (STICKER_CANVAS_SIZE / canvasWidth));
    } else {
      targetHeight = STICKER_CANVAS_SIZE;
      targetWidth = Math.round(canvasWidth * (STICKER_CANVAS_SIZE / canvasHeight));
    }

    const finalCanvas = new OffscreenCanvas(targetWidth, targetHeight);
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    const resultBlob = await finalCanvas.convertToBlob({
      type: 'image/webp',
      quality: 0.92,
    });
    return resultBlob;
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to render text and emoji to sticker', err);
    }
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Attribute Helpers
// ---------------------------------------------------------------------------

function extractAltText(emojiDoc: GramJs.Document): string {
  if (!emojiDoc.attributes) return '';
  for (const attr of emojiDoc.attributes) {
    if (attr instanceof GramJs.DocumentAttributeSticker && attr.alt) {
      return attr.alt;
    }
    if (attr instanceof GramJs.DocumentAttributeCustomEmoji && attr.alt) {
      return attr.alt;
    }
  }
  return '';
}

function buildStickerAttributes(
  assets: EmojiAsset[],
  mimeType: string,
  ext: string,
): GramJs.TypeDocumentAttribute[] {
  const attributes: GramJs.TypeDocumentAttribute[] = [];

  if (assets.length === 1) {
    const asset = assets[0];
    const altText = extractAltText(asset.emojiDoc);
    attributes.push(
      new GramJs.DocumentAttributeSticker({
        alt: altText,
        stickerset: new GramJs.InputStickerSetEmpty(),
      }),
    );
    attributes.push(
      new GramJs.DocumentAttributeFilename({
        fileName: `clashgram_emoji_${asset.docId}_1.${ext}`,
      }),
    );
    const isVideo = mimeType.includes('webm');
    if (isVideo) {
      attributes.push(
        new GramJs.DocumentAttributeVideo({
          w: STICKER_CANVAS_SIZE,
          h: STICKER_CANVAS_SIZE,
          duration: 0,
          nosound: true,
        }),
      );
    } else {
      attributes.push(
        new GramJs.DocumentAttributeImageSize({
          w: STICKER_CANVAS_SIZE,
          h: STICKER_CANVAS_SIZE,
        }),
      );
    }
  } else {
    const docIdsJoin = assets.map((a) => a.docId).join('_');
    const cols = assets.length <= 3 ? assets.length : assets.length <= 6 ? 3 : 4;
    const rows = Math.ceil(assets.length / cols);

    attributes.push(
      new GramJs.DocumentAttributeSticker({
        alt: '',
        stickerset: new GramJs.InputStickerSetEmpty(),
      }),
    );
    attributes.push(
      new GramJs.DocumentAttributeFilename({
        fileName: `clashgram_emoji_merged_${docIdsJoin}_${assets.length}.webp`,
      }),
    );
    attributes.push(
      new GramJs.DocumentAttributeImageSize({
        w: cols * Math.floor(STICKER_CANVAS_SIZE / Math.max(cols, rows)),
        h: rows * Math.floor(STICKER_CANVAS_SIZE / Math.max(cols, rows)),
      }),
    );
  }

  return attributes;
}

// ---------------------------------------------------------------------------
// Public API — Main Entry Point
// ---------------------------------------------------------------------------

/**
 * Build the spoofed sticker media payload for a non-premium user's message
 * containing custom emoji entities.
 *
 * Returns undefined if spoofing is not possible for this message.
 */
export async function buildSpoofedStickerMedia(
  text: string | undefined,
  entities: ApiMessageEntity[] | undefined,
  isOnlyCustomEmojis: boolean,
  client: ClientMethods,
): Promise<SpoofedMediaResult | undefined> {
  if (!entities) return undefined;

  const customEmojiEntities = entities.filter(
    (e): e is ApiMessageEntity & { documentId: string } =>
      e.type === ApiMessageEntityTypes.CustomEmoji && 'documentId' in e,
  );

  if (customEmojiEntities.length === 0) return undefined;

  // --- Path A: Mixed text + emoji → rasterize to transparent sticker ---
  if (!isOnlyCustomEmojis && text && text.length <= MAX_TEXT_LENGTH) {
    try {
      const textStickerBlob = await renderTextEmojiToSticker(text, customEmojiEntities, client);
      if (textStickerBlob) {
        const file = blobToFile(
          textStickerBlob,
          'sticker.webp',
          'image/webp',
        );
        const inputFile = await client.uploadFile(file as File);
        if (inputFile) {
          return {
            media: new GramJs.InputMediaUploadedDocument({
              file: inputFile,
              mimeType: 'image/webp',
              attributes: [
                new GramJs.DocumentAttributeSticker({
                  alt: '',
                  stickerset: new GramJs.InputStickerSetEmpty(),
                }),
                new GramJs.DocumentAttributeFilename({
                  fileName: `clashgram_emoji_text_${generateRandomBigInt().toString()}_1.webp`,
                }),
                new GramJs.DocumentAttributeImageSize({
                  w: STICKER_CANVAS_SIZE,
                  h: STICKER_CANVAS_SIZE,
                }),
              ],
            }),
            clearedText: true,
          };
        }
      }
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.error('Failed to render text emoji sticker, falling back', err);
      }
    }
    return undefined;
  }

  // --- Path B: Emoji-only messages → direct sticker or merged grid ---
  if (!isOnlyCustomEmojis) return undefined;

  try {
    const emojiEntitiesList = customEmojiEntities.slice(0, MAX_SPOOFED_ASSETS);

    // Step 1: Batch-fetch documents
    const uniqueDocIds = [...new Set(emojiEntitiesList.map((e) => e.documentId))];
    await fetchAndCacheEmojiDocuments(uniqueDocIds, client);

    // Step 2: Download renderable blobs in parallel
    const downloadedAssets = await Promise.all(
      emojiEntitiesList.map(async (entity) => {
        const docId = entity.documentId;
        const emojiDoc = client.localDb.documents[docId];
        if (!emojiDoc) return undefined;
        return downloadEmojiAsset(docId, emojiDoc, emojiEntitiesList.length, client);
      }),
    );

    const validAssets = downloadedAssets.filter(Boolean) as EmojiAsset[];
    if (validAssets.length === 0) return undefined;

    let file: File | Blob;
    let mimeType = 'image/webp';
    let ext = 'webp';

    if (validAssets.length === 1) {
      // Single emoji: send directly with its native format
      const asset = validAssets[0];
      mimeType = asset.mimeType;
      if (mimeType.includes('webm')) ext = 'webm';
      else if (mimeType.includes('tgsticker')) ext = 'tgs';
      file = blobToFile(asset.blob, `sticker.${ext}`, mimeType);
    } else {
      // Multiple emojis: merge into grid
      const mergedBlob = await mergeEmojisToSingleSticker(validAssets.map((a) => a.blob));
      if (!mergedBlob) return undefined;
      file = blobToFile(mergedBlob, 'sticker.webp', 'image/webp');
    }

    const inputFile = await client.uploadFile(file as File);
    if (!inputFile) return undefined;

    const attributes = buildStickerAttributes(validAssets, mimeType, ext);

    return {
      media: new GramJs.InputMediaUploadedDocument({
        file: inputFile,
        mimeType,
        attributes,
      }),
      clearedText: true,
    };
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error('Failed to bypass custom emoji', err);
    }
    return undefined;
  }
}

export { MAX_SPOOFED_ASSETS, MAX_TEXT_LENGTH };
