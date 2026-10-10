# Content analysis — integration map

| Skill | When |
|-------|------|
| **`business-analysis-pro`** | Requirements, BRD, decisions from extracted facts |
| **`security-pro`** | PII/credentials in content; redaction policy; safe handling |
| **`data-analysis-pro`** | Numeric profiling, pivots on **extracted** structured tables |
| **`web-research-pro`** | External verification of claims not in provided corpus |
| **`image-processing-pro`** | Crop/resize/enhance **before** semantic read when needed |
| **`testing-pro`** | Golden-file regression for automated extraction pipelines (CI) |
| **`repo-tooling-pro`** | Shared `scripts/` for repeatable FFmpeg/OCR steps |
| **`seo-pro`** | Marketing/web asset angle (rare) |

**Boundary:** **`content-analysis-pro`** owns **reading, structuring, and reporting** on user-supplied content; **`business-analysis-pro`** owns **business deliverable** packaging; **`data-analysis-pro`** owns **quantitative** analysis of tabular **data** once correctly extracted.
