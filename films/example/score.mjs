// Score for the example film: 120 bpm, 16 s, A minor. Synthesized, no samples.
import { kick, snare, hat, saw, pad, blip, whoosh, impact, midi } from '../../lib/synth.mjs';

export const bpm = 120;
export const duration = 16;
const B = 60 / bpm;

// Scene starts in beats; keep in sync with index.html SCENES.
const CUTS = [4, 10, 16, 23];

export function music(bus) {
  const bars = Math.ceil(duration / (4 * B));
  // Am - F - C - G
  const prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const roots = [33, 29, 36, 31];
  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4 * B, c = bar % 4;
    bus.add(t, 4 * B + 0.6, pad(prog[c].map(midi), 4 * B + 0.6), { gain: 0.07 });
    // bass: 8ths with an octave pop on the "and" of 4
    for (let e = 0; e < 8; e++) {
      if (bar < 1 && e < 4) continue;
      const n = roots[c] + (e === 7 ? 12 : 0);
      bus.add(t + e * B / 2, B / 2, saw(midi(n), B / 2, { cutoff: (u) => 300 + 1600 * Math.exp(-u / 0.06), s: 0.5 }), { gain: 0.22 });
    }
  }
  const beatsN = Math.round(duration / B);
  for (let b = 0; b < beatsN; b++) {
    const t = b * B;
    if (b >= 2 || b === 0) bus.add(t, 0.5, kick(), { gain: 0.8 });
    if (b >= 4 && b % 2 === 1) bus.add(t, 0.3, snare(b), { gain: 0.32 });
    if (b >= 4) {
      bus.add(t + B / 2, 0.1, hat(b * 3), { gain: 0.16, pan: 0.3 });
      if (b >= 16) bus.add(t + B / 4, 0.06, hat(b * 5, { decay: 0.02 }), { gain: 0.08, pan: -0.3 });
    }
  }
  // tail: last chord rings out on the final downbeat
  bus.add(30 * B, 2 * B, pad(prog[0].map((n) => midi(n + 12)), 2 * B, { a: 0.02, r: 0.6 }), { gain: 0.06 });
  bus.duck(Array.from({ length: beatsN }, (_, b) => b * B), { depth: 0.35 });
  bus.reverb({ mix: 0.14 });
}

// SFX land on the measured grid (beats.json), not on nominal math.
export function sfx(bus, grid) {
  const at = (n) => grid.beats[Math.min(n, grid.beats.length - 1)] ?? n * B;
  bus.add(at(0), 1.4, impact(1), { gain: 0.9 });
  for (const c of CUTS) bus.add(at(c) - 0.42, 0.45, whoosh(c, 0.45, { dir: 1 }), { gain: 0.5 });
  // f(t) counter ticks, beats 1-3
  for (const n of [1, 2, 3]) bus.add(at(n), 0.12, blip(midi(81 + n * 2)), { gain: 0.18 });
  // frame cells flipping in scene 2
  for (let n = 5; n < 10; n++) bus.add(at(n), 0.1, blip(midi(88), { decay: 0.04, fm: 4 }), { gain: 0.12, pan: -0.4 + (n - 5) * 0.2 });
  // grid reshuffles in scene 3
  for (let n = 11; n < 16; n++) bus.add(at(n), 0.08, blip(midi(76 + (n % 3) * 5), { decay: 0.05, fm: 1 }), { gain: 0.13 });
  // strike-through and endcard underline
  bus.add(at(12), 0.35, whoosh(77, 0.35, { dir: -1, lo: 800, hi: 9000 }), { gain: 0.35 });
  bus.add(at(28), 1.2, impact(5), { gain: 0.55 });
  // typing ticks for the command line, 32nds from beat 25
  for (let k = 0; k < 31; k++) bus.add(at(25) + k * B / 8, 0.03, hat(500 + k, { decay: 0.008 }), { gain: 0.1, pan: 0.2 });
}
