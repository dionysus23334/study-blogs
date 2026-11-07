# 瑞士杠杆擒纵 · Swiss Lever Escapement

Interactive three.js study model of a **Swiss lever watch escapement** (balance + lever/pallets + escape wheel). Built as a single offline-friendly HTML page (Grok Bot demo).

**Live:** https://dionysus23334.github.io/study-blogs/watch-escapement/

## Open

### Option A — double-click / `file://` (preferred)
Fully offline: `three.min.js` is bundled next to `index.html` (three.js r160).

```bash
# macOS
open watch-escapement/index.html

# Linux
xdg-open watch-escapement/index.html
```

Or drag `index.html` into Chrome / Edge / Firefox.

### Option B — local server (if CDN blocked or you prefer)
```bash
cd watch-escapement
python3 -m http.server 8765
# then open http://127.0.0.1:8765/
```

## Controls
| Action | How |
|--------|-----|
| Orbit | Drag left mouse |
| Pan | Right / middle drag, or Shift+drag |
| Zoom | Scroll wheel |
| Play / Pause | Playback button |
| Speed | 0.25× / 1× / 4× |
| Explode / Assemble | Separate parts along documented offsets |
| Isolate | Balance / Lever / Escape / All |
| Cutaway | Semi-transparent plate |
| Camera | Hero / Side / Top / Inside |
| Auto tour | Idle ~22s → fake cursor walks Explode → Isolate → Assemble → Hero |

## Math model (summary)
- Balance: θ = A·sin(2πft), **f = 4 Hz** (≈ 28800 bph), A ≈ 66°.
- Escape wheel: **15 teeth**; advances **one tooth per beat**.
- Lever: banks ±β with a short blend during each impulse window.
- Driven by a single simulated time `t` (pure functions — not hand keyframes).

See comment block at top of the `<script>` in `index.html` for approximations vs a real chronometric escapement.

## Files
- `index.html` — scene, UI, math model
- `three.min.js` — three.js r160 (local, for offline / file://)
- `README.md` — this file

## Explode offsets (assembled → exploded delta)
- plate: `(0, -0.55, -0.4)`
- escape: `(-2.4, 0.2, 0.55)`
- lever: `(0.2, 1.55, 0.35)`
- balance: `(2.55, 0.55, -0.35)`
