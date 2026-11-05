# Quality validation and guardrails (content analysis — grounding)

## Mandatory checks before asserting facts

- [ ] **Evidence anchor** exists for each non-trivial claim — page, timestamp, or **visible region** description.
- [ ] **Quotes** match source (no paraphrase disguised as quotation).
- [ ] **Numbers** on charts — only if **legible**; otherwise “not readable at provided resolution.”
- [ ] **Unknown** sections declared — do not smooth over gaps.

## Wrong-answer prevention

- **Inventing slide text** when image is blurry — **forbidden**; say **illegible**.
- **Filling tables** from memory of “typical” documents — **forbidden** without OCR confirmation.
- **Legal conclusion** from document skim — redirect to professional review — **`reporting-and-limitations.md`**.

## When model vision is used

- Label **model-dependent** interpretations vs **direct read** when product policy requires — at minimum, separate **Observation** vs **Interpretation** subsections.

## Sensitive content

- Do not **reproduce** secrets at length — **`security-pro`** — summarize risk category only.
