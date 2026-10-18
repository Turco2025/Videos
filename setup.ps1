# Motion studio setup for Windows (PowerShell). Run from the repo root:  ./setup.ps1
# Optional route-B framework skills and the hand-drawn plugin are opt-in flags.
param([switch]$Skills, [switch]$HandDrawn)
$ErrorActionPreference = 'Stop'

# 1. Runtime: Node 22+, ffmpeg, Python for audio analysis
winget install --silent --accept-package-agreements OpenJS.NodeJS.LTS Gyan.FFmpeg Python.Python.3.12 Git.Git
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
py -m pip install numpy librosa soundfile

# 2. Project deps and a headless browser
npm install
npx playwright install chromium

# 3. Framework skills (optional, route B)
if ($Skills) {
  npx skills add remotion-dev/skills          # /remotion-create, /remotion-render ...
  npx skills add heygen-com/hyperframes       # /hyperframes router + GSAP skills
}

# 4. Hand-drawn look (optional): Node canvas rigs, pens, synthesized sound
if ($HandDrawn) {
  claude plugin marketplace add buildwithhanif/claude-animation-skill
  claude plugin install claude-animation@claude-animation-skill
}

# 5. Claude Code
npm install -g @anthropic-ai/claude-code

# Smoke test: build the example end to end
node tools/audio.mjs films/example
node render.mjs films/example --verify
node render.mjs films/example --contact
Write-Host "`nReady. Start with:  claude --model claude-opus-5-5   (then /model to set effort: xhigh one-shots, max flagship)"
