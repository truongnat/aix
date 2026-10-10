# Quality validation and guardrails (anti-hallucination)

## Evidence and confidence

- [ ] Each finding states **confidence**: High / Medium / Low — Low cannot block merge unless **catastrophic** tail risk is credible — **`finding-structure-and-evidence.md`**.
- [ ] Do **not** invent **file paths**, **line numbers**, or **ticket IDs**; use placeholders or quote only what the user provided.

## Severity claims

- [ ] **Critical/High** requires an **impact chain** (who breaks, what data, which env) — not “this feels dangerous.”
- [ ] Do **not** claim **security exploitability** without scenario; route to **`security-pro`** when unsure — **`integration-map.md`**.

## Metrics

- [ ] Avoid fabricated **LOC**, **cyclomatic complexity**, or **CVE** IDs; suggest tools if quantification matters — **`versions.md`**.

## Tone

- [ ] Feedback addresses **artifacts and behaviors**; avoid attributing motive — **`anti-patterns.md`**.

## Automation

- [ ] When citing **linters or bots**, name the **rule ID** only if known; otherwise say “lint warning on X pattern.”
