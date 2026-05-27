// =================================================================
// voiceDSP.ts — Advanced Voice Transformation Engine
//
// Phase-vocoder pitch shifting with formant preservation via
// cepstral spectral-envelope analysis. Biquad EQ, breathiness
// synthesis, robotic vocoder, multi-tap delay, soft saturation.
// All processing is 100% local/offline — zero server calls.
// =================================================================

// ── Constants ────────────────────────────────────────────────────
const PV_FFT_SIZE = 4096;
const PV_HOP = PV_FFT_SIZE >> 2; // 75 % overlap = 1024
const CEPSTRAL_ORDER = 50; // quefrency lifter order

// ── Hann Window (cached) ─────────────────────────────────────────
let _hann: Float64Array | undefined;
let _hannN = 0;

function hann(size: number): Float64Array {
  if (_hann && _hannN === size) return _hann;
  _hann = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    _hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  _hannN = size;
  return _hann;
}

// ═════════════════════════════════════════════════════════════════
// Radix-2 Cooley–Tukey FFT / IFFT  (in-place)
// ═════════════════════════════════════════════════════════════════
function fft(re: Float64Array, im: Float64Array): void {
  const N = re.length;
  // bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    while (j & bit) { j ^= bit; bit >>= 1; }
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  // butterfly stages
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    const ang = -2 * Math.PI / len;
    const wR = Math.cos(ang);
    const wI = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cR = 1, cI = 0;
      for (let j = 0; j < half; j++) {
        const p = i + j;
        const q = p + half;
        const tR = cR * re[q] - cI * im[q];
        const tI = cR * im[q] + cI * re[q];
        re[q] = re[p] - tR;
        im[q] = im[p] - tI;
        re[p] += tR;
        im[p] += tI;
        const nR = cR * wR - cI * wI;
        cI = cR * wI + cI * wR;
        cR = nR;
      }
    }
  }
}

function ifft(re: Float64Array, im: Float64Array): void {
  const N = re.length;
  for (let i = 0; i < N; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < N; i++) { re[i] /= N; im[i] = -im[i] / N; }
}

// ═════════════════════════════════════════════════════════════════
// Spectral Envelope — cepstral smoothing
// ═════════════════════════════════════════════════════════════════
function spectralEnvelope(mag: Float64Array, N: number): Float64Array {
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < N; i++) re[i] = Math.log(Math.max(mag[i], 1e-10));
  ifft(re, im);
  // lifter: keep first + last `order` quefrency bins
  const ord = Math.min(CEPSTRAL_ORDER, (N >> 2));
  for (let i = ord + 1; i < N - ord; i++) { re[i] = 0; im[i] = 0; }
  fft(re, im);
  const env = new Float64Array(N);
  for (let i = 0; i < N; i++) env[i] = Math.exp(Math.min(re[i], 20));
  return env;
}

// ═════════════════════════════════════════════════════════════════
// Phase Vocoder Pitch Shift  (time-stretch → resample)
// ═════════════════════════════════════════════════════════════════
function pvPitchShift(input: Float32Array, _sr: number, factor: number): Float32Array {
  if (Math.abs(factor - 1) < 0.001) return new Float32Array(input);

  const N = PV_FFT_SIZE;
  const Ha = PV_HOP;
  const Hs = Math.round(Ha * factor); // synthesis hop
  const win = hann(N);
  const halfN = N >> 1;

  const nFrames = Math.max(1, Math.floor((input.length - N) / Ha) + 1);
  const sLen = (nFrames - 1) * Hs + N;

  const out = new Float64Array(sLen);
  const wSum = new Float64Array(sLen);

  // persistent phase state
  const prevAPhase = new Float64Array(halfN + 1);
  const synPhase = new Float64Array(halfN + 1);

  // pre-allocated per-frame buffers
  const fRe = new Float64Array(N);
  const fIm = new Float64Array(N);
  const sRe = new Float64Array(N);
  const sIm = new Float64Array(N);
  const mag = new Float64Array(halfN + 1);
  const phi = new Float64Array(halfN + 1);
  const TWO_PI = 2 * Math.PI;

  let first = true;

  for (let f = 0; f < nFrames; f++) {
    const aOff = f * Ha;
    const sOff = f * Hs;

    // windowed analysis frame
    fRe.fill(0); fIm.fill(0);
    for (let i = 0; i < N; i++) {
      const idx = aOff + i;
      fRe[i] = idx < input.length ? input[idx] * win[i] : 0;
    }
    fft(fRe, fIm);

    // magnitude + phase  (positive-frequency half only)
    for (let k = 0; k <= halfN; k++) {
      mag[k] = Math.sqrt(fRe[k] * fRe[k] + fIm[k] * fIm[k]);
      phi[k] = Math.atan2(fIm[k], fRe[k]);
    }

    // phase propagation
    if (first) {
      for (let k = 0; k <= halfN; k++) synPhase[k] = phi[k];
      first = false;
    } else {
      for (let k = 0; k <= halfN; k++) {
        const expected = TWO_PI * k * Ha / N;
        let dev = phi[k] - prevAPhase[k] - expected;
        dev -= TWO_PI * Math.round(dev / TWO_PI); // wrap [−π,π]
        const instFreq = (TWO_PI * k / N) + (dev / Ha);
        synPhase[k] += instFreq * Hs;
      }
    }
    prevAPhase.set(phi);

    // reconstruct with conjugate symmetry
    sRe.fill(0); sIm.fill(0);
    for (let k = 0; k <= halfN; k++) {
      sRe[k] = mag[k] * Math.cos(synPhase[k]);
      sIm[k] = mag[k] * Math.sin(synPhase[k]);
    }
    // DC and Nyquist must be real-only for a real-valued signal
    sIm[0] = 0;
    sIm[halfN] = 0;
    for (let k = 1; k < halfN; k++) {
      sRe[N - k] = sRe[k];
      sIm[N - k] = -sIm[k];
    }

    ifft(sRe, sIm);

    // overlap-add
    for (let i = 0; i < N; i++) {
      const idx = sOff + i;
      if (idx < sLen) {
        out[idx] += sRe[i] * win[i];
        wSum[idx] += win[i] * win[i];
      }
    }
  }

  // normalise overlap
  for (let i = 0; i < sLen; i++) {
    if (wSum[i] > 1e-6) out[i] /= wSum[i];
  }

  // resample stretched → original length  (linear interp)
  const result = new Float32Array(input.length);
  const ratio = sLen / input.length;
  for (let i = 0; i < input.length; i++) {
    const src = i * ratio;
    const lo = Math.floor(src);
    const fr = src - lo;
    const s0 = lo < sLen ? out[lo] : 0;
    const s1 = lo + 1 < sLen ? out[lo + 1] : s0;
    result[i] = s0 + fr * (s1 - s0);
  }
  return result;
}

// ═════════════════════════════════════════════════════════════════
// Formant Correction  (post-pitch-shift envelope re-mapping)
//
// After pitch-shifting by `P`, formants have moved by `P`.
// This pass warps the spectral envelope to the desired
// `formantShift` position, independent of pitch.
// ═════════════════════════════════════════════════════════════════
function correctFormants(
  original: Float32Array,
  pitched: Float32Array,
  _sr: number,
  _pitchFactor: number,
  formantShift: number,
): Float32Array {
  // skip if pitch factor ≈ desired formant shift (nothing to correct)
  if (Math.abs(formantShift - _pitchFactor) < 0.02) return new Float32Array(pitched);

  const N = PV_FFT_SIZE;
  const hop = PV_HOP;
  const win = hann(N);
  const halfN = N >> 1;
  const len = pitched.length;
  const nFrames = Math.max(1, Math.floor((len - N) / hop) + 1);

  const out = new Float64Array(len);
  const wSum = new Float64Array(len);

  // reusable buffers
  const reP = new Float64Array(N);
  const imP = new Float64Array(N);
  const reO = new Float64Array(N);
  const imO = new Float64Array(N);
  const magP = new Float64Array(N);
  const magO = new Float64Array(N);
  const phaseP = new Float64Array(N);

  for (let f = 0; f < nFrames; f++) {
    const off = f * hop;

    // ── pitched frame ──
    reP.fill(0); imP.fill(0);
    for (let i = 0; i < N; i++) {
      const idx = off + i;
      reP[i] = idx < len ? pitched[idx] * win[i] : 0;
    }
    fft(reP, imP);
    for (let k = 0; k < N; k++) {
      magP[k] = Math.sqrt(reP[k] * reP[k] + imP[k] * imP[k]);
      phaseP[k] = Math.atan2(imP[k], reP[k]);
    }
    const envP = spectralEnvelope(magP, N);

    // ── original frame (aligned by index) ──
    const oOff = Math.max(0, Math.min(off, original.length - N));
    reO.fill(0); imO.fill(0);
    for (let i = 0; i < N; i++) {
      const idx = oOff + i;
      reO[i] = idx < original.length ? original[idx] * win[i] : 0;
    }
    fft(reO, imO);
    for (let k = 0; k < N; k++) {
      magO[k] = Math.sqrt(reO[k] * reO[k] + imO[k] * imO[k]);
    }
    const envO = spectralEnvelope(magO, N);

    // ── target envelope: original warped by formantShift ──
    const envT = new Float64Array(N);
    for (let k = 0; k <= halfN; k++) {
      const srcBin = k / formantShift;
      const si = Math.floor(srcBin);
      const sf = srcBin - si;
      if (si + 1 <= halfN) {
        envT[k] = envO[si] * (1 - sf) + envO[si + 1] * sf;
      } else if (si <= halfN) {
        envT[k] = envO[si];
      } else {
        envT[k] = envO[halfN];
      }
    }
    for (let k = 1; k < halfN; k++) envT[N - k] = envT[k];

    // ── apply correction: (target / pitched) clamped ──
    for (let k = 0; k < N; k++) {
      const corr = envP[k] > 1e-10 ? envT[k] / envP[k] : 1;
      const clamped = Math.max(0.05, Math.min(corr, 12));
      const newMag = magP[k] * clamped;
      reP[k] = newMag * Math.cos(phaseP[k]);
      imP[k] = newMag * Math.sin(phaseP[k]);
    }

    ifft(reP, imP);

    for (let i = 0; i < N; i++) {
      const idx = off + i;
      if (idx < len) {
        out[idx] += reP[i] * win[i];
        wSum[idx] += win[i] * win[i];
      }
    }
  }

  const result = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = wSum[i] > 1e-6 ? out[i] / wSum[i] : 0;
  }
  return result;
}

// ═════════════════════════════════════════════════════════════════
// Biquad Filter  (Robert Bristow-Johnson cookbook)
// ═════════════════════════════════════════════════════════════════
type BqType = 'lp' | 'hp' | 'bp' | 'peak' | 'loshelf' | 'hishelf' | 'notch';
interface BqC { b0: number; b1: number; b2: number; a1: number; a2: number }

function bq(type: BqType, sr: number, freq: number, Q: number, dB: number): BqC {
  const A = Math.pow(10, dB / 40);
  const w = 2 * Math.PI * freq / sr;
  const c = Math.cos(w);
  const s = Math.sin(w);
  const al = s / (2 * Q);
  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;
  switch (type) {
    case 'lp':
      b1 = 1 - c; b0 = b2 = b1 / 2;
      a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case 'hp':
      b1 = -(1 + c); b0 = b2 = (1 + c) / 2;
      a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case 'bp':
      b0 = al; b1 = 0; b2 = -al;
      a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case 'notch':
      b0 = 1; b1 = -2 * c; b2 = 1;
      a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case 'peak':
      b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A;
      a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; break;
    case 'loshelf': {
      const sA = Math.sqrt(A);
      b0 = A * ((A + 1) - (A - 1) * c + 2 * sA * al);
      b1 = 2 * A * ((A - 1) - (A + 1) * c);
      b2 = A * ((A + 1) - (A - 1) * c - 2 * sA * al);
      a0 = (A + 1) + (A - 1) * c + 2 * sA * al;
      a1 = -2 * ((A - 1) + (A + 1) * c);
      a2 = (A + 1) + (A - 1) * c - 2 * sA * al; break;
    }
    case 'hishelf': {
      const sA = Math.sqrt(A);
      b0 = A * ((A + 1) + (A - 1) * c + 2 * sA * al);
      b1 = -2 * A * ((A - 1) + (A + 1) * c);
      b2 = A * ((A + 1) + (A - 1) * c - 2 * sA * al);
      a0 = (A + 1) - (A - 1) * c + 2 * sA * al;
      a1 = 2 * ((A - 1) - (A + 1) * c);
      a2 = (A + 1) - (A - 1) * c - 2 * sA * al; break;
    }
    default: return { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };
  }
  return { b0: b0! / a0!, b1: b1! / a0!, b2: b2! / a0!, a1: a1! / a0!, a2: a2! / a0! };
}

function applyBq(d: Float32Array, c: BqC): Float32Array {
  const o = new Float32Array(d.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < d.length; i++) {
    const x = d[i];
    const y = c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    o[i] = y; x2 = x1; x1 = x; y2 = y1; y1 = y;
  }
  return o;
}

function bqChain(data: Float32Array, list: BqC[]): Float32Array {
  let d = data;
  for (const c of list) d = applyBq(d, c);
  return d;
}

// ═════════════════════════════════════════════════════════════════
// Breathiness Synthesis — multi-band envelope-modulated noise
//
// Real vocal breathiness spans 1.5–6 kHz across multiple formant
// regions. Three noise layers at different center frequencies
// create a natural "aspirate" quality rather than a narrow hiss.
// ═════════════════════════════════════════════════════════════════
function breathiness(input: Float32Array, sr: number, amt: number): Float32Array {
  if (amt <= 0) return input;
  const len = input.length;
  const out = new Float32Array(len);

  // Three independent noise generators at different spectral regions
  const bands = [
    { freq: 1800, Q: 1.2, gain: 0.35 },  // F2 region aspirate
    { freq: 3200, Q: 1.0, gain: 0.40 },  // F3/presence region
    { freq: 5500, Q: 0.8, gain: 0.25 },  // air / sibilance region
  ];

  // Combined shaped noise
  const shaped = new Float32Array(len);
  for (const b of bands) {
    const noise = new Float32Array(len);
    for (let i = 0; i < len; i++) noise[i] = Math.random() * 2 - 1;
    const filtered = applyBq(noise, bq('bp', sr, b.freq, b.Q, 0));
    for (let i = 0; i < len; i++) shaped[i] += filtered[i] * b.gain;
  }

  // Smooth envelope follower (fast attack / medium release)
  const atkC = Math.exp(-1 / (0.003 * sr));   // ~3ms attack
  const relC = Math.exp(-1 / (0.035 * sr));   // ~35ms release
  let env = 0;
  for (let i = 0; i < len; i++) {
    const a = Math.abs(input[i]);
    env = a > env ? atkC * env + (1 - atkC) * a : relC * env + (1 - relC) * a;
    out[i] = input[i] + shaped[i] * env * amt;
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════
// Soft Saturation — tanh warm harmonic drive
// ═════════════════════════════════════════════════════════════════
function saturate(input: Float32Array, drive: number): Float32Array {
  if (drive <= 0) return input;
  const out = new Float32Array(input.length);
  const g = 1 + drive * 4;
  const norm = 1 / Math.tanh(g);
  for (let i = 0; i < input.length; i++) out[i] = Math.tanh(input[i] * g) * norm;
  return out;
}

// ═════════════════════════════════════════════════════════════════
// Peak Normalise
// ═════════════════════════════════════════════════════════════════
function norm(input: Float32Array, target = 0.95): Float32Array {
  let peak = 0;
  for (let i = 0; i < input.length; i++) {
    const a = Math.abs(input[i]); if (a > peak) peak = a;
  }
  if (peak < 1e-6) return input;
  const g = target / peak;
  const o = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) o[i] = input[i] * g;
  return o;
}

// ═════════════════════════════════════════════════════════════════
// Robotic Vocoder — spectral envelope on a harmonic comb
// ═════════════════════════════════════════════════════════════════
function roboticVocoder(input: Float32Array, sr: number): Float32Array {
  const N = PV_FFT_SIZE;
  const hop = PV_HOP;
  const win = hann(N);
  const halfN = N >> 1;
  const len = input.length;
  const nFrames = Math.max(1, Math.floor((len - N) / hop) + 1);

  const out = new Float64Array(len);
  const wSum = new Float64Array(len);

  const baseFreq = 120; // robotic fundamental Hz
  const binSpace = sr / N;
  const harmStep = Math.max(1, Math.round(baseFreq / binSpace));

  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const mags = new Float64Array(N);
  const rRe = new Float64Array(N);
  const rIm = new Float64Array(N);

  for (let f = 0; f < nFrames; f++) {
    const off = f * hop;
    re.fill(0); im.fill(0);
    for (let i = 0; i < N; i++) {
      const idx = off + i;
      re[i] = idx < len ? input[idx] * win[i] : 0;
    }
    fft(re, im);
    for (let k = 0; k < N; k++) mags[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    const env = spectralEnvelope(mags, N);

    // harmonic comb with spectral-envelope amplitude, zero phases
    rRe.fill(0); rIm.fill(0);
    for (let h = 1; h * harmStep <= halfN; h++) {
      const k = h * harmStep;
      rRe[k] = env[k];
    }
    for (let k = 1; k < halfN; k++) { rRe[N - k] = rRe[k]; rIm[N - k] = 0; }

    ifft(rRe, rIm);

    for (let i = 0; i < N; i++) {
      const idx = off + i;
      if (idx < len) {
        out[idx] += rRe[i] * win[i];
        wSum[idx] += win[i] * win[i];
      }
    }
  }

  const result = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = wSum[i] > 1e-6 ? out[i] / wSum[i] : 0;
  }
  // metallic ring modulation
  const ringHz = 150;
  for (let i = 0; i < len; i++) {
    result[i] *= 0.65 + 0.35 * Math.cos(2 * Math.PI * ringHz * i / sr);
  }
  return result;
}

// ═════════════════════════════════════════════════════════════════
// Multi-Tap Delay (Echo / Cave)
// ═════════════════════════════════════════════════════════════════
function multiTapDelay(input: Float32Array, sr: number): Float32Array {
  const out = new Float32Array(input.length);
  out.set(input);
  const taps = [
    { ms: 95, gain: 0.38 },
    { ms: 220, gain: 0.28 },
    { ms: 370, gain: 0.20 },
    { ms: 550, gain: 0.14 },
    { ms: 730, gain: 0.08 },
  ];
  for (let t = 0; t < taps.length; t++) {
    const ds = Math.round(taps[t].ms * sr / 1000);
    const cutoff = Math.max(1000, 5000 - t * 800); // progressively darker
    const lp = bq('lp', sr, cutoff, 0.707, 0);
    const delayed = new Float32Array(input.length);
    for (let i = ds; i < input.length; i++) delayed[i] = input[i - ds] * taps[t].gain;
    const filtered = applyBq(delayed, lp);
    for (let i = 0; i < input.length; i++) out[i] += filtered[i];
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════
// Voice Presets
// ═════════════════════════════════════════════════════════════════

function processGirl(pcm: Float32Array, sr: number): Float32Array {
  // ── Decouple Pitch Shifting and Formant Scaling ──
  // Raise pitch by ~7 semitones (1.48x) for a slightly higher, clearer feminine register,
  // and scale the vocal tract/formants by 1.18x to shift resonant frequencies naturally.
  const pf = 1.48;
  const fs = 1.18;
  let d = pvPitchShift(pcm, sr, pf);
  d = correctFormants(pcm, d, sr, pf, fs);

  // ── Targeted EQ for natural female vocal characteristics ──
  d = bqChain(d, [
    bq('hp', sr, 190, 0.707, 0),          // steep cut under 190Hz to completely eliminate low male fundamentals
    bq('peak', sr, 240, 2.0, -7.0),       // deep notch at 240Hz to erase chest cavity body
    bq('peak', sr, 650, 1.2, 2.0),        // boost female F1 formant region
    bq('peak', sr, 1900, 1.0, 1.5),       // boost female F2 formant region
    bq('peak', sr, 3100, 0.8, 3.0),       // boost female F3/clarity/presence region
    bq('hishelf', sr, 6000, 0.707, 4.5),  // gorgeous high-end silky air / breathiness shelf
    bq('peak', sr, 4500, 1.5, -2.0),      // slightly tame sibilant harshness
  ]);

  // ── Multi-band breathiness — strong feminine perceptual cue ──
  d = breathiness(d, sr, 0.24);

  // ── Very light warmth saturation ──
  d = saturate(d, 0.06);

  return norm(d);
}

function processDeep(pcm: Float32Array, sr: number): Float32Array {
  const pf = 0.76;
  const fs = 0.92;
  let d = pvPitchShift(pcm, sr, pf);
  d = correctFormants(pcm, d, sr, pf, fs);

  // EQ: bass warmth, chest resonance, reduce harshness / sibilance
  d = bqChain(d, [
    bq('loshelf', sr, 200, 0.707, 3.5),
    bq('peak', sr, 400, 1.0, 2.0),
    bq('hishelf', sr, 5500, 0.707, -3.0),
    bq('peak', sr, 2500, 1.5, -2.0),
  ]);

  // warm saturation
  d = saturate(d, 0.12);
  return norm(d);
}

function processRobotic(pcm: Float32Array, sr: number): Float32Array {
  let d = roboticVocoder(pcm, sr);
  d = bqChain(d, [
    bq('hp', sr, 120, 0.707, 0),
    bq('peak', sr, 1500, 1.0, 3.0),
    bq('lp', sr, 7000, 0.707, 0),
  ]);
  return norm(d);
}

function processChipmunk(pcm: Float32Array, sr: number): Float32Array {
  // intentionally NO formant preservation → cartoon quality
  let d = pvPitchShift(pcm, sr, 1.65);
  d = bqChain(d, [
    bq('hp', sr, 300, 0.707, 0),
    bq('peak', sr, 3500, 1.0, 2.0),
  ]);
  return norm(d);
}

function processEcho(pcm: Float32Array, sr: number): Float32Array {
  let d = multiTapDelay(pcm, sr);
  d = applyBq(d, bq('loshelf', sr, 300, 0.707, 1.5));
  return norm(d);
}

// ═════════════════════════════════════════════════════════════════
// Main Dispatcher
// ═════════════════════════════════════════════════════════════════
export function processVoice(
  pcmData: Float32Array,
  sampleRate: number,
  mode: string,
): Float32Array {
  switch (mode) {
    case 'deep': return processDeep(pcmData, sampleRate);
    case 'girl': return processGirl(pcmData, sampleRate);
    case 'robotic': return processRobotic(pcmData, sampleRate);
    case 'chipmunk': return processChipmunk(pcmData, sampleRate);
    case 'echo': return processEcho(pcmData, sampleRate);
    default: return pcmData;
  }
}
