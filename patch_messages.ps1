$filePath = Join-Path $PSScriptRoot "src/api/gramjs/methods/messages.ts"
$bakPath = Join-Path $PSScriptRoot "src/api/gramjs/methods/messages.ts.bak"

# 1. Backup original file
if (Test-Path $filePath) {
    Copy-Item -Path $filePath -Destination $bakPath -Force
}

# 2. Read contents of original file as a single raw string
$content = [System.IO.File]::ReadAllText($filePath)

# --- ANCHOR A: Types Imports injection ---
$anchorTypes = "import {
  MAIN_THREAD_ID,
  MESSAGE_DELETED,
} from '../../types';"

$newTypes = "import {
  MAIN_THREAD_ID,
  MESSAGE_DELETED,
  ApiMediaFormat,
  ApiMessageEntityTypes,
} from '../../types';"

$content = $content.Replace($anchorTypes, $newTypes)

# --- ANCHOR B: Client Imports injection ---
$anchorClient = "import { handleGramJsUpdate, invokeRequest, uploadFile } from './client';"
$newClient = "import { handleGramJsUpdate, invokeRequest, uploadFile, downloadMedia, getClient } from './client';"

$content = $content.Replace($anchorClient, $newClient)

# --- ANCHOR 1: Helper functions injection ---
$anchor1 = "export function sendApiMessage("
$helperFunctions = @'
async function mergeEmojisToSingleSticker(blobs: Blob[]): Promise<Blob | undefined> {
  const count = blobs.length;
  if (count === 0) return undefined;
  if (typeof OffscreenCanvas === "undefined") return undefined;
  try {
    const bitmaps = await Promise.all(blobs.map(blob => createImageBitmap(blob)));
    const canvasWidth = 512;
    const canvasHeight = Math.round(512 / count);
    const emojiSize = canvasHeight;
    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmaps.forEach(bmp => bmp.close());
      return undefined;
    }
    for (let j = 0; j < count; j++) {
      const bmp = bitmaps[j];
      const x = j * emojiSize;
      const y = 0;
      ctx.drawImage(bmp, x, y, emojiSize, emojiSize);
      bmp.close();
    }
    const resultBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.9,
    });
    return resultBlob;
  } catch (err) {
    if (DEBUG) {
      console.error("Failed to merge emojis onto single canvas", err);
    }
    return undefined;
  }
}

async function renderTextEmojiToSticker(textStr: string, textEntities: ApiMessageEntity[]): Promise<Blob | undefined> {
  if (typeof OffscreenCanvas === "undefined") return undefined;
  try {
    const customEmojiEntities = textEntities.filter(e => e.type === ApiMessageEntityTypes.CustomEmoji);
    const segments: { type: "text" | "emoji"; content?: string; docId?: string; bitmap?: ImageBitmap }[] = [];
    let lastIdx = 0;
    const sortedEntities = [...customEmojiEntities].sort((a, b) => a.offset - b.offset);
    for (const entity of sortedEntities) {
      if (entity.offset > lastIdx) {
        segments.push({
          type: "text",
          content: textStr.substring(lastIdx, entity.offset),
        });
      }
      segments.push({
        type: "emoji",
        docId: (entity as any).documentId,
      });
      lastIdx = entity.offset + entity.length;
    }
    if (lastIdx < textStr.length) {
      segments.push({
        type: "text",
        content: textStr.substring(lastIdx),
      });
    }
    await Promise.all(segments.map(async (seg) => {
      if (seg.type === "emoji" && seg.docId) {
        try {
          const dl = await downloadMedia({
            url: `sticker${seg.docId}`,
            mediaFormat: ApiMediaFormat.BlobUrl,
          });
          if (dl && dl.dataBlob) {
            seg.bitmap = await createImageBitmap(dl.dataBlob as Blob);
          }
        } catch (err) {
          try {
            const thumbDl = await downloadMedia({
              url: `sticker${seg.docId}?size=s`,
              mediaFormat: ApiMediaFormat.BlobUrl,
            });
            if (thumbDl && thumbDl.dataBlob) {
              seg.bitmap = await createImageBitmap(thumbDl.dataBlob as Blob);
            }
          } catch (e) {
            // Skip
          }
        }
      }
    }));
    const maxLineWidth = 400;
    const fontSize = 24;
    const lineHeight = 32;
    const emojiSize = 28;
    const measureCanvas = new OffscreenCanvas(1, 1);
    const measureCtx = measureCanvas.getContext("2d")!;
    measureCtx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    const lines: (typeof segments)[] = [[]];
    let currentLineWidth = 0;
    for (const seg of segments) {
      if (seg.type === "emoji") {
        if (currentLineWidth + emojiSize > maxLineWidth) {
          lines.push([]);
          currentLineWidth = 0;
        }
        lines[lines.length - 1].push(seg);
        currentLineWidth += emojiSize + 4;
      } else if (seg.type === "text" && seg.content) {
        const words = seg.content.split(/(\s+)/);
        for (const word of words) {
          if (!word) continue;
          const wordWidth = measureCtx.measureText(word).width;
          if (currentLineWidth + wordWidth > maxLineWidth) {
            lines.push([]);
            currentLineWidth = 0;
          }
          lines[lines.length - 1].push({
            type: "text",
            content: word,
          });
          currentLineWidth += wordWidth;
        }
      }
    }
    let maxContentWidth = 0;
    for (const line of lines) {
      let lineWidth = 0;
      for (const seg of line) {
        if (seg.type === "emoji") {
          lineWidth += emojiSize + 4;
        } else if (seg.type === "text" && seg.content) {
          lineWidth += measureCtx.measureText(seg.content).width;
        }
      }
      if (lineWidth > maxContentWidth) {
        maxContentWidth = lineWidth;
      }
    }
    const canvasWidth = maxContentWidth + 40;
    const canvasHeight = lines.length * lineHeight + 32;
    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8774E1";
    ctx.lineWidth = 0;
    const r = 16;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(0, 0, canvasWidth, canvasHeight, r) : ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    let currentY = 16 + lineHeight / 2;
    for (const line of lines) {
      let currentX = 20;
      for (const seg of line) {
        if (seg.type === "text" && seg.content) {
          ctx.fillText(seg.content, currentX, currentY);
          currentX += ctx.measureText(seg.content).width;
        } else if (seg.type === "emoji") {
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
    let targetWidth = canvasWidth;
    let targetHeight = canvasHeight;
    if (canvasWidth > canvasHeight) {
      targetWidth = 512;
      targetHeight = Math.round(canvasHeight * (512 / canvasWidth));
    } else {
      targetHeight = 512;
      targetWidth = Math.round(canvasWidth * (512 / canvasHeight));
    }
    const finalCanvas = new OffscreenCanvas(targetWidth, targetHeight);
    const finalCtx = finalCanvas.getContext("2d")!;
    finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    const resultBlob = await finalCanvas.convertToBlob({
      type: "image/webp",
      quality: 0.9,
    });
    return resultBlob;
  } catch (err) {
    if (DEBUG) {
      console.error("Failed to render text and emoji to sticker", err);
    }
    return undefined;
  }
}
'@

$content = $content.Replace($anchor1, $helperFunctions + "`n" + $anchor1)

# --- ANCHOR C: Inline Media Block Injection ---
$anchorMedia = "  const messagePromise = (async () => {
    let media: GramJs.TypeInputMedia | undefined;"

$bypassBlock = @'
  const messagePromise = (async () => {
    let media: GramJs.TypeInputMedia | undefined;

    let mutableText = text;
    let mutableEntities = entities;

    const customEmojiEntities = mutableEntities?.filter(e => e.type === ApiMessageEntityTypes.CustomEmoji);
    const hasCustomEmojis = customEmojiEntities && customEmojiEntities.length > 0;
    const client = getClient();

    const isOnlyCustomEmojis = (() => {
      if (!hasCustomEmojis || !mutableText) return false;
      const emojiIndices = new Set<number>();
      for (const entity of customEmojiEntities!) {
        for (let i = entity.offset; i < entity.offset + entity.length; i++) {
          emojiIndices.add(i);
        }
      }
      for (let i = 0; i < mutableText.length; i++) {
        const char = mutableText[i];
        if (/\s/.test(char)) {
          continue;
        }
        if (!emojiIndices.has(i)) {
          return false;
        }
      }
      return true;
    })();

    if (!client.isPremium && hasCustomEmojis && !isOnlyCustomEmojis) {
      const isShortMessage = mutableText && mutableText.length <= 100;
      if (isShortMessage) {
        try {
          const textStickerBlob = await renderTextEmojiToSticker(mutableText!, customEmojiEntities!);
          if (textStickerBlob) {
            let reFile: any = textStickerBlob;
            try {
              reFile = new File([textStickerBlob], `sticker.webp`, { type: "image/webp" });
            } catch (e) {
              reFile = textStickerBlob;
              if (reFile) {
                try {
                  Object.defineProperty(reFile, "name", {
                    value: `sticker.webp`,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                  });
                } catch (err) {
                  reFile.name = `sticker.webp`;
                }
              }
            }
            const reInputFile = await uploadFile(reFile);
            if (reInputFile) {
              media = new GramJs.InputMediaUploadedDocument({
                file: reInputFile,
                mimeType: "image/webp",
                attributes: [
                  new GramJs.DocumentAttributeSticker({
                    alt: "",
                    stickerset: new GramJs.InputStickerSetEmpty(),
                  }),
                  new GramJs.DocumentAttributeFilename({
                    fileName: `clashgram_emoji_text_${generateRandomBigInt().toString()}_1.webp`,
                  }),
                  new GramJs.DocumentAttributeImageSize({
                    w: 512,
                    h: 512,
                  }),
                ],
              });
              mutableText = "";
              mutableEntities = undefined;
            }
          }
        } catch (err) {
          if (DEBUG) {
            console.error("Failed to render text emoji sticker, falling back to Unicode text", err);
          }
        }
      }
      if (!media) {
        mutableEntities = mutableEntities?.filter(e => e.type !== ApiMessageEntityTypes.CustomEmoji);
      }
    }

    if (!media && !sticker && !gif && !poll && !todo && !story && !contact && !dice && !client.isPremium && isOnlyCustomEmojis) {
      try {
        const emojiEntitiesList = customEmojiEntities!.slice(0, 5);

        // Step 1: Batch-fetch all unique document IDs in one API call
        const uniqueDocIds = [...new Set(emojiEntitiesList.map(e => e.documentId))];
        const missingDocIds = uniqueDocIds.filter(id => !localDb.documents[id]);
        if (missingDocIds.length > 0) {
          try {
            const docs = await invokeRequest(new GramJs.messages.GetCustomEmojiDocuments({
              documentId: missingDocIds.map(id => BigInt(id)),
            }));
            if (docs) {
              for (const doc of docs) {
                if (doc instanceof GramJs.Document) {
                  localDb.documents[String(doc.id)] = doc;
                }
              }
            }
          } catch (e) {
            if (DEBUG) {
              console.warn('Failed to batch-fetch custom emoji documents', e);
            }
          }
        }

        // Step 2: Download renderable blobs for all emojis in parallel
        const downloadPromises = emojiEntitiesList.map(async (entity) => {
          const docId = entity.documentId;
          const emojiDoc = localDb.documents[docId];
          if (!emojiDoc) return undefined;
          try {
            const dl = await downloadMedia({
              url: `sticker${docId}`,
              mediaFormat: ApiMediaFormat.BlobUrl,
            });
            if (!dl || !dl.dataBlob) return undefined;
            const mimeType = dl.mimeType || "image/webp";
            const isAnimated = mimeType.includes("webm") || mimeType.includes("tgsticker");
            if (isAnimated && emojiEntitiesList.length > 1) {
              try {
                const thumbDl = await downloadMedia({
                  url: `sticker${docId}?size=m`,
                  mediaFormat: ApiMediaFormat.BlobUrl,
                });
                if (thumbDl && thumbDl.dataBlob) {
                  return { blob: thumbDl.dataBlob as Blob, docId, emojiDoc, mimeType: thumbDl.mimeType || "image/jpeg" };
                }
              } catch (e) {
                try {
                  const thumbDl = await downloadMedia({
                    url: `sticker${docId}?size=s`,
                    mediaFormat: ApiMediaFormat.BlobUrl,
                  });
                  if (thumbDl && thumbDl.dataBlob) {
                    return { blob: thumbDl.dataBlob as Blob, docId, emojiDoc, mimeType: thumbDl.mimeType || "image/jpeg" };
                  }
                } catch (e2) {
                  return { blob: dl.dataBlob as Blob, docId, emojiDoc, mimeType };
                }
              }
            }
            return { blob: dl.dataBlob as Blob, docId, emojiDoc, mimeType };
          } catch (err) {
            if (DEBUG) {
              console.error("Failed to download custom emoji", docId, err);
            }
            return undefined;
          }
        });
        const downloadedAssets = await Promise.all(downloadPromises);
        const validAssets = downloadedAssets.filter(Boolean) as { blob: Blob; docId: string; emojiDoc: GramJs.Document; mimeType: string }[];
        if (validAssets.length > 0) {
          let reFile: any;
          let mimeType = "image/webp";
          let ext = "webp";
          let attributes: GramJs.TypeDocumentAttribute[] = [];
          if (validAssets.length === 1) {
            const asset = validAssets[0];
            mimeType = asset.mimeType;
            if (mimeType.includes("webm")) ext = "webm";
            else if (mimeType.includes("tgsticker")) ext = "tgs";
            reFile = asset.blob;
            try {
              reFile = new File([asset.blob], `sticker.${ext}`, { type: mimeType });
            } catch (e) {
              reFile = asset.blob;
              if (reFile) {
                try {
                  Object.defineProperty(reFile, "name", {
                    value: `sticker.${ext}`,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                  });
                } catch (err) {
                  reFile.name = `sticker.${ext}`;
                }
              }
            }
            const altText = (asset.emojiDoc.attributes?.find(a => a instanceof GramJs.DocumentAttributeSticker) as any)?.alt
              || (asset.emojiDoc.attributes?.find(a => a instanceof GramJs.DocumentAttributeCustomEmoji) as any)?.alt
              || "";
            attributes.push(new GramJs.DocumentAttributeSticker({
              alt: altText,
              stickerset: new GramJs.InputStickerSetEmpty(),
            }));
            attributes.push(new GramJs.DocumentAttributeFilename({
              fileName: `clashgram_emoji_${asset.docId}_1.${ext}`,
            }));
            const isVideo = mimeType.includes("webm");
            if (isVideo) {
              attributes.push(new GramJs.DocumentAttributeVideo({
                w: 512,
                h: 512,
                duration: 0,
                nosound: true,
              }));
            } else {
              attributes.push(new GramJs.DocumentAttributeImageSize({
                w: 512,
                h: 512,
              }));
            }
          } else {
            const mergedBlob = await mergeEmojisToSingleSticker(validAssets.map(a => a.blob));
            if (mergedBlob) {
              reFile = mergedBlob;
              try {
                reFile = new File([mergedBlob], `sticker.webp`, { type: "image/webp" });
              } catch (e) {
                reFile = mergedBlob;
                if (reFile) {
                  try {
                    Object.defineProperty(reFile, "name", {
                      value: `sticker.webp`,
                      writable: true,
                      configurable: true,
                      enumerable: true,
                    });
                  } catch (err) {
                    reFile.name = `sticker.webp`;
                  }
                }
              }
              const docIdsJoin = validAssets.map(a => a.docId).join("_");
              attributes.push(new GramJs.DocumentAttributeSticker({
                alt: "",
                stickerset: new GramJs.InputStickerSetEmpty(),
              }));
              attributes.push(new GramJs.DocumentAttributeFilename({
                fileName: `clashgram_emoji_merged_${docIdsJoin}_${validAssets.length}.webp`,
              }));
              attributes.push(new GramJs.DocumentAttributeImageSize({
                w: 512,
                h: Math.round(512 / validAssets.length),
              }));
            }
          }
          if (reFile) {
            const reInputFile = await uploadFile(reFile);
            if (reInputFile) {
              media = new GramJs.InputMediaUploadedDocument({
                file: reInputFile,
                mimeType,
                attributes,
              });
              mutableText = "";
              mutableEntities = undefined;
            }
          }
        }
      } catch (err) {
        if (DEBUG) {
          console.error('Failed to bypass custom emoji', err);
        }
      }
    }
'@

$content = $content.Replace($anchorMedia, $bypassBlock)

# --- ANCHOR D: Replaced constants in SharedArgs ---
$anchorArgs = "    const args: SharedArgs = {
      clearDraft: true,
      message: text || DEFAULT_PRIMITIVES.STRING,
      entities: entities ? entities.map(buildMtpMessageEntity) : undefined,"

$newArgs = "    const args: SharedArgs = {
      clearDraft: true,
      message: mutableText || DEFAULT_PRIMITIVES.STRING,
      entities: mutableEntities ? mutableEntities.map(buildMtpMessageEntity) : undefined,"

$content = $content.Replace($anchorArgs, $newArgs)

# 4. Save new content back to original file path
[System.IO.File]::WriteAllText($filePath, $content)

# 5. Remove the temporary backup file if it's there
Remove-Item -Path $bakPath -ErrorAction SilentlyContinue

Write-Host "Successfully applied all compile-safe custom emoji sticker bypass anchor updates!"
