# 瑞士杠杆擒纵 · Swiss Lever Escapement

Interactive three.js study model of a **Swiss lever watch escapement** (balance + lever/pallets + escape wheel). Built as a single offline-friendly HTML page (Grok Bot demo).

**Live:** https://dionysus23334.github.io/study-blogs/watch-escapement/

## Visual v2
Refined teardown-style study look:
- **Escape wheel** — extruded club-tooth profile (15), hub/rivet, spokes, polished rim
- **Lever** — fork horns, dart, banking pins, chamfered ruby pallets
- **Balance** — rim + timing screws/slots, 3 spokes, double roller, impulse jewel, Archimedean hairspring (~10 turns)
- **Plate / bridges** — thinner plate, jewel chatons, balance cock + escape bridge outlines, blued screw heads, stepped arbors
- Materials: brass / steel / blued screws / physical ruby; soft studio lighting + ACES

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

### Option B — local server
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
| Mobile | Top bar → 读数 / 控制 sheets |

## Math model (summary)
- Balance: θ = A·sin(2πft), **f = 4 Hz** (≈ 28800 bph), A ≈ 66°.
- Escape wheel: **15 teeth**; advances **one tooth per beat**.
- Lever: banks ±β with a short blend during each impulse window.
- Driven by a single simulated time `t` (pure functions — not hand keyframes).

See comment block at top of the `<script>` in `index.html` for approximations vs a real chronometric escapement.

## Files
- `index.html` — scene, UI, math model (visual v2)
- `three.min.js` — three.js r160 (local, for offline / file://)
- `README.md` — this file

## Explode offsets (assembled → exploded delta)
- plate: `(0, -0.55, -0.4)`
- escape: `(-2.4, 0.2, 0.55)`
- lever: `(0.2, 1.55, 0.35)`
- balance: `(2.55, 0.55, -0.35)`

HOME spacing unchanged from v1 (escape −0.55 / lever 0.05 / balance 0.95).
