import type { IOpusRecorder } from 'opus-recorder';
import encoderPath from 'opus-recorder/dist/encoderWorker.min.js?url';

import { requestMeasure } from '../lib/fasterdom/fasterdom';

export type Result = {
  blob: Blob;
  duration: number;
  waveform: number[];
  rawPCM?: Float32Array;
  sampleRate?: number;
};

const MIN_RECORDING_TIME = 1000;
const POLYFILL_OPTIONS = { encoderPath, reuseWorker: true };
const BLOB_PARAMS = { type: 'audio/ogg' };
const FFT_SIZE = 64;
const MIN_VOLUME = 0.1;

let opusRecorderPromise: Promise<{ default: IOpusRecorder }>;
let OpusRecorder: IOpusRecorder;
let mediaRecorder: IOpusRecorder;

export async function init() {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  if (!opusRecorderPromise) {
    opusRecorderPromise = import('opus-recorder');
    OpusRecorder = (await opusRecorderPromise).default;
    mediaRecorder = new OpusRecorder(POLYFILL_OPTIONS);
  }

  return opusRecorderPromise;
}

export async function start(analyzerCallback: (volume: number) => void) {
  await startMediaRecorder();

  const startedAt = Date.now();
  let pausedAt: number;
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  const waveform: number[] = [];

  mediaRecorder.ondataavailable = (typedArray) => {
    chunks.push(typedArray);
  };

  const source = mediaRecorder.sourceNode;
  const sampleRate = source.context.sampleRate;
  const rawPCMChunks: Float32Array[] = [];
  const scriptNode = source.context.createScriptProcessor(4096, 1, 1);
  let isRecordingActive = true;

  scriptNode.onaudioprocess = (e) => {
    if (!isRecordingActive) return;
    const inputData = e.inputBuffer.getChannelData(0);
    rawPCMChunks.push(new Float32Array(inputData));
  };
  source.connect(scriptNode);
  scriptNode.connect(source.context.destination);

  const releasePCM = () => {
    isRecordingActive = false;
    try {
      source.disconnect(scriptNode);
      scriptNode.disconnect();
    } catch (e) {
      // ignore
    }
  };

  const releaseAnalyzer = subscribeToAnalyzer(mediaRecorder, (volume: number) => {
    waveform.push(volume * 255);
    analyzerCallback(volume);
  });

  return {
    stop: () => new Promise<Result>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        releasePCM();
        let totalLength = 0;
        for (const chunk of rawPCMChunks) {
          totalLength += chunk.length;
        }
        const rawPCM = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of rawPCMChunks) {
          rawPCM.set(chunk, offset);
          offset += chunk.length;
        }

        resolve({
          blob: new Blob(chunks, BLOB_PARAMS),
          duration: Math.round(((pausedAt || Date.now()) - startedAt) / 1000),
          waveform,
          rawPCM,
          sampleRate,
        });
      };
      mediaRecorder.onerror = reject;

      const delayStop = Math.max(0, startedAt + MIN_RECORDING_TIME - Date.now());
      setTimeout(() => {
        mediaRecorder.stop();
        releaseAnalyzer();
      }, delayStop);
    }),
    pause: () => {
      const delayStop = Math.max(0, startedAt + MIN_RECORDING_TIME - Date.now());
      setTimeout(() => {
        mediaRecorder.pause();
        pausedAt = Date.now();
        releaseAnalyzer();
        releasePCM();
      }, delayStop);
    },
  };
}

async function startMediaRecorder() {
  await init();
  await mediaRecorder.start();
}

function subscribeToAnalyzer(recorder: IOpusRecorder, cb: (volume: number) => void) {
  const source = recorder.sourceNode;
  const analyser = source.context.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  source.connect(analyser);

  const dataLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(dataLength);
  let isDestroyed = false;

  function tick() {
    if (isDestroyed) {
      return;
    }

    analyser.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((acc, current) => acc + current, 0);
    const mean = (sum / dataLength);
    const volume = mean / 255;

    cb(volume < MIN_VOLUME ? 0 : volume);

    requestMeasure(tick);
  }

  tick();

  return () => {
    isDestroyed = true;
  };
}

// Advanced voice DSP engine — phase-vocoder pitch shifting with
// formant preservation, spectral envelope analysis, biquad EQ chain
export { processVoice as processVoicePCM } from './voiceDSP';

// Encode raw Float32Array PCM to Ogg/Opus offline via worker
export function encodePCMToOgg(pcmData: Float32Array, sampleRate: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(encoderPath);
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let headersPending = false;

    worker.onmessage = (e) => {
      const data = e.data;
      if (data.message === 'ready') {
        // Must request OGG header pages (ID + Comment) before sending audio data
        headersPending = true;
        worker.postMessage({ command: 'getHeaderPages' });
      } else if (data.message === 'page') {
        chunks.push(data.page);

        // After header pages are emitted, start sending audio data
        if (headersPending) {
          headersPending = false;
          const bufferLength = 4096;
          let offset = 0;
          while (offset < pcmData.length) {
            const chunk = pcmData.subarray(offset, offset + bufferLength);
            worker.postMessage({
              command: 'encode',
              buffers: [chunk],
            });
            offset += bufferLength;
          }
          worker.postMessage({ command: 'done' });
        }
      } else if (data.message === 'done') {
        worker.terminate();
        resolve(new Blob(chunks, BLOB_PARAMS));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };

    worker.postMessage({
      command: 'init',
      originalSampleRate: sampleRate,
      wavSampleRate: sampleRate,
      encoderSampleRate: 48000,
      encoderApplication: 2049,
      encoderComplexity: 10,
      encoderFrameSize: 20,
      numberOfChannels: 1,
      resampleQuality: 3,
    });
  });
}

