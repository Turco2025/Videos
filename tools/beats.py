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

    # The tracker reports the envelope peak, a few ms late, and drops edge beats.
    # Snap each beat to a backtracked onset within 60 ms, then extend the grid to both ends.
    if len(onsets):
        for i, b in enumerate(beats):
            j = int(np.argmin(np.abs(onsets - b)))
            if abs(onsets[j] - b) < 0.06:
                beats[i] = onsets[j]
    if len(beats) > 1:
        period = float(np.median(np.diff(beats)))
        dur = len(y) / sr
        head = [beats[0] - period * k for k in range(1, 64) if beats[0] - period * k > -0.03]
        tail = [beats[-1] + period * k for k in range(1, 64) if beats[-1] + period * k < dur - 0.05]
        beats = np.concatenate([np.maximum(0, head[::-1]), beats, tail])
    frames = librosa.time_to_frames(beats, sr=sr, hop_length=hop)

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
