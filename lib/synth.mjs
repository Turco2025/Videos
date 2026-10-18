// Offline synth for scores and SFX. Node-side, deterministic, no dependencies.
// Every voice writes into a stereo Bus at an absolute time, so the score is a pure
// function of its inputs, exactly like the picture.
import fs from 'node:fs';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
const TAU = Math.PI * 2;

export class Bus {
  constructor(duration, sr = 48000) {
    this.sr = sr;
    this.n = Math.ceil(duration * sr);
    this.L = new Float32Array(this.n);
    this.R = new Float32Array(this.n);
  }
  // Add a mono voice fn(i, tSec) -> sample, from t for len seconds, panned -1..1.
  add(t, len, fn, { gain = 1, pan = 0 } = {}) {
    const s0 = Math.max(0, Math.round(t * this.sr));
    const s1 = Math.min(this.n, Math.round((t + len) * this.sr));
    const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    for (let s = s0; s < s1; s++) {
      const v = fn(s - s0, (s - s0) / this.sr);
      this.L[s] += v * gl;
      this.R[s] += v * gr;
    }
  }
  mixIn(other, gain = 1) {
    for (let i = 0; i < Math.min(this.n, other.n); i++) { this.L[i] += other.L[i] * gain; this.R[i] += other.R[i] * gain; }
  }
  // Sidechain-style ducking keyed on given times.
  duck(times, { depth = 0.6, release = 0.22 } = {}) {
    const g = new Float32Array(this.n).fill(1);
    for (const t of times) {
      const s0 = Math.round(t * this.sr);
      for (let s = s0; s < Math.min(this.n, s0 + release * 4 * this.sr); s++) {
        const k = 1 - depth * Math.exp(-(s - s0) / (release * this.sr));
        if (k < g[s]) g[s] = k;
      }
    }
    for (let i = 0; i < this.n; i++) { this.L[i] *= g[i]; this.R[i] *= g[i]; }
  }
  // Cheap stereo room: a few feedback combs per side.
  reverb({ mix = 0.18, decay = 0.6 } = {}) {
    const taps = [[1557, 1617, 1491, 1422], [1277, 1356, 1188, 1116]];
    const outs = [this.L, this.R].map((x, ch) => {
      const y = new Float32Array(this.n);
      for (const d0 of taps[ch]) {
        const d = Math.round((d0 * this.sr) / 44100);
        const buf = new Float32Array(this.n);
        for (let i = 0; i < this.n; i++) buf[i] = x[i] + (i >= d ? buf[i - d] * decay : 0);
        for (let i = 0; i < this.n; i++) y[i] += buf[i] * 0.25;
      }
      return y;
    });
    for (let i = 0; i < this.n; i++) {
      this.L[i] = this.L[i] * (1 - mix) + outs[0][i] * mix;
      this.R[i] = this.R[i] * (1 - mix) + outs[1][i] * mix;
    }
  }
  writeWav(file) {
    const n = this.n, buf = Buffer.alloc(44 + n * 4);
    buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
    buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
    buf.writeUInt32LE(this.sr, 24); buf.writeUInt32LE(this.sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
    buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
    let peak = 0;
    for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(this.L[i]), Math.abs(this.R[i]));
    const k = peak > 0.98 ? 0.98 / peak : 1; // headroom only; loudness is set by ffmpeg later
    for (let i = 0; i < n; i++) {
      buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, this.L[i] * k)) * 32767), 44 + i * 4);
      buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, this.R[i] * k)) * 32767), 46 + i * 4);
    }
    fs.writeFileSync(file, buf);
  }
}

// ---------- envelopes & filters ----------
export const adsr = (t, len, a = 0.005, d = 0.1, s = 0.7, r = 0.1) =>
  t < a ? t / a : t < a + d ? 1 - (1 - s) * ((t - a) / d) : t < len - r ? s : Math.max(0, s * ((len - t) / r));

// One-pole lowpass as a stateful closure (state lives inside a single voice only).
export function lowpass(cutoffFn, sr) {
  let y = 0;
  return (x, t) => { const a = 1 - Math.exp((-TAU * cutoffFn(t)) / sr); y += a * (x - y); return y; };
}

// ---------- voices: each returns fn(i, t) ----------
export const kick = ({ f0 = 150, f1 = 42, decay = 0.32, click = 0.25 } = {}) => {
  let ph = 0;
  return (i, t) => {
    const f = f1 + (f0 - f1) * Math.exp(-t / 0.035);
    ph += (TAU * f) / 48000;
    return Math.tanh(1.6 * Math.sin(ph) * Math.exp(-t / decay)) + click * Math.exp(-t / 0.002) * (i % 2 ? 1 : -1);
  };
};

export const snare = (seed = 1, { tone = 190, decay = 0.16 } = {}) => {
  const r = mulberry32(seed), hp = { x: 0, y: 0 };
  return (i, t) => {
    const n = r() * 2 - 1;
    const h = 0.9 * (hp.y + n - hp.x); hp.x = n; hp.y = h; // highpass the noise
    return h * Math.exp(-t / decay) * 0.8 + Math.sin(TAU * tone * t) * Math.exp(-t / 0.05) * 0.5;
  };
};

export const hat = (seed = 2, { decay = 0.035 } = {}) => {
  const r = mulberry32(seed), hp = { x: 0, y: 0 };
  return (i, t) => {
    const n = r() * 2 - 1;
    const h = 0.6 * (hp.y + n - hp.x); hp.x = n; hp.y = h;
    return h * Math.exp(-t / decay);
  };
};

// Detuned saw through a lowpass: bass and leads.
export const saw = (freq, len, { detune = 0.006, cutoff = (t) => 900, voices = 3, a = 0.004, d = 0.12, s = 0.6, r = 0.08 } = {}) => {
  const lp = lowpass(cutoff, 48000);
  return (i, t) => {
    let v = 0;
    for (let k = 0; k < voices; k++) {
      const f = freq * (1 + detune * (k - (voices - 1) / 2));
      v += 2 * ((t * f + k * 0.31) % 1) - 1;
    }
    return lp(v / voices, t) * adsr(t, len, a, d, s, r);
  };
};

// Soft pad: stacked sines with slow attack.
export const pad = (freqs, len, { a = 0.6, r = 0.8 } = {}) => (i, t) => {
  let v = 0;
  for (const f of freqs) v += Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2.003 * t);
  return (v / freqs.length) * adsr(t, len, a, 0.2, 0.8, r);
};

// Pluck / blip for UI hits.
export const blip = (freq, { decay = 0.08, fm = 2 } = {}) => (i, t) =>
  Math.sin(TAU * freq * t + fm * Math.sin(TAU * freq * 2 * t) * Math.exp(-t / 0.02)) * Math.exp(-t / decay);

// Filtered noise sweep: whooshes and risers. dir=+1 rises, -1 falls.
export const whoosh = (seed, len, { dir = 1, lo = 300, hi = 6000 } = {}) => {
  const r = mulberry32(seed);
  const lp = lowpass((t) => { const k = dir > 0 ? t / len : 1 - t / len; return lo * Math.pow(hi / lo, k); }, 48000);
  return (i, t) => lp(r() * 2 - 1, t) * Math.sin((Math.PI * t) / len) ** 2;
};

// Low impact: sub drop + noise burst.
export const impact = (seed = 9) => {
  const k = kick({ f0: 90, f1: 30, decay: 0.9, click: 0.4 }), n = snare(seed, { tone: 80, decay: 0.3 });
  return (i, t) => k(i, t) * 0.9 + n(i, t) * 0.4;
};
