# DOCX golden-output and pagination evidence

| Area | Expected evidence |
|---|---|
| Coverage | `coverage.json` inventories paragraphs, tables, styles, media and unsupported parts; ratio is 1.0 before publish |
| Text structure | Headings, lists, fields, links, footnotes and reading order match the source intent |
| Layout | Representative pages render with stable pagination, no clipped tables, orphan headings or accidental blank pages |
| Tables/media | Widths, cell content, images, captions, alt text and wrapping are checked |
| Metadata | Core properties, language, creator and dates are intentional |
| Round trip | Reopen and re-inspect the output; compare a rendered PDF or page images where layout matters |
| Limits | Legacy `.doc`, macros, OLE, signatures and unsupported OOXML are disclosed or block publish |

Keep content fixtures for short, long, multilingual, table-heavy and image-heavy documents. Do not equate successful XML generation with a correct user-facing document.
