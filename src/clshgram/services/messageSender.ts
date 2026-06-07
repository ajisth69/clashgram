import { Api as GramJs } from '../../lib/gramjs';
import { ApiMediaFormat } from '../../api/types';
import type { ApiMessageEntity, ApiMessageEntityTypes } from '../../api/types/messages';
import { gunzipSync, gzipSync } from 'fflate';

// Module-level global caches to optimize performance and prevent redundant API/network requests
const globalStickerSetCache = new Map<string, any>();
const globalUnrestrictedDocs = new Map<string, GramJs.Document>();
const globalDownloadedBlobs = new Map<string, { blob: Blob; mimeType: string }>();

// Unzip a Lottie TGS blob and parse its JSON
async function parseTgsBlob(blob: Blob): Promise<any | undefined> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const unzipped = gunzipSync(bytes);
    const jsonStr = new TextDecoder('utf-8').decode(unzipped);
    return JSON.parse(jsonStr);
  } catch (err) {
    return undefined;
  }
}

// Merge multiple Lottie JSONs horizontally side-by-side
function mergeLottieJSONs(jsons: any[]): any {
  const count = jsons.length;
  if (count === 0) return null;

  const maxOp = Math.max(...jsons.map(j => j.op || 0));
  const fr = jsons[0].fr || 60;
  const canvasWidth = 512;
  const slotSize = 512 / count;
  const canvasHeight = Math.round(slotSize);

  const assets: any[] = [];
  const layers: any[] = [];

  jsons.forEach((originalJson, index) => {
    const compId = `comp_${index}`;
    
    // Add original assets and prefix IDs to avoid collisions
    const originalAssets = originalJson.assets || [];
    const assetIdMap = new Map<string, string>();
    originalAssets.forEach((asset: any) => {
      const newAssetId = `comp_${index}_asset_${asset.id}`;
      assetIdMap.set(asset.id, newAssetId);
      
      const clonedAsset = JSON.parse(JSON.stringify(asset));
      clonedAsset.id = newAssetId;
      assets.push(clonedAsset);
    });

    // Fix layer reference IDs
    const originalLayers = originalJson.layers || [];
    const clonedLayers = JSON.parse(JSON.stringify(originalLayers));
    clonedLayers.forEach((layer: any) => {
      if (layer.refId && assetIdMap.has(layer.refId)) {
        layer.refId = assetIdMap.get(layer.refId);
      }
    });

    // Add pre-composition
    assets.push({
      id: compId,
      layers: clonedLayers,
    });

    const origW = originalJson.w || 512;
    const origH = originalJson.h || 512;
    
    // Apply our scaleFactor to give a tiny bit of padding within the slot size
    let scaleFactor = 1.0;
    if (count >= 2 && count <= 3) {
      scaleFactor = 1.12;
    } else if (count >= 4 && count <= 5) {
      scaleFactor = 1.10;
    } else if (count >= 6 && count <= 8) {
      scaleFactor = 1.05;
    }
    
    const targetSize = slotSize * scaleFactor;
    const paddingOffset = (slotSize - targetSize) / 2;

    const scaleX = (targetSize / origW) * 100;
    const scaleY = (targetSize / origH) * 100;

    const layer = {
      ty: 0, // pre-composition
      refId: compId,
      ind: index + 1,
      ip: 0,
      op: maxOp,
      st: 0,
      sr: 1,
      ks: {
        a: { a: 0, k: [0, 0, 0] },
        p: { a: 0, k: [index * slotSize + paddingOffset, paddingOffset, 0] },
        s: { a: 0, k: [scaleX, scaleY, 100] },
        r: { a: 0, k: 0 },
        o: { a: 0, k: 100 },
      },
    };

    layers.push(layer);
  });

  return {
    v: jsons[0].v || "5.5.7",
    fr,
    ip: 0,
    op: maxOp,
    w: canvasWidth,
    h: canvasHeight,
    nm: "merged_spoofed_sticker",
    layers,
    assets,
  };
}

// Merge multiple TGS blobs into a single TGS blob
async function mergeTgsBlobsToSingleSticker(blobs: Blob[]): Promise<Blob | undefined> {
  try {
    const jsons = await Promise.all(blobs.map(parseTgsBlob));
    if (jsons.some(j => !j)) return undefined;

    const mergedJson = mergeLottieJSONs(jsons);
    if (!mergedJson) return undefined;

    const jsonStr = JSON.stringify(mergedJson);
    const bytes = new TextEncoder().encode(jsonStr);
    const compressed = gzipSync(bytes);
    return new Blob([compressed as any], { type: "application/x-tgsticker" });
  } catch (err) {
    return undefined;
  }
}

// Helper to generate unique filenames
const generateRandomBigInt = () => {
  return BigInt(Math.floor(Math.random() * 1000000000));
};

async function mergeEmojisToSingleSticker(blobs: Blob[]): Promise<Blob | undefined> {
  const count = blobs.length;
  if (count === 0) return undefined;
  if (typeof OffscreenCanvas === "undefined") return undefined;
  try {
    const bitmaps = await Promise.all(blobs.map(blob => createImageBitmap(blob)));
    const canvasWidth = 512;
    const slotWidth = 512 / count;
    const canvasHeight = Math.round(slotWidth);
    
    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmaps.forEach(bmp => bmp.close());
      return undefined;
    }

    // Enable high-quality downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Scale factor based on quantity to give ideal breathing room and size proportions
    let scaleFactor = 1.0;
    if (count >= 2 && count <= 3) {
      scaleFactor = 1.12; // Adjusted to overlap transparent margins and connect
    } else if (count >= 4 && count <= 5) {
      scaleFactor = 1.10; // Increased size for 4-5 format
    } else if (count >= 6 && count <= 8) {
      scaleFactor = 1.05; // Increased size for 6-8 format
    }
    const emojiSize = canvasHeight * scaleFactor;
    const offset = (canvasHeight - emojiSize) / 2;

    for (let j = 0; j < count; j++) {
      const bmp = bitmaps[j];
      const x = j * slotWidth + (slotWidth - emojiSize) / 2;
      const y = offset;
      ctx.drawImage(bmp, x, y, emojiSize, emojiSize);
      bmp.close();
    }
    
    const resultBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.95,
    });
    return resultBlob;
  } catch (err) {
    return undefined;
  }
}

/**
 * Directly download a GramJs.Document using its InputDocumentFileLocation.
 * This bypasses the URL-based downloadMedia wrapper entirely, avoiding
 * file reference repair loops that restore premium-restricted references.
 */
async function downloadDocumentDirect(
  doc: GramJs.Document,
  client: any,
  sizeType?: string,
): Promise<{ blob: Blob; mimeType: string } | undefined> {
  try {
    let thumbSize = '';
    if (sizeType) {
      const thumb = [...(doc.thumbs || []), ...(doc.videoThumbs || [])].find(
        (t: any) => t.type === sizeType
      );
      if (!thumb) return undefined;
      thumbSize = sizeType;
    }

    const inputLocation = new GramJs.InputDocumentFileLocation({
      id: doc.id,
      accessHash: doc.accessHash,
      fileReference: doc.fileReference,
      thumbSize,
    });

    const fileSize = sizeType ? undefined : Number(doc.size);
    const buffer = await client.downloadFile(inputLocation, {
      fileSize,
      dcId: doc.dcId,
      workers: 4,
    });

    if (!buffer || buffer.length === 0) return undefined;

    // Determine mime type
    let mimeType = doc.mimeType || 'image/webp';
    if (sizeType) {
      mimeType = 'image/jpeg'; // Thumbnails are JPEG
    }

    const blob = new Blob([buffer], { type: mimeType });
    return { blob, mimeType };
  } catch (err) {
    return undefined;
  }
}

export async function buildSpoofedStickerMedia(
  text: string,
  entities: ApiMessageEntity[] | undefined,
  isOnlyCustomEmojis: boolean,
  helpers: any,
): Promise<{ media: GramJs.TypeInputMedia; clearedText: boolean } | undefined> {
  const { uploadFile, invokeRequest, localDb, getClient } = helpers;

  if (!isOnlyCustomEmojis || !entities) {
    return undefined;
  }

  // Use enum string value directly since we import the type
  const customEmojiEntities = entities.filter(
    (e) => e.type === 'MessageEntityCustomEmoji'
  ) as Array<{ type: string; offset: number; length: number; documentId: string }>;
  if (customEmojiEntities.length === 0) {
    return undefined;
  }

  try {
    // Support up to 8 emojis!
    const emojiEntitiesList = customEmojiEntities.slice(0, 8);

    // Step 1: Batch-fetch all unique custom emoji documents in one API call
    const uniqueDocIds = [...new Set(emojiEntitiesList.map(e => e.documentId))].filter(Boolean);
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
        // Silently skip batch fetch warning
      }
    }

    // Step 1.5: Fetch parent sticker sets for ALL custom emojis to obtain unrestricted document references
    // This is the critical bypass — sticker set documents have unrestricted fileReferences
    const unrestrictedDocs = new Map<string, GramJs.Document>();

    for (const docId of uniqueDocIds) {
      if (globalUnrestrictedDocs.has(docId)) {
        unrestrictedDocs.set(docId, globalUnrestrictedDocs.get(docId)!);
        continue;
      }

      const emojiDoc = localDb.documents[docId];
      if (!emojiDoc) continue;

      const stickerAttribute = emojiDoc.attributes?.find(
        (attr: any) => attr instanceof GramJs.DocumentAttributeSticker || attr instanceof GramJs.DocumentAttributeCustomEmoji
      ) as any;
      const stickerset = stickerAttribute?.stickerset;

      if (stickerset && !(stickerset instanceof GramJs.InputStickerSetEmpty)) {
        try {
          const cacheKey = stickerset.shortName || String(stickerset.id);
          let stickerSetResult = globalStickerSetCache.get(cacheKey);
          if (!stickerSetResult) {
            stickerSetResult = await invokeRequest(new GramJs.messages.GetStickerSet({
              stickerset,
              hash: 0,
            }));
            if (stickerSetResult) {
              globalStickerSetCache.set(cacheKey, stickerSetResult);
            }
          }

          const matchingDoc = stickerSetResult?.documents?.find((d: any) => String(d.id) === docId);
          if (matchingDoc && matchingDoc instanceof GramJs.Document) {
            // Store the unrestricted document separately — do NOT overwrite localDb
            // to avoid the file reference repair restoring the restricted version
            unrestrictedDocs.set(docId, matchingDoc);
            globalUnrestrictedDocs.set(docId, matchingDoc);
          }
        } catch (err) {
          // Ignored
        }
      }
    }

    // Step 2: Download renderable blobs using direct InputDocumentFileLocation
    const client = getClient();

    const downloadPromises = emojiEntitiesList.map(async (entity) => {
      const docId = entity.documentId;
      if (!docId) return undefined;

      // Check downloaded blobs cache first to speed up subsequent loads
      const cached = globalDownloadedBlobs.get(docId);
      if (cached) {
        const cachedDoc = unrestrictedDocs.get(docId) || localDb.documents[docId];
        return { blob: cached.blob, docId, emojiDoc: cachedDoc, mimeType: cached.mimeType };
      }

      // Prefer the unrestricted sticker-set doc, fall back to localDb
      const emojiDoc = unrestrictedDocs.get(docId) || localDb.documents[docId];
      if (!emojiDoc || !(emojiDoc instanceof GramJs.Document)) return undefined;

      let result: { blob: Blob; mimeType: string } | undefined;

      if (emojiEntitiesList.length === 1) {
        // Single emoji: download full animated document directly
        result = await downloadDocumentDirect(emojiDoc, client);
      }

      if (!result) {
        // Multiple emojis or single failed: try high-res thumbnail first
        for (const sizeType of ['x', 'm', 's']) {
          result = await downloadDocumentDirect(emojiDoc, client, sizeType);
          if (result) break;
        }
      }

      if (!result) {
        // Final fallback: full document download
        result = await downloadDocumentDirect(emojiDoc, client);
      }

      if (!result) return undefined;

      // Cache downloaded blobs globally
      globalDownloadedBlobs.set(docId, result);

      return { blob: result.blob, docId, emojiDoc, mimeType: result.mimeType };
    });

    const downloadedAssets = await Promise.all(downloadPromises);
    const validAssets = downloadedAssets.filter(Boolean) as { blob: Blob; docId: string; emojiDoc: GramJs.Document; mimeType: string }[];
    
    if (validAssets.length === 0) {
      return undefined;
    }

    let reFile: any;
    let mimeType = "image/webp";
    let ext = "webp";
    let attributes: GramJs.TypeDocumentAttribute[] = [];

    if (validAssets.length === 1) {
      const asset = validAssets[0];
      const isVideo = asset.mimeType.includes("webm") || asset.mimeType.includes("mp4");
      const isTgs = asset.mimeType.includes("tgsticker") || asset.mimeType === "application/x-tgsticker";
      
      if (isTgs) {
        const mergedTgs = await mergeTgsBlobsToSingleSticker([asset.blob]);
        if (mergedTgs) {
          reFile = mergedTgs;
          mimeType = "application/x-tgsticker";
          ext = "tgs";
        } else {
          reFile = asset.blob;
          mimeType = "application/x-tgsticker";
          ext = "tgs";
        }
      } else if (isVideo) {
        reFile = asset.blob;
        mimeType = "video/webm";
        ext = "webm";
      } else {
        const resizedBlob = await mergeEmojisToSingleSticker([asset.blob]);
        if (resizedBlob) {
          reFile = resizedBlob;
          mimeType = "image/webp";
          ext = "webp";
        } else {
          reFile = asset.blob;
          mimeType = asset.mimeType;
          ext = "webp";
        }
      }

      try {
        reFile = new File([reFile], `sticker.${ext}`, { type: mimeType });
      } catch (e) {
        if (reFile) {
          try {
            Object.defineProperty(reFile, "name", {
              value: `sticker.${ext}`,
              writable: true,
              configurable: true,
              enumerable: true,
            });
          } catch (err) {
            (reFile as any).name = `sticker.${ext}`;
          }
        }
      }
      
      const altText = (asset.emojiDoc.attributes?.find((a: any) => a instanceof GramJs.DocumentAttributeSticker) as any)?.alt
        || (asset.emojiDoc.attributes?.find((a: any) => a instanceof GramJs.DocumentAttributeCustomEmoji) as any)?.alt
        || "";
      
      attributes.push(new GramJs.DocumentAttributeSticker({
        alt: altText,
        stickerset: new GramJs.InputStickerSetEmpty(),
      }));
      attributes.push(new GramJs.DocumentAttributeFilename({
        fileName: `spoof_emoji_${asset.docId}_1.${ext}`,
      }));
      
      if (isVideo) {
        attributes.push(new GramJs.DocumentAttributeVideo({
          w: 512,
          h: 512,
          duration: 0,
          nosound: true,
        }));
      } else if (ext === "tgs") {
        attributes.push(new GramJs.DocumentAttributeAnimated());
      } else {
        attributes.push(new GramJs.DocumentAttributeImageSize({
          w: 512,
          h: 512,
        }));
      }
    } else {
      // Check if all custom emojis are Lottie animations to perform animated merging
      const isAllTgs = validAssets.every(a => a.mimeType.includes("tgsticker") || a.mimeType === "application/x-tgsticker");
      let mergedBlob: Blob | undefined;
      let isTgsOutput = false;

      if (isAllTgs) {
        mergedBlob = await mergeTgsBlobsToSingleSticker(validAssets.map(a => a.blob));
        if (mergedBlob) {
          isTgsOutput = true;
          mimeType = "application/x-tgsticker";
          ext = "tgs";
        }
      }

      if (!mergedBlob) {
        // Fallback to single static horizontal WebP sticker
        mergedBlob = await mergeEmojisToSingleSticker(validAssets.map(a => a.blob));
        mimeType = "image/webp";
        ext = "webp";
      }

      if (mergedBlob) {
        reFile = mergedBlob;
        try {
          reFile = new File([mergedBlob], `sticker.${ext}`, { type: mimeType });
        } catch (e) {
          reFile = mergedBlob;
          if (reFile) {
            try {
              Object.defineProperty(reFile, "name", {
                value: `sticker.${ext}`,
                writable: true,
                configurable: true,
                enumerable: true,
              });
            } catch (err) {
              (reFile as any).name = `sticker.${ext}`;
            }
          }
        }
        
        const docIdsJoin = validAssets.map(a => a.docId).join("_");
        attributes.push(new GramJs.DocumentAttributeSticker({
          alt: "",
          stickerset: new GramJs.InputStickerSetEmpty(),
        }));
        attributes.push(new GramJs.DocumentAttributeFilename({
          fileName: `spoof_emoji_merged_${docIdsJoin}_${validAssets.length}.${ext}`,
        }));
        
        if (isTgsOutput) {
          attributes.push(new GramJs.DocumentAttributeAnimated());
        }

        attributes.push(new GramJs.DocumentAttributeImageSize({
          w: 512,
          h: Math.round(512 / validAssets.length),
        }));
      }
    }

    if (reFile) {
      const reInputFile = await uploadFile(reFile);
      if (reInputFile) {
        const media = new GramJs.InputMediaUploadedDocument({
          file: reInputFile,
          mimeType,
          attributes,
        });
        return { media, clearedText: true };
      }
    }
  } catch (err) {
    // Graceful error fallback
  }

  return undefined;
}
