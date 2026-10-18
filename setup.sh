#!/usr/bin/env bash
# Motion studio setup for macOS / Linux. Run from the repo root:  ./setup.sh [--skills] [--hand-drawn]
# Needs: node 22+, ffmpeg, python3 (install via brew / apt first).
set -euo pipefail
for bin in node ffmpeg python3; do command -v "$bin" >/dev/null || { echo "missing: $bin"; exit 1; }; done

python3 -m pip install numpy librosa soundfile
npm install
[ -z "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" ] && npx playwright install chromium

for arg in "$@"; do
  case "$arg" in
    --skills) npx skills add remotion-dev/skills; npx skills add heygen-com/hyperframes ;;
    --hand-drawn)
      claude plugin marketplace add buildwithhanif/claude-animation-skill
      claude plugin install claude-animation@claude-animation-skill ;;
  esac
done

node tools/audio.mjs films/example
node render.mjs films/example --verify
node render.mjs films/example --contact
echo; echo "Ready. Start with:  claude --model claude-opus-5-5"
