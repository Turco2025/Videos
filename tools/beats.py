"""Measure the beat grid of a track -> beats.json.

    py tools/beats.py films/<name>/music.wav films/<name>/beats.json [--bpm 120]

Output: {tempo, duration, beats[], downbeats[], onsets[], strengths[]}, all in seconds.
--bpm is a prior only (it helps the tracker lock on); the grid is always measured.
"""
import json
import sys

import librosa
import numpy as np


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    src, dst = args[0], args[1]
    bpm = float(args[args.index("--bpm") + 1]) if "--bpm" in args else None

    y, sr = librosa.load(src, sr=22050, mono=True)
    hop = 256
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    kw = {"start_bpm": bpm, "tightness": 400} if bpm else {}
    tempo, frames = librosa.beat.beat_track(onset_envelope=env, sr=sr, hop_length=hop, units="frames", **kw)
    tempo = float(np.atleast_1d(tempo)[0])
    beats = librosa.frames_to_time(frames, sr=sr, hop_length=hop)

    # Onsets, backtracked to where the energy actually starts rising.
    onset_frames = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=hop, backtrack=True)
    onsets = librosa.frames_to_time(onset_frames, sr=sr, hop_length=hop)

    # The tracker can lock onto an off-beat accent (a heartbeat's second thump, a riser),
    # its tempo can be off by a fraction of a percent (hundreds of ms of drift over
    # minutes), and it drops edge beats. Fix in two steps:
    #  1. Search period and phase together for the uniform grid whose beats land on the
    #     most low-band (< 150 Hz) onset energy. If that grid scores at least as well as
    #     the tracker's own beats, the track is steady: use the grid as is.
    #  2. Otherwise keep the tracker's beats (tempo moves), shift them by the found phase,
    #     snap each to a low-band onset within 50 ms, and extend the ends.
    dur = len(y) / sr
    fps = sr / hop
    low_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, fmax=150, n_mels=32)
    low_on = librosa.frames_to_time(
        librosa.onset.onset_detect(onset_envelope=low_env, sr=sr, hop_length=hop, backtrack=True), sr=sr, hop_length=hop)
    score = lambda ts: float(low_env[np.clip(np.round(np.asarray(ts) * fps).astype(int), 0, len(low_env) - 1)].sum())
    if len(beats) > 1:
        period = float(np.median(np.diff(beats)))
        best = (-1.0, period, 0.0)
        for per in np.linspace(period * 0.994, period * 1.006, 121):
            n = np.arange(int(dur / per) + 1) * per
            for ph in np.arange(0, per, 1 / fps):
                sc = score(n[n + ph < dur] + ph)
                if sc > best[0]:
                    best = (sc, float(per), float(ph))
        sc_grid, per, ph = best
        grid = ph + np.arange(int((dur - ph) / per) + 1) * per
        grid = grid[grid < dur - 0.05]
        k = np.round((beats - ph) / per)
        shifted = beats + float(np.median(ph + k * per - beats))
        if sc_grid >= score(shifted) * 0.98:
            beats, tempo = grid, 60.0 / per
            # the onset envelope peaks a frame or two after the attack: move the whole grid
            # by the median distance to the backtracked low-band onsets
            if len(low_on):
                offs = np.array([low_on[np.argmin(np.abs(low_on - b))] - b for b in beats])
                offs = offs[np.abs(offs) < 0.05]
                if len(offs):
                    beats = np.maximum(0, beats + float(np.median(offs)))
        else:
            beats = shifted
            if len(low_on):
                for i, b in enumerate(beats):
                    j = int(np.argmin(np.abs(low_on - b)))
                    if abs(low_on[j] - b) < 0.05:
                        beats[i] = low_on[j]
            p0 = float(np.median(np.diff(beats)))
            head = [beats[0] - p0 * i for i in range(1, 64) if beats[0] - p0 * i > -p0 * 0.25]
            tail = [beats[-1] + p0 * i for i in range(1, 64) if beats[-1] + p0 * i < dur - 0.05]
            beats = np.concatenate([np.maximum(0, head[::-1]), beats, tail])
    frames = librosa.time_to_frames(beats, sr=sr, hop_length=hop)
    frames = np.minimum(frames, len(env) - 1)

    # Downbeats: harmony tends to change on the one. Pick the 4-beat phase with the
    # most chroma change, with low-end energy as a tiebreak.
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    sync = librosa.util.sync(chroma, frames, aggregate=np.median)
    change = np.r_[1.0, np.linalg.norm(np.diff(sync, axis=1), axis=0)][: len(beats)]
    low = librosa.feature.rms(y=librosa.effects.preemphasis(y, coef=-0.97), hop_length=hop)[0]
    strength = np.array([float(low[min(f, len(low) - 1)]) for f in frames])
    weight = change / (change.max() or 1) + 0.25 * strength / (strength.max() or 1)
    phase = int(np.argmax([weight[p::4].sum() / max(1, len(weight[p::4])) for p in range(4)])) if len(beats) >= 8 else 0
    downbeats = beats[phase::4]
    strength = list(strength)

    peak = max(strength) if strength else 1.0
    out = {
        "source": src.replace("\\", "/"),
        "tempo": round(tempo, 3),
        "duration": round(len(y) / sr, 4),
        "beats": [round(float(t), 4) for t in beats],
        "downbeats": [round(float(t), 4) for t in downbeats],
        "onsets": [round(float(t), 4) for t in onsets],
        "strengths": [round(s / peak, 3) for s in strength],
    }
    with open(dst, "w") as f:
        json.dump(out, f, indent=1)
    gaps = np.diff(beats) if len(beats) > 1 else np.array([0])
    print(f"{dst}: {tempo:.1f} bpm, {len(beats)} beats, {len(downbeats)} downbeats, "
          f"{len(onsets)} onsets, beat jitter {gaps.std() * 1000:.1f} ms")


if __name__ == "__main__":
    main()
