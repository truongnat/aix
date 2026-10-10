# PPTX golden-output evidence

Use these scenarios as a compact fixture contract. Keep inputs synthetic and record assumptions before execution.

## Positive scenario

**Setup:** Render a representative deck and assert slide order, layout bounds, notes/metadata and accessibility text.

**Expected evidence:** Render screenshots, object bounds, content checklist and coverage.json.

**Decision:** the scenario may be marked covered only when the evidence maps to the claim and limitations are recorded.

## Negative or edge scenario

**Setup:** Detect overflow, missing assets or unsupported features and defer publication.

**Expected result:** the workflow must fail safe, block, abstain, roll back, or defer; it must not silently convert missing evidence into success.

**Handoff:** `sk-tester` produces execution evidence; `sk-review` or `sk-review-pr` records findings; `sk-verify-pro` owns the final `pass`/`block`/`defer` decision.

## Evidence packet

- **Claim:** one bounded outcome.
- **Criteria:** positive and negative assertions above.
- **Evidence:** fixture/output paths, command result, timestamp and reviewer findings.
- **Limitations:** environment, unsupported features, uncertainty and residual risk.
- **Next owner:** named specialist or `sk-verify-pro`.
