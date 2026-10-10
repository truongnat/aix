# Methods (Excel doc → HTML / Markdown)

## Why not flatten

Merged cells store the value only in the top-left cell. Expanding that value
into every cell of the range produces dozens of repeated columns. Markdown has
no `colspan`, so flatten ≠ document.

JP 方眼紙 / 帳票 / 画面設計書 express meaning with **visual layout**. Markdown
expresses **logical structure**. Conversion needs an intermediate that keeps
geometry, then a semantic rewrite.

## Recommended pipeline

1. **Classify** — sheet titles, merge counts, approx used range (ignore 1000-row template padding).
2. **HTML** — emit `<td rowspan colspan>` from `openpyxl` merged ranges (skip non-origin cells).
3. **Markdown** — pick a strategy (cover KV, control table, blocks, layout stub).
4. **Report** — list limitations (shapes, charts, truncation, stamp heuristics).
5. **Optional LLM** — rewrite MD from HTML/text; forbid inventing IDs/numbers; keep HTML as ground truth.

## Tool comparison (short)

| Approach | Role |
| --- | --- |
| pandas → MD | Avoid for merged sk-docs |
| openpyxl flatten → MD | Debug only |
| HTML rowspan/colspan | Required intermediate |
| markitdown / docling | OK for simple grids; weak on 方眼紙 |
| LLM on cell text | Best semantic MD when cells are readable |
| Vision LLM | Only when cells are not readable |

## Implementation notes

- Build `origin[(r,c)] → (rowspan, colspan)` and a `covered` set for non-origin cells.
- Cap export with `--max-rows` / `--max-cols`; record caps in the report.
- Layout sheets (`*レイアウト*`): do not force full MD tables; link HTML (or later PNG).
