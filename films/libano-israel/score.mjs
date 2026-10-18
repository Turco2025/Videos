// Score: 80 bpm, 60 s, D minor. Sober: drone, low drums, filtered pulse. Synthesized, no samples.
import { kick, snare, hat, saw, pad, blip, whoosh, impact, midi } from '../../lib/synth.mjs';

export const bpm = 80;
export const duration = 60;
const B = 60 / bpm;

// Scene starts in beats; keep in sync with index.html.
export const CUTS = { S2: 4, S3: 12, S4: 24, S5: 36, S6: 48, S7: 60, S8: 70 };

export function music(bus) {
  // Dm - Bb - Gm - A, one chord per bar
  const prog = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];
  const roots = [26, 22, 19, 21];
  const bars = duration / (4 * B);
  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4 * B, c = bar % 4, beat = bar * 4;
    bus.add(t, 4 * B + 0.8, pad(prog[c].map(midi), 4 * B + 0.8, { a: 1.2, r: 1 }), { gain: 0.09 });
    // the closing section thins out to the pad only
    const quiet = beat >= 70 && beat < 78;
    if (!quiet && beat >= 4) {
      for (let q = 0; q < 4; q++) {
        bus.add(t + q * B, B, saw(midi(roots[c]), B, { cutoff: (u) => 180 + 700 * Math.exp(-u / 0.09), s: 0.35, r: 0.2 }), { gain: 0.26 });
      }
    }
    // arpeggio over the history and 2026 sections
    if (!quiet && (beat >= 12 && beat < 36 || beat >= 48 && beat < 70)) {
      const notes = prog[c].map((n) => n + 12);
      for (let e = 0; e < 8; e++) {
        bus.add(t + e * B / 2, 0.5, blip(midi(notes[(e * 2 + bar) % 3] + (e % 4 === 3 ? 12 : 0)), { decay: 0.22, fm: 0.6 }), { gain: 0.05, pan: e % 2 ? 0.35 : -0.35 });
      }
    }
  }
  const beatsN = Math.round(duration / B);
  const drums = [];
  for (let b = 0; b < beatsN; b++) {
    const t = b * B;
    const quiet = b >= 70 && b < 78;
    if (b === 0 || (!quiet && b >= 4 && b % 2 === 0)) { bus.add(t, 0.8, kick({ f0: 110, f1: 38, decay: 0.45, click: 0.15 }), { gain: 0.85 }); drums.push(t); }
    if (!quiet && b >= 12 && b % 4 === 3) bus.add(t, 0.5, snare(b, { tone: 140, decay: 0.28 }), { gain: 0.2 });
    if (!quiet && b >= 48 && b < 70) bus.add(t + B / 2, 0.1, hat(b * 3, { decay: 0.03 }), { gain: 0.08, pan: 0.3 });
  }
  // last chord rings
  bus.add(78 * B, 2 * B, pad([50, 53, 57, 62].map(midi), 2 * B, { a: 0.05, r: 1.2 }), { gain: 0.08 });
  bus.duck(drums, { depth: 0.3, release: 0.3 });
  bus.reverb({ mix: 0.22, decay: 0.65 });
}

// SFX on the measured grid.
export function sfx(bus, grid) {
  const at = (n) => grid.beats[Math.min(n, grid.beats.length - 1)] ?? n * B;
  bus.add(at(0), 1.6, impact(1), { gain: 0.9 });
  bus.add(at(1), 1.2, impact(2), { gain: 0.5 });
  for (const c of [CUTS.S3, CUTS.S4, CUTS.S7, CUTS.S8]) bus.add(at(c) - 0.5, 0.55, whoosh(c, 0.55), { gain: 0.45 });
  for (const c of [CUTS.S5, CUTS.S6]) bus.add(at(c), 1.6, impact(c), { gain: 0.75 });
  // timeline years and dated entries: a dry tick
  for (const n of [12, 15, 18, 21, 25, 28, 31, 34, 50, 53, 56, 72, 74, 76]) bus.add(at(n), 0.1, blip(midi(86), { decay: 0.05, fm: 3 }), { gain: 0.14 });
  // counters: ticks while the numbers roll
  for (const n of [36, 39, 42, 45, 60, 64]) for (let k = 0; k < 10; k++) bus.add(at(n) + k * 0.06, 0.03, hat(n * 31 + k, { decay: 0.01 }), { gain: 0.09 });
  bus.add(at(78), 1.6, impact(78), { gain: 0.55 });
}
