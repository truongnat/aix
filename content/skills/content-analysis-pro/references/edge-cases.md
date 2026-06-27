# Content analysis edge cases

## Unusable or partial input

- **Corrupt file** — State failure; ask for re-upload or alternative format.
- **Password-protected PDF** — Cannot analyze without unlock; do not ask for password in insecure channels.
- **DRM-protected video** — Cannot decode; same handling as locked PDF — suggest lawful export.

## Legal and ethical

- **Illegal content** — Refuse analysis; suggest appropriate reporting channels per platform policy.
- **Minors / non-consensual** — Do not facilitate harm; follow safety policies.

## Ambiguity

- **Memes / satire** — Intent may not be literal; flag **context** unknown.
- **Deepfakes** — Visual authenticity not guaranteed; note **verification** limits — authenticity lab if required.

## Multimodal mismatch

- **Alt text only** — If only description available, label analysis as **second-hand**.
- **Audio without video** — Transcript may miss emphasis, sarcasm, background noise.
- **Slides PDF vs native** — Speaker notes may be absent in exported PDF — report **missing layer**.

## Privacy

- **Accidental PII in screenshot** — Offer to **redact** in summary; warn user to crop before sharing.

## Long outputs

- **Token limits** — Offer **continued** analysis in parts or **index** of sections for follow-up.

---

## Layout and extraction

- **Complex tables** — Merged cells; OCR may scramble rows — validate against visual structure.
- **Multi-column magazine PDF** — Reading order wrong without layout engine — flag **reading-order risk**.
- **Handwriting** — High variance; label **low confidence**.
- **Embedded spreadsheets in Office** — May need export to CSV for **`data-analysis-pro`** — **`file-formats-dispatch-and-scope.md`**.

## Cross-language / locale

- **RTL scripts** — Order confusion in naive extract — note limitation.
- **Mixed legal languages** — Translation risk for obligations — escalate human review.

## Comparative analysis

- **Different editions** — Same title, different text — verify **version** identifier on cover or metadata.

## Automation brittleness

- **Rendered vs text PDF** — Charts as images only — OCR needed for numbers — **`failure-modes-detection-mitigation.md`**.
