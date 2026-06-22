// @ts-nocheck
let pipelineInstance: any = null;
let loadedModelName: string | null = null;
let transformersModule: any = null;

async function loadTransformers(): Promise<any> {
  if (transformersModule) {
    return transformersModule;
  }

  // @ts-ignore
  const module = await import(
    /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/+esm'
  );

  if (!module || !module.pipeline) {
    throw new Error('Failed to load Transformers library: pipeline not found in ESM module');
  }

  transformersModule = module;
  
  // Configure environment flags immediately after loading
  const { env } = module;
  env.allowLocalModels = false; // Prohibit local directory lookup
  env.backends.onnx.wasm.numThreads = 1; // Stabilize in single-thread WASM execution
  env.backends.onnx.wasm.proxy = false; // Disable proxying/worker threads to prevent silent COOP/COEP block hangs

  return module;
}

async function decodeAudio(arrayBuffer: ArrayBuffer): Promise<Float32Array> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser');
  }
  const audioContext = new AudioContextClass();
  
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (err) {
      console.warn('AudioContext is suspended and could not be resumed automatically:', err);
    }
  }
  
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error('Failed to decode audio data natively:', err);
    throw err;
  } finally {
    void audioContext.close();
  }

  // Whisper models expect 16000Hz mono PCM audio
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.round(audioBuffer.duration * 16000),
    16000
  );

  const bufferSource = offlineCtx.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(offlineCtx.destination);
  bufferSource.start();

  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer.getChannelData(0);
}

export async function isModelLoaded(): Promise<boolean> {
  return pipelineInstance !== null;
}

export async function transcribeLocal(
  audioBlob: Blob,
  onProgress: (percent: number) => void,
  onDownloadStart?: () => void,
  modelName: 'tiny' | 'base' | 'small' = 'base',
  task: 'transcribe' | 'translate' = 'transcribe',
  signal?: AbortSignal
): Promise<string> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const transformers = await loadTransformers();

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const fullModelName = `onnx-community/whisper-${modelName}`;
  if (pipelineInstance && loadedModelName !== fullModelName) {
    pipelineInstance = null;
  }

  if (!pipelineInstance) {
    const activeDownloads: Record<string, { loaded: number; total: number }> = {};
    let hasTriggeredDownloadStart = false;

    const progressCallback = (data: any) => {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      if (data.status === 'progress' && data.file) {
        if (!hasTriggeredDownloadStart && onDownloadStart) {
          hasTriggeredDownloadStart = true;
          onDownloadStart();
        }

        activeDownloads[data.file] = {
          loaded: data.loaded || 0,
          total: data.total || 0,
        };

        let totalBytes = 0;
        let loadedBytes = 0;
        for (const file in activeDownloads) {
          totalBytes += activeDownloads[file].total;
          loadedBytes += activeDownloads[file].loaded;
        }

        if (totalBytes > 0) {
          const overallProgress = Math.min(Math.round((loadedBytes / totalBytes) * 100), 100);
          onProgress(overallProgress);
        }
      } else if (data.status === 'ready') {
        onProgress(100);
      }
    };

    const originalSAB = (window as any).SharedArrayBuffer;
    let didSpoof = false;
    try {
      // Temporarily spoof SharedArrayBuffer as undefined to force the ONNX Runtime feature detector
      // to fallback to the stable, matching single-threaded WASM binaries from its CDN natively.
      if ('SharedArrayBuffer' in window) {
        try {
          (window as any).SharedArrayBuffer = undefined;
          didSpoof = true;
        } catch (e) {
          try {
            Object.defineProperty(window, 'SharedArrayBuffer', {
              value: undefined,
              writable: true,
              configurable: true
            });
            didSpoof = true;
          } catch (e2) {
            console.warn('Could not spoof SharedArrayBuffer:', e2);
          }
        }
      }

      pipelineInstance = await transformers.pipeline('automatic-speech-recognition', fullModelName, {
        device: 'wasm',
        progress_callback: progressCallback,
      });
    } catch (err) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      console.error('Failed to load local speech-to-text pipeline:', err);
      throw err;
    } finally {
      if (didSpoof && originalSAB !== undefined) {
        try {
          (window as any).SharedArrayBuffer = originalSAB;
        } catch (e) {
          try {
            Object.defineProperty(window, 'SharedArrayBuffer', {
              value: originalSAB,
              writable: true,
              configurable: true
            });
          } catch (e2) {
            console.error('Failed to restore SharedArrayBuffer:', e2);
          }
        }
      }
    }

    if (signal?.aborted) {
      pipelineInstance = null;
      throw new DOMException('Aborted', 'AbortError');
    }

    loadedModelName = fullModelName;
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const pcmData = await decodeAudio(arrayBuffer);
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const result = await pipelineInstance(pcmData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: false,
    task: task,
  });

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  return result.text || '';
}
