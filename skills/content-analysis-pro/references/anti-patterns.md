# Content analysis — anti-patterns

## No sampling frame

- Cherry-picked examples as “full analysis”.
- **Fix:** Define population, sample size, random seed if automated.

## Copyright / PII blindness

- Pasting confidential content into untrusted tools.
- **Fix:** Redact; use on-prem pipeline; **`security-pro`**.

## Format confusion

- Treating PDF layout as semantic structure without OCR/layout check.
- **Fix:** Validate extraction; note OCR errors.

## Over-claiming from LLM summary

- No quotes or line refs.
- **Fix:** Ground claims in excerpts + locations — **`quality-validation-and-grounding-guardrails.md`**, **`failure-modes-detection-mitigation.md`**.
