# 投研自动化

Weekday log of automated A-share research reports for Yuxi Guo's study archive.

- 中文: `index.html` → https://dionysus23334.github.io/study-blogs/research-automation/
- English: `en/index.html` → https://dionysus23334.github.io/study-blogs/research-automation/en/

The pages read `entries.json` and build the table of contents and the dated log. A new trading day is one appended object. Do not hand-edit the HTML to add a row.

Dates are calendar dates in **Asia/Shanghai**. The page sorts **newest first**: later date, then session `盘后`, then `盘中`, then `盘前`. Order in the file does not matter. Append at the end.

The Cursor URL is one living interactive page, updated in place on trading days. The log is an index. Opening that link shows the latest edition. When `notion` is set, that day's wording lives in that filing.

## `entries.json`

A JSON array. No comments (JSON does not allow them). Example:

```json
{
  "date": "2026-11-12",
  "session": "盘中",
  "title": "A股热筹监控",
  "titleEn": "A-share hot-money monitor",
  "aka": "热钱雷达",
  "note": "一句话说明。",
  "noteEn": "One sentence.",
  "canvas": "https://cursor.com/canvas/...",
  "notion": "https://app.notion.com/p/..."
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `date` | yes | `YYYY-MM-DD`, Asia/Shanghai. |
| `session` | yes | `盘前`, `盘中`, or `盘后`. |
| `title` | yes | Report title, in Chinese. |
| `titleEn` | no | English gloss of the title. The English page shows it under the Chinese title. |
| `aka` | no | Earlier name, if this edition was renamed in place. |
| `note` | no | One-line note, Chinese. |
| `noteEn` | no | English note. If omitted, the English page shows `note`. |
| `canvas` | no | Cursor interactive report URL (`http` or `https`). |
| `notion` | no | Notion filing for that day. Omit the field when there is no link. |

Do not invent reports or URLs. Leave `notion` out rather than guessing one.
