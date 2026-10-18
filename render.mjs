#!/usr/bin/env node
// Motion studio renderer.
//
//   node render.mjs films/<name>              full render -> out/<name>.mp4 (H.264 yuv420p CRF 16)
//   node render.mjs films/<name> --contact    one frame per beat -> out/<name>.contact.png
//   node render.mjs films/<name> --verify     prove frames are pure functions of t
//   node render.mjs films/<name> --still 3.5  one frame -> out/<name>@3.5.png
//
// Options: --from <s> --to <s> (partial render), --fps <n> (override), --every <beats> --offset <0..1 of a beat> (contact).
//
// Render mode enforces the contract: Math.random throws, CSS transitions/animations are
// disabled, and any setTimeout / setInterval / requestAnimationFrame call fails the render.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { startServer, ROOT } from './tools/serve.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const filmArg = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(from|to|fps|still|every|offset|out)$/));
if (!filmArg) {
  console.error('usage: node render.mjs films/<name> [--contact | --verify | --still <t>] [--from s] [--to s]');
  process.exit(1);
}
const filmDir = path.resolve(filmArg);
const name = path.basename(filmDir);
const rel = path.relative(ROOT, filmDir).split(path.sep).join('/');
const outDir = path.join(ROOT, 'out');
fs.mkdirSync(outDir, { recursive: true });

const beatsPath = path.join(filmDir, 'beats.json');
const beats = fs.existsSync(beatsPath) ? JSON.parse(fs.readFileSync(beatsPath, 'utf8')) : null;

// ---------- contract guard, injected before any film code ----------
const GUARD = `
  window.BEATS = ${JSON.stringify(beats)};
  window.__violations = [];
  const flagIt = (what) => { window.__violations.push(what + ' @ ' + (new Error().stack.split('\\n')[2] || '').trim()); };
  Math.random = () => { flagIt('Math.random'); throw new Error('Math.random is banned: use mulberry32'); };
  for (const fn of ['setTimeout', 'setInterval', 'requestAnimationFrame']) {
    const orig = window[fn].bind(window);
    window[fn] = (...a) => { flagIt(fn); return orig(...a); };
  }
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style');
    s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';
    document.head.appendChild(s);
  });
`;

const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb', '--disable-gpu'],
});

async function openFilm() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(GUARD);
  await page.goto(`${base}/${rel}/index.html?render=1`);
  await page.waitForFunction(() => window.READY === true || window.__violations.length, null, { timeout: 30000 })
    .catch(() => {});
  if (errors.length) throw new Error('film errors:\n  ' + errors.join('\n  '));
  const film = await page.evaluate(() => window.FILM);
  if (!film) throw new Error('film did not set window.FILM / window.seek (call mount() from lib/studio.js)');
  await page.setViewportSize({ width: film.width, height: film.height });
  await page.evaluate(() => document.fonts.ready);
  return { page, film, errors };
}

async function frame(page, t, type = 'png') {
  await page.evaluate((t) => window.seek(t), t);
  return page.screenshot({ type, clip: undefined, animations: 'disabled', caret: 'hide', fullPage: false, omitBackground: false });
}

async function checkViolations(page) {
  const v = await page.evaluate(() => window.__violations);
  if (v.length) {
    console.error(`\ncontract violated (${v.length}):`);
    for (const x of [...new Set(v)].slice(0, 12)) console.error('  ' + x);
    process.exitCode = 2;
    return false;
  }
  return true;
}

function beatTimes(film) {
  const every = +opt('every', 1);
  const list = beats?.beats?.length ? beats.beats : Array.from({ length: Math.floor(film.duration * 2) }, (_, i) => i * 0.5);
  // --offset is a fraction of a beat: 0 = on the hit, 0.5 (default) = settled mid-beat
  const off = +opt('offset', 0.5) * (60 / (beats?.tempo ?? 120));
  return list.filter((_, i) => i % every === 0).map((t) => t + off).filter((t) => t < film.duration);
}

try {
  const { page, film } = await openFilm();
  const fps = +opt('fps', film.fps);

  if (opt('still') !== undefined) {
    const t = +opt('still');
    const png = await frame(page, t);
    const file = path.join(outDir, `${name}@${t}.png`);
    fs.writeFileSync(file, png);
    console.log(file);
  } else if (flag('verify')) {
    // Each sampled frame must be identical whether reached in order, out of order, or twice.
    const n = Math.floor(film.duration * fps);
    const sample = Array.from({ length: 12 }, (_, i) => Math.floor(((i + 0.37) / 12) * n));
    const hash = (b) => crypto.createHash('sha1').update(b).digest('hex');
    const forward = [];
    for (const f of sample) forward.push(hash(await frame(page, f / fps)));
    let bad = 0;
    for (const [k, f] of [...sample.entries()].reverse()) {
      await frame(page, ((f * 7919) % n) / fps); // jump somewhere unrelated first
      const h = hash(await frame(page, f / fps));
      if (h !== forward[k]) { bad++; console.error(`  frame ${f} (t=${(f / fps).toFixed(3)}) differs on revisit`); }
    }
    const clean = await checkViolations(page);
    console.log(bad || !clean ? `verify FAILED (${bad} impure frames)` : `verify ok: ${sample.length} frames pure, no banned APIs`);
    if (bad) process.exitCode = 2;
  } else if (flag('contact')) {
    const times = beatTimes(film);
    const thumbs = [];
    for (const t of times) thumbs.push({ t, src: 'data:image/jpeg;base64,' + (await frame(page, t, 'jpeg')).toString('base64') });
    await checkViolations(page);
    // Thumbnails are ~phone width so readability is judged at the size people see it.
    const tw = film.height > film.width ? 270 : 400;
    const th = Math.round((tw * film.height) / film.width);
    const cols = Math.min(times.length, Math.max(4, Math.floor(2400 / (tw + 12))));
    const sheet = await browser.newPage({ viewport: { width: cols * (tw + 12) + 12, height: 400 } });
    await sheet.setContent(`<!doctype html><style>
      body{margin:0;background:#111;color:#bbb;font:13px/1.2 ui-monospace,monospace;padding:6px}
      .g{display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:12px;padding:6px}
      img{width:${tw}px;height:${th}px;display:block;outline:1px solid #333}
      .l{padding:4px 0 0}</style><div class=g>${thumbs
        .map((x, i) => `<div><img src="${x.src}"><div class=l>#${i * +opt('every', 1)}  ${x.t.toFixed(2)}s</div></div>`)
        .join('')}</div>`);
    const file = path.join(outDir, `${name}.contact.png`);
    await sheet.screenshot({ path: file, fullPage: true });
    console.log(`${file}  (${times.length} frames, ${beats ? 'measured beats' : 'no beats.json: every 0.5s'})`);
  } else {
    const from = +opt('from', 0);
    const to = Math.min(+opt('to', film.duration), film.duration);
    const audio = ['audio.wav', 'track.wav', 'track.mp3'].map((f) => path.join(filmDir, f)).find((f) => fs.existsSync(f));
    const file = path.join(outDir, opt('out', `${name}.mp4`));
    const ff = spawn('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      ...(audio ? ['-ss', String(from), '-i', audio] : []),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      ...(audio ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
      '-movflags', '+faststart', file,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
    const first = Math.round(from * fps), last = Math.round(to * fps);
    const t0 = Date.now();
    for (let f = first; f < last; f++) {
      const png = await frame(page, f / fps);
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - first) % fps === 0) {
        const k = (f - first + 1) / (last - first);
        process.stdout.write(`\r  frame ${f}/${last}  ${(k * 100).toFixed(0)}%  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }
    ff.stdin.end();
    await done;
    const clean = await checkViolations(page);
    console.log(`\n${file}  ${last - first} frames @ ${fps}fps${audio ? ' + ' + path.basename(audio) : ' (silent)'}${clean ? '' : '  [CONTRACT VIOLATED]'}`);
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
