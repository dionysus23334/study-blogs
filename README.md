# study-blogs

Personal study archive for **Yuxi Guo**.

**Live**: https://dionysus23334.github.io/study-blogs/

## Languages

- 中文: https://dionysus23334.github.io/study-blogs/
- English: https://dionysus23334.github.io/study-blogs/en/

## What's here

A small front door for two course-note sites, one mathematics note, and one algorithms repository:

- [CSIT5730 · Principles of Cybersecurity](https://dionysus23334.github.io/CSIT-5730-WebCybersecurity/)
- [CSIT5610 · Computer Networks](https://dionysus23334.github.io/CSIT-5610-ComputerNetworks/)

The page is a hand-written gallery: two course cards, a mathematics note card, an algorithms card, an **Explorations** section for small projects, a quick index of outlines/glossaries/repos, and a short about section. It shares the same editorial visual language as the notes: dotted paper background, serif headings, blue accent, dark mode.

## Mathematics note

- [Classical academics & learning stages](https://dionysus23334.github.io/Mathematics/) — one entry for the classical route and the learning-stage route.

## Algorithms

- [Algorithms](https://github.com/dionysus23334/Algorithms) — notes and implementations: data structures, complexity, graphs, and dynamic programming.

## Explorations

- [Paper Town / Agent-City-Demo](https://dionysus23334.github.io/Agent-City-Demo/) — a hand-drawn interactive town with twenty neighbours, weather, time, and small story events. No API, no backend.
- [Swiss lever escapement](https://dionysus23334.github.io/study-blogs/watch-escapement/) — interactive three.js study model of a Swiss lever watch escapement (`watch-escapement/`).
- [投研自动化 / Investment Research Automation](https://dionysus23334.github.io/study-blogs/research-automation/) — a weekday ~08:00 (Asia/Shanghai) log of automated A-share research reports. Chinese page at `research-automation/`, English at `research-automation/en/`. The table of contents and the dated log are rendered from `research-automation/entries.json`; append one object per update. The Cursor report is one living page; the log is the index.
- [APP软件画廊 / App Gallery](https://dionysus23334.github.io/study-blogs/app-gallery/) — short, complete demos for iPhone apps studied in the daily fast-growth reports. Chinese page at `app-gallery/`, English at `app-gallery/en/`. Cards render from `app-gallery/catalog.json`, newest first. A new day is one demo folder plus one catalog entry; the homepage does not need another edit.

## Stack

- Plain HTML / CSS / JavaScript — no build step
- `index.html` (Chinese), `en/index.html` (English)
- `styles.css`, `main.js` shared by both
- `assets/agent-city.webp` — cover image for the Paper Town exploration card
- `assets/watch-escapement.webp` — cover image for the Swiss lever escapement card
- `watch-escapement/` — Swiss lever escapement demo (`index.html` next to local `three.min.js`)
- `research-automation/` — 投研自动化 log (`index.html`, `en/index.html`, `log.js`, `entries.json`). Styles and the theme toggle stay in the shared `styles.css` and `main.js`; paths are relative so the page works locally and under the `/study-blogs/` base.
- `app-gallery/` — APP软件画廊 (`index.html`, `en/index.html`, `gallery.js`, `gallery.css`, `catalog.json`, `apps/`). Cards render from `catalog.json`. Demo pages reuse `styles.css` and `main.js`.
- Deployed from the `gh-pages` branch

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000>.

## Updating

Edit `index.html` / `styles.css` / `main.js`, then push to both `main` and `gh-pages`:

```bash
git add -A
git commit -m "update site"
git push origin main
git push origin main:gh-pages
```

The live site is served from `gh-pages`.
