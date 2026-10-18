// Score: 90 bpm, A minor, investigative. Drone, filtered pulse, ticking hats; hits on
// chapter cuts, clippings and verdict stamps. Synthesized, no samples.
import { kick, snare, hat, saw, pad, blip, whoosh, impact, midi } from '../../lib/synth.mjs';
import { BPM, BEAT as B, SEGMENTS, PLACAR, DURATION } from './timeline.js';

export const bpm = BPM;
export const duration = DURATION;

const segAt = (beat) => SEGMENTS.find((s) => beat >= s.start && beat < s.end) ?? SEGMENTS[SEGMENTS.length - 1];

export function music(bus) {
  // Am - F - C - E, one chord per bar
  const prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 56, 59]];
  const roots = [33, 29, 36, 28];
  const bars = Math.ceil(duration / (4 * B));
  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4 * B, c = bar % 4, beat = bar * 4;
    const seg = segAt(beat);
    bus.add(t, 4 * B + 0.8, pad(prog[c].map(midi), 4 * B + 0.8, { a: 0.9, r: 0.9 }), { gain: 0.08 });
    if (beat < 8 || seg.type === 'fontes') continue;
    // muted 8th-note pulse
    for (let e = 0; e < 8; e++) {
      bus.add(t + e * B / 2, B / 2, saw(midi(roots[c] + (e === 6 ? 7 : 0)), B / 2, { cutoff: (u) => 160 + 900 * Math.exp(-u / 0.05), s: 0.3, r: 0.05 }), { gain: 0.2 });
    }
  }
  const beatsN = Math.round(duration / B);
  const drums = [];
  for (let b = 0; b < beatsN; b++) {
    const t = b * B, seg = segAt(b);
    if (seg.type === 'fontes') continue;
    const lava = b >= 108 && b < 234;
    if (b === 0 || (b >= 8 && b % 2 === 0)) { bus.add(t, 0.7, kick({ f0: 120, f1: 40, decay: 0.38, click: 0.2 }), { gain: 0.8 }); drums.push(t); }
    if (lava && b % 4 === 3) bus.add(t, 0.4, snare(b, { tone: 170, decay: 0.2 }), { gain: 0.22 });
    if (b >= 16) for (let s = 0; s < 4; s++) bus.add(t + s * B / 4, 0.05, hat(b * 7 + s, { decay: s % 2 ? 0.012 : 0.02 }), { gain: s % 2 ? 0.04 : 0.07, pan: 0.25 });
  }
  bus.add((SEGMENTS.at(-1).start) * B, 12 * B, pad([45, 57, 60, 64].map(midi), 12 * B, { a: 0.1, r: 3 }), { gain: 0.09 });
  bus.duck(drums, { depth: 0.3, release: 0.25 });
  bus.reverb({ mix: 0.18, decay: 0.6 });
}

// SFX on the measured beat grid.
export function sfx(bus, grid) {
  const at = (n) => {
    const i = Math.floor(n), f = n - i;
    const a = grid.beats[Math.min(i, grid.beats.length - 1)] ?? i * B;
    const b = grid.beats[Math.min(i + 1, grid.beats.length - 1)] ?? a + B;
    return a + (b - a) * f;
  };
  bus.add(at(0), 1.6, impact(1), { gain: 0.9 });
  bus.add(at(8), 1.2, impact(2), { gain: 0.45 });
  for (const s of SEGMENTS) {
    if (s.start > 0) bus.add(at(s.start) - 0.4, 0.42, whoosh(s.start, 0.42), { gain: 0.3 });
    if (s.type === 'chapter') bus.add(at(s.start), 1.6, impact(s.start), { gain: 0.8 });
    if (s.type !== 'case') continue;
    for (const p of s.paras) bus.add(at(s.start + p.at), 0.1, blip(midi(84), { decay: 0.05, fm: 2.5 }), { gain: 0.1 });
    // clippings: a short bright paper swish
    for (const c of s.clips) bus.add(at(s.start + c.at) - 0.12, 0.3, whoosh(c.at * 13 + s.start, 0.3, { lo: 1500, hi: 9000 }), { gain: 0.3, pan: 0.4 });
    // stamps: thump
    for (const st of s.stamps) {
      bus.add(at(s.start + st.at), 0.9, kick({ f0: 90, f1: 45, decay: 0.25, click: 0.5 }), { gain: 0.7 });
      bus.add(at(s.start + st.at), 0.3, snare(st.at * 17, { tone: 120, decay: 0.09 }), { gain: 0.35 });
    }
  }
  const plac = SEGMENTS.find((s) => s.type === 'placar');
  PLACAR.forEach((_, i) => bus.add(at(plac.start + 2 + i), 0.1, blip(midi(79 + (i % 3) * 2), { decay: 0.06, fm: 1.5 }), { gain: 0.12 }));
  bus.add(at(plac.start + 15), 1.4, impact(77), { gain: 0.55 });
}
