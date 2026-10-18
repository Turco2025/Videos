// Dark score: 70 bpm, D phrygian. Sub drone with slow beating, dissonant pad clusters
// (minor second + tritone), a heartbeat pulse, inharmonic bells and sub-drop impacts.
// Synthesized, no samples.
import { kick, pad, whoosh, impact, midi, mulberry32, lowpass } from '../../lib/synth.mjs';
import { BPM, BEAT as B, SEGMENTS, RESUMO, DURATION } from './timeline.js';

export const bpm = BPM;
export const duration = DURATION;
const TAU = Math.PI * 2;

// Two detuned sub sines + filtered rumble, swelling slowly.
const drone = (len, f) => {
  const r = mulberry32(7), lp = lowpass(() => 90, 48000);
  return (i, t) => {
    const swell = 0.75 + 0.25 * Math.sin(TAU * t / 23);
    const fade = Math.min(1, t / 4, (len - t) / 6);
    return fade * swell * (0.55 * Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 1.006 * t) + 0.25 * Math.sin(TAU * f * 1.5 * t)
      + 1.6 * lp(r() * 2 - 1, t));
  };
};

// Inharmonic FM bell, long decay.
const bell = (f, { decay = 2.8, ratio = 1.41, index = 3 } = {}) => (i, t) =>
  Math.sin(TAU * f * t + index * Math.exp(-t / 0.6) * Math.sin(TAU * f * ratio * t)) * Math.exp(-t / decay);

// Heartbeat: lub-dub.
const heart = () => {
  const a = kick({ f0: 70, f1: 38, decay: 0.22, click: 0.05 }), b = kick({ f0: 60, f1: 36, decay: 0.18, click: 0.03 });
  return (i, t) => a(i, t) + (t > 0.26 ? 0.6 * b(i - Math.round(0.26 * 48000), t - 0.26) : 0);
};

const segAt = (beat) => SEGMENTS.find((s) => beat >= s.start && beat < s.end) ?? SEGMENTS[SEGMENTS.length - 1];

export function music(bus) {
  bus.add(0, duration, drone(duration, midi(26)), { gain: 0.5 });
  // clusters, one per two bars: Dm(b2), Bb(#11), Gm(b2), A(b9)
  const clusters = [[50, 51, 57], [46, 50, 52], [43, 44, 50], [45, 46, 52]];
  const bars = Math.ceil(duration / (4 * B));
  for (let bar = 0; bar < bars; bar += 2) {
    const t = bar * 4 * B, beat = bar * 4, seg = segAt(beat);
    const c = clusters[(bar / 2) % 4];
    const len = 8 * B + 1.5;
    bus.add(t, len, pad(c.map(midi), len, { a: 2.5, r: 1.5 }), { gain: seg.type === 'fontes' ? 0.05 : 0.09, pan: -0.2 });
    // high tritone shimmer, quiet
    bus.add(t + 2 * B, len - 2 * B, pad([midi(c[0] + 24), midi(c[0] + 30)], len - 2 * B, { a: 3, r: 1.5 }), { gain: 0.025, pan: 0.4 });
  }
  const beatsN = Math.round(duration / B);
  const beatsOut = [];
  for (let b = 0; b < beatsN; b++) {
    const t = b * B, seg = segAt(b);
    if (seg.type === 'fontes' && b > seg.start + 8) continue;
    // heartbeat every two beats from beat 4, every beat during the Lava Jato chapters
    const fast = b >= 92 && b < 246;
    if (b >= 4 && (fast || b % 2 === 0)) { bus.add(t, 0.8, heart(), { gain: 0.75 }); beatsOut.push(t); }
    // low bell every 8 beats
    if (b % 8 === 0) bus.add(t, 3.5, bell(midi(50), { decay: 2.5 }), { gain: 0.08, pan: b % 16 ? 0.3 : -0.3 });
  }
  bus.duck(beatsOut, { depth: 0.2, release: 0.3 });
  bus.reverb({ mix: 0.3, decay: 0.72 });
}

// SFX on the measured grid.
export function sfx(bus, grid) {
  const at = (n) => {
    const i = Math.floor(n), f = n - i;
    const a = grid.beats[Math.min(i, grid.beats.length - 1)] ?? i * B;
    const b = grid.beats[Math.min(i + 1, grid.beats.length - 1)] ?? a + B;
    return a + (b - a) * f;
  };
  bus.add(at(0), 2.5, impact(1), { gain: 0.9 });
  for (const n of [1, 2, 3]) bus.add(at(n), 3, bell(midi(38 + n), { decay: 2, index: 5 }), { gain: 0.25 });
  for (const s of SEGMENTS) {
    if (s.start > 0) bus.add(at(s.start) - 1.2, 1.2, whoosh(s.start, 1.2, { lo: 120, hi: 3500 }), { gain: 0.32 });
    if (s.type === 'chapter') {
      bus.add(at(s.start), 2.5, impact(s.start), { gain: 0.9 });
      bus.add(at(s.start), 4, bell(midi(31), { decay: 3.5, index: 6, ratio: 1.37 }), { gain: 0.3 });
    }
    if (s.type === 'case') {
      for (const c of s.clips) bus.add(at(s.start + c.at) - 0.15, 0.35, whoosh(c.at * 13 + s.start, 0.35, { lo: 1200, hi: 7000 }), { gain: 0.22, pan: 0.4 });
      for (const st of s.stamps) {
        bus.add(at(s.start + st.at), 1.6, impact(st.at * 7 + s.start), { gain: 0.6 });
        bus.add(at(s.start + st.at), 2.5, bell(midi(45), { decay: 1.6, index: 4, ratio: 1.53 }), { gain: 0.16 });
      }
    }
    if (s.type === 'lista') for (let i = 0; i < s.rows.length; i++) bus.add(at(s.start + 2 + i * 2.4), 1.2, impact(900 + i), { gain: 0.45 });
  }
  const res = SEGMENTS.find((s) => s.type === 'resumo');
  RESUMO.forEach((_, i) => bus.add(at(res.start + 1.5 + i * 0.75), 1.5, bell(midi(57 - (i % 4) * 2), { decay: 0.9, index: 2 }), { gain: 0.07 }));
}
