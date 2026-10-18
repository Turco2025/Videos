# Motion studio

Code-driven motion graphics. Each film is an HTML page whose `window.seek(t)` paints frame `t`.
A headless Chromium steps through time, ffmpeg encodes the frames, and the score is synthesized
in code and placed on a measured beat grid. The house rules are in [CLAUDE.md](CLAUDE.md).

## Setup
Windows: `./setup.ps1` (add `-Skills` / `-HandDrawn` for the optional Remotion/HyperFrames skills and hand-drawn plugin).
macOS/Linux: `./setup.sh` (`--skills`, `--hand-drawn`).

Then start Claude Code with `claude --model claude-opus-5-5`. Use `/model` to set effort to xhigh for one-shots and max for flagship pieces.

## Workflow
```sh
node tools/audio.mjs films/example            # score -> beats.json -> SFX on grid -> audio.wav @ -14 LUFS
node render.mjs films/example --verify        # frames are pure, no banned APIs
node render.mjs films/example --contact       # out/example.contact.png, one frame per beat
node render.mjs films/example --still 3.5     # single frame
node render.mjs films/example                 # out/example.mp4, H.264 yuv420p CRF 16 + AAC
npm run preview                               # http://127.0.0.1:5173/films/example/
```

## New film
Copy `films/example`, then edit `index.html` (call `mount({ width, height, fps, duration, setup, draw })`) and `score.mjs`
(`bpm`, `duration`, `music(bus)`, `sfx(bus, beats)`). To use a supplied track instead of a synthesized one,
drop in `track.wav` or `track.mp3` and remove `music()`. Any SFX still land on the beats measured from that track.

## Example film
`films/example` is a 16 s, 1080×1920 piece at 120 bpm. It went through three contact-sheet rounds before
the full render:
1. Hook 5, readability 4, motion 5. Fixes: shrink type to fit, rebuild the S3→S4 and S4→S5 transitions with hard masks instead of an alpha fade, and add a punch-in on frame 0.
2. A letter-spacing bug on the endcard (advance measured with the wrong font).
3. Every score at 8 or above, then the full render: 480 frames at -14.0 LUFS.
