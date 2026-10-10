# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **OCR garbage** | Scan skew, low DPI | Nonsense words; layout breaks | Higher-res crop; manual verify sample — **`anti-patterns.md`** |
| **Missed video moment** | Sparse frame sampling | User says “you skipped X” | Finer sampling or user-provided clip — **`tips-and-tricks.md`** |
| **Hallucinated UI label** | Model fills plausible text | No exact match in crop | Require visible quote or mark **uncertain** — **`quality-validation-and-guardrails.md`** |
| **Wrong language / script** | Mixed locales | Gibberish summary | Detect script; translate with **uncertainty** flag |
| **Truncated doc** | Token/window limits | Abrupt cutoff mid-section | Continue in parts; outline remainder — **`edge-cases.md`** |
| **Password / DRM lock** | Cannot decode | Error on open | Request unlock or paste excerpt — **`edge-cases.md`** |
| **Chart number invention** | Illegible ticks | Round numbers too perfect | Only report **readable** values; ranges — **`analysis-methods-and-frames.md`** |
| **Deepfake / staged media** | Authenticity unknown | Visual seams (not proof) | State **verification limit** — **`edge-cases.md`** |
| **PII leakage in report** | Verbatim paste | Secrets in output | Summarize categories; **`security-pro`** |
