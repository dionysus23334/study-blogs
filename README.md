# study-blogs

Personal study archive for **Yuxi Guo**.

**Live**: https://dionysus23334.github.io/study-blogs/

## Languages

- 中文: https://dionysus23334.github.io/study-blogs/
- English: https://dionysus23334.github.io/study-blogs/en/

## What's here

A small front door for two course-note sites:

- [CSIT5730 · Principles of Cybersecurity](https://dionysus23334.github.io/CSIT-5730-WebCybersecurity/)
- [CSIT5610 · Computer Networks](https://dionysus23334.github.io/CSIT-5610-ComputerNetworks/)

The page is a hand-written gallery: two course cards, a **Mathematics** section with two parallel routes, an **Explorations** section for small projects, a quick index of outlines/glossaries/repos, and a short about section. It shares the same editorial visual language as the notes: dotted paper background, serif headings, blue accent, dark mode.

## Mathematics

- [Classical Mathematics · Theory route](https://dionysus23334.github.io/Mathematics/theory/) — seven layers from logic and sets to analysis, algebra, topology, and advanced theory.
- [Learning Stages](https://dionysus23334.github.io/Mathematics/stages/) — elementary → secondary (including competition) → university.

## Explorations

- [Paper Town / Agent-City-Demo](https://dionysus23334.github.io/Agent-City-Demo/) — a hand-drawn interactive town with twenty neighbours, weather, time, and small story events. No API, no backend.

## Stack

- Plain HTML / CSS / JavaScript — no build step
- `index.html` (Chinese), `en/index.html` (English)
- `styles.css`, `main.js` shared by both
- `assets/agent-city.webp` — cover image for the Paper Town exploration card
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
