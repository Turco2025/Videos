# Motion studio rules

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode, no state
  carried between frames. Seeded noise only (`mulberry32` / `rand` / `noise` in `lib/studio.js`), never `Math.random`.
- Render with `node render.mjs films/<name>`, encode H.264 yuv420p, CRF 16 (render.mjs does this).
- `node render.mjs films/<name> --verify` must pass before any full render. Render mode makes
  `Math.random` throw and fails the render on any timer/rAF call.

## Look
- Banned defaults: centered title on gradient, everything fading in, corner labels and
  frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. One accent color unless the brief says otherwise.
- Every 2 to 4 seconds something new must happen on screen.
- Type never leaves the safe area (70px side margins at 1080 wide); shrink to fit, don't crop by accident.

## Sound
- Score and SFX are synthesized in code (`films/<name>/score.mjs`, voices in `lib/synth.mjs`)
  unless a track is supplied (`films/<name>/track.wav|mp3`).
- Place hits on the measured beat grid (`beats.json` from `tools/beats.py`), never on nominal bpm math.
- Loudness -14 LUFS integrated, -1 dBTP. `node tools/audio.mjs films/<name>` builds and normalizes it.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet (`node render.mjs films/<name> --contact`) and LOOK at it.
   Default samples mid-beat (settled state); `--offset 0` shows the hits themselves.
2. Score it 1-10 on: hook in first 2s, readability at phone size, motion quality, variety,
   brand accuracy, sound sync.
3. Fix the 3 worst problems. Repeat until every score is 8+.
4. Only then do the full render.

## Layout of this repo
- `render.mjs`: renderer (full / `--contact` / `--verify` / `--still t`)
- `lib/studio.js`: browser runtime: `mount()`, seeded noise, easing, springs, beat grid
- `lib/synth.mjs`: offline synth (kick, snare, hat, saw, pad, blip, whoosh, impact, reverb, ducking)
- `tools/audio.mjs`: music, then measured beats, then SFX on the grid, then -14 LUFS `audio.wav`
- `tools/beats.py`: librosa beat/downbeat/onset measurement, writes `beats.json`
- `tools/serve.mjs`: preview server (`npm run preview`, space to play, drag to scrub)
- `films/<name>/`: `index.html` (the film), `score.mjs`, `beats.json`; outputs land in `out/`
