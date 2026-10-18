#!/usr/bin/env node
// Build a film's soundtrack:  node tools/audio.mjs films/<name>
//
// 1. Music: films/<name>/track.wav|mp3 if supplied, else score.mjs `music()` is synthesized.
// 2. Beat grid: measured from the music by tools/beats.py -> beats.json.
// 3. SFX: score.mjs `sfx(bus, beats)` places hits on the measured grid.
// 4. Loudness: two-pass ffmpeg loudnorm to -14 LUFS integrated, -1 dBTP -> audio.wav.
//
// score.mjs exports: { bpm, duration, music(bus), sfx?(bus, beats) }  (Bus from lib/synth.mjs)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Bus } from '../lib/synth.mjs';

const dir = path.resolve(process.argv[2] ?? '');
if (!process.argv[2] || !fs.existsSync(dir)) { console.error('usage: node tools/audio.mjs films/<name>'); process.exit(1); }
const p = (f) => path.join(dir, f);
const LUFS = -14;

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`${cmd} failed:\n${r.stderr || r.stdout}`);
  return r;
};
const python = () => {
  for (const py of process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python']) {
    if (!spawnSync(py, ['-c', 'import librosa'], { encoding: 'utf8' }).status) return py;
  }
  throw new Error('no python with librosa found: pip install numpy librosa soundfile');
};

const score = fs.existsSync(p('score.mjs')) ? await import(pathToFileURL(p('score.mjs')).href) : {};
const track = ['track.wav', 'track.mp3', 'track.flac'].map(p).find(fs.existsSync);

// 1. music
let musicFile;
if (track) {
  musicFile = track;
  console.log(`music: supplied ${path.basename(track)}`);
} else if (score.music) {
  const bus = new Bus(score.duration);
  score.music(bus);
  musicFile = p('music.wav');
  bus.writeWav(musicFile);
  console.log(`music: synthesized ${score.duration}s @ ${score.bpm ?? '?'} bpm`);
} else {
  console.error('nothing to do: add track.wav or a score.mjs with music()'); process.exit(1);
}

// 2. measured beat grid
const r = run(python(), [path.resolve(import.meta.dirname, 'beats.py'), musicFile, p('beats.json'), ...(score.bpm ? ['--bpm', String(score.bpm)] : [])]);
process.stdout.write('beats: ' + r.stdout);
const beats = JSON.parse(fs.readFileSync(p('beats.json'), 'utf8'));

// 3. sfx on the grid, mixed over the music
let mixFile = musicFile;
if (score.sfx) {
  const dur = score.duration ?? beats.duration;
  const music = new Bus(dur);
  // re-decode music to float via ffmpeg so supplied tracks mix the same way
  const raw = run('ffmpeg', ['-loglevel', 'error', '-i', musicFile, '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], { encoding: 'buffer', maxBuffer: 1 << 30 }).stdout;
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  for (let i = 0; i < music.n && 2 * i + 1 < f.length; i++) { music.L[i] = f[2 * i]; music.R[i] = f[2 * i + 1]; }
  const sfx = new Bus(dur);
  score.sfx(sfx, beats, music);
  music.mixIn(sfx);
  mixFile = p('mix_raw.wav');
  music.writeWav(mixFile);
  console.log('sfx: placed on measured grid');
}

// 4. loudness: two-pass loudnorm
const ln = `loudnorm=I=${LUFS}:TP=-1:LRA=11`;
const pass1 = run('ffmpeg', ['-hide_banner', '-i', mixFile, '-af', ln + ':print_format=json', '-f', 'null', '-']).stderr;
const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{'), pass1.lastIndexOf('}') + 1));
run('ffmpeg', ['-y', '-loglevel', 'error', '-i', mixFile, '-af',
  `${ln}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-ar', '48000', '-c:a', 'pcm_s16le', p('audio.wav')]);
const check = run('ffmpeg', ['-hide_banner', '-i', p('audio.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr;
const I = check.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.replace(/\s+/g, " ");
const TP = check.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.replace(/\s+/g, " ");
console.log(`loudness: ${m.input_i} LUFS in -> ${I} | true peak ${TP}  (target ${LUFS} LUFS)`);
console.log(p('audio.wav'));
