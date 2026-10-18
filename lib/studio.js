// Browser-side runtime shared by every film.
// The contract: window.seek(t) paints frame t, and nothing else does.
// Everything here is pure: same t in, same pixels out.

export const RENDER = new URLSearchParams(location.search).has('render');

// ---------- seeded randomness (never Math.random) ----------
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stateless hash -> [0,1). Use for per-item values: rand(seed, i).
export function rand(seed, i = 0, j = 0) {
  return mulberry32((seed * 73856093) ^ (i * 19349663) ^ (j * 83492791))();
}

// 1D value noise, seeded and smooth. noise(seed, x) in [-1,1].
export function noise(seed, x) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = rand(seed, i) * 2 - 1, b = rand(seed, i + 1) * 2 - 1;
  return a + (b - a) * u;
}

// ---------- maths ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
// Progress of t through [a,b], clamped to 0..1.
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const mix = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

export const ease = {
  linear: (x) => x,
  inQuad: (x) => x * x,
  outQuad: (x) => 1 - (1 - x) * (1 - x),
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuart: (x) => 1 - Math.pow(1 - x, 4),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: (x) =>
    x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
};

// Closed-form damped spring from 0 to 1. Pure in t (seconds since start).
export function spring(t, { freq = 2.2, damping = 0.45 } = {}) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const z = damping;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
}

// ---------- beat grid (measured, from beats.json) ----------
// render.mjs injects window.BEATS; preview fetches it.
export function beatGrid(data) {
  const beats = data?.beats ?? [];
  const downbeats = data?.downbeats ?? [];
  const idx = (t) => {
    let lo = 0, hi = beats.length - 1, r = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (beats[m] <= t) { r = m; lo = m + 1; } else hi = m - 1;
    }
    return r;
  };
  return {
    tempo: data?.tempo ?? 120,
    beats,
    downbeats,
    at: (n) => beats[Math.max(0, Math.min(beats.length - 1, n))] ?? n * (60 / (data?.tempo ?? 120)),
    index: idx,
    // Seconds since the last beat (Infinity before the first).
    since: (t) => { const i = idx(t); return i < 0 ? Infinity : t - beats[i]; },
    // Exponential hit envelope: 1 on the beat, decays with `decay` seconds.
    pulse: (t, decay = 0.18) => { const i = idx(t); return i < 0 ? 0 : Math.exp(-(t - beats[i]) / decay); },
  };
}

// ---------- fonts ----------
export async function loadFonts(specs) {
  await Promise.all(specs.map((s) => document.fonts.load(s)));
  await document.fonts.ready;
}

// ---------- mount ----------
// film = { width, height, fps, duration, setup?(ctx) async, draw(ctx, t) }
export async function mount(film) {
  const canvas = document.createElement('canvas');
  canvas.width = film.width;
  canvas.height = film.height;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const beatsData = window.BEATS ?? (await fetch('beats.json').then((r) => (r.ok ? r.json() : null)).catch(() => null));
  const beats = beatGrid(beatsData);
  const env = { ctx, canvas, beats, W: film.width, H: film.height };
  if (film.setup) await film.setup(env);

  window.FILM = { width: film.width, height: film.height, fps: film.fps, duration: film.duration };
  window.seek = (t) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, film.width, film.height);
    film.draw(env, t);
    ctx.restore();
  };
  window.seek(0);
  window.READY = true;

  if (!RENDER) preview(film, canvas);
}

// Preview player: the only place requestAnimationFrame is allowed.
function preview(film, canvas) {
  document.body.classList.add('preview');
  const audio = new Audio('audio.wav');
  const bar = document.createElement('input');
  Object.assign(bar, { type: 'range', min: 0, max: film.duration, step: 1 / film.fps, value: 0 });
  bar.className = 'scrub';
  document.body.appendChild(bar);
  let playing = false, t0 = 0, start = 0, t = 0;
  const fit = () => {
    const k = Math.min((innerWidth * 0.96) / film.width, (innerHeight * 0.9) / film.height);
    canvas.style.width = film.width * k + 'px';
    canvas.style.height = film.height * k + 'px';
  };
  addEventListener('resize', fit); fit();
  const loop = (now) => {
    if (playing) {
      t = audio.readyState >= 2 && !audio.paused ? audio.currentTime : t0 + (now - start) / 1000;
      if (t >= film.duration) { t = 0; t0 = 0; start = now; audio.currentTime = 0; }
      bar.value = t;
      window.seek(Math.floor(t * film.fps) / film.fps);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  const toggle = () => {
    playing = !playing;
    t0 = +bar.value; start = performance.now();
    if (playing) { audio.currentTime = t0; audio.play().catch(() => {}); } else audio.pause();
  };
  addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
  canvas.addEventListener('click', toggle);
  bar.addEventListener('input', () => { playing = false; audio.pause(); window.seek(+bar.value); });
}
