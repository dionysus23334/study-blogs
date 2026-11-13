# APP软件画廊 / App Gallery

A growing gallery of short study demos for iPhone apps in the daily fast-growth reports.

- 中文: `index.html` → https://dionysus23334.github.io/study-blogs/app-gallery/
- English: `en/index.html` → https://dionysus23334.github.io/study-blogs/app-gallery/en/

The pages read `catalog.json` and build the cards. Newest first. Dates are calendar dates in **Asia/Shanghai**.

The homepage already links Exploration 04 here. A new day does **not** need an edit to `index.html` or `en/index.html`.

## Add a day

1. Create `apps/<id>/` with a complete demo: `index.html`, `en/index.html`, and any small CSS/JS that page needs. Reuse the site `styles.css` and `main.js` (paths are relative). Link `gallery.css` only if you want the shared buttons and exhibit line.
2. Add one object to `catalog.json`. Put it anywhere in `entries`. Set `updated` to the same Asia/Shanghai date.
3. Open the gallery. The new card appears by itself, newest date first.

Within one date, file order is kept. If two demos share a day, put the one that should be read first earlier in `entries`.

Do not hand-edit the gallery HTML to add a card. The `<noscript>` links are only a courtesy when JavaScript is off. Update them if you want that fallback to stay current; the live gallery does not depend on them.

## `catalog.json`

```json
{
  "updated": "2026-11-13",
  "entries": [
    {
      "id": "workbuddy",
      "date": "2026-11-13",
      "name": "WorkBuddy",
      "name_zh": "WorkBuddy · AI 办公我帮你",
      "publisher": "Tencent Technology (Shanghai) Company Limited",
      "one_liner_zh": "一句话。",
      "one_liner_en": "One sentence.",
      "tags": ["AI work agent", "Productivity"],
      "demo": "apps/workbuddy/",
      "demo_en": "apps/workbuddy/en/",
      "report": "https://cursor.com/canvas/..."
    }
  ]
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `updated` | no | `YYYY-MM-DD` shown in the count line. |
| `id` | yes | Stable slug. Used as the card anchor. |
| `date` | yes | `YYYY-MM-DD`, Asia/Shanghai. |
| `name` | yes | English exhibit name. |
| `name_zh` | no | Chinese exhibit name. The Chinese page prefers it. |
| `publisher` | no | Publisher, as a citation, not a logo. |
| `one_liner_zh` | no | One sentence on the Chinese card. |
| `one_liner_en` | no | One sentence on the English card. |
| `tags` | no | Short labels. |
| `demo` | yes | Path from `app-gallery/` to the Chinese demo, with a trailing slash. |
| `demo_en` | no | English demo. If omitted, the English card uses `demo`. |
| `report` | no | `http` or `https` link to that day's research. |

No comments in the JSON file. Do not invent reports. These pages are study sketches: original interface and copy, no official marks, screenshots, or show assets.

## Paths inside a demo

From `apps/<id>/index.html`:

- `../../../styles.css`
- `../../../main.js`
- `../../` back to this gallery

From `apps/<id>/en/index.html`, add one more `../`.

Keep the page on the archive: header, language switch, theme toggle, a lead, the interactive body, a short note about the demo with the research link, and a footer. Light and dark come from `main.js`. The page should hold together on a narrow phone without sideways scroll.
