# JP / VietIS template notes

Patterns seen in `sk-docs/R1` style workbooks (e.g. `画面設計書_FBD*`, `帳票設計書_RBD*`):

| Sheet family | Typical content | Convert hint |
| --- | --- | --- |
| 表紙 | System / 機能ID / version / authors | `cover-kv`; sk-review 承認 stamp row |
| 機能概要 | Prose + DB list | blocks; keep table names raw |
| 画面レイアウト / 帳票レイアウト | Visual wire | `layout-asset` → HTML |
| 画面項目詳細 / 帳票項目詳細 | Control inventory | `control-table` when headers match |
| 詳細設計（FE/BE/API） | Wide merged narrative | blocks + higher caps; chunk if needed |
| 更新履歴 | History grid | blocks or simple table |

## Control table headers

Detection looks for both:

- `コントロール名`
- `コントロールID`

Optional № column. Section banners often merge one label across columns — emit
as `###` headings, not data rows.

## Domain terms

Keep `FBD13001`, `RBD09002`, `lblBase`, `m_article`, etc. unchanged in Markdown.
Explain in the session `language`; do not bilingual-paraphrase every label.
