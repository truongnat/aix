# PPTX golden-output and slide evidence

| Area | Expected evidence |
|---|---|
| Coverage | `coverage.json` inventories slides/shapes and reaches `coverage_ratio == 1.0` before publish |
| Narrative | Slide order, titles, section transitions and intended audience are checked |
| Layout | Representative slides render with no clipping, overlap, off-canvas objects or unreadable text |
| Content | Text, tables, charts, notes, links and alt text are preserved or explicitly marked unsupported |
| Theme | Fonts, colors, masters, contrast and fallback behavior are known |
| Export | PDF/image export is spot-checked when delivery depends on it; pixel-perfect claims require evidence |
| Limits | Unsupported animations, embedded objects, macros and external links are disclosed |

Use deterministic fixtures and compare rendered slide images plus a structural inventory. A valid ZIP/package alone is not a golden-output pass.
