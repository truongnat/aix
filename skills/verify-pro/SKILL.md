---
name: verify-pro
description: >-
  Forces final status to match actual evidence by running the changed path end-to-end, checking acceptance criteria, and re-running the proving check fresh rather than trusting stale output. Use before saying done, before merging or delivering work, after tests pass, or when the user asks to confirm something works.

metadata:
  compatible: "claude,cursor,codex,gemini"
  kind: "process"
  roles: ""
  tags: ""
  version: "0.1.0"
---




# verify-pro

## Purpose

Prevent optimistic completion claims by forcing the final status to match the actual evidence.

## When To Use

- before declaring work complete
- when manual checks, partial evidence, or deferred verification could be glossed over
- when shipping pressure makes false confidence more likely

## When Not To Use

- when no relevant work exists yet
- when only discussing or planning is happening
- when the verification artifact already contains complete, fresh evidence and no ambiguity remains

## Inputs

- goal and plan artifacts under `.aix/sessions/<session-id>/`
- verification results
- any review findings or known gaps

## Workflow

1. Re-state the claim being made about the work.
2. Match each part of the claim to evidence or a documented gap.
3. Downgrade the status if any part is unproven, blocked, or waiting on human confirmation.
4. Make ship blockers explicit rather than implied.
5. Leave a final status that no reader could mistake for stronger proof than actually exists.
6. Record pass, fail, blocked, or pending status honestly; run the proving check **fresh** (stale output is invalid).
7. Save **`VERIFY.md`** to `.aix/sessions/<session-id>/VERIFY.md` (see [session artifacts contract](../_shared/session-artifacts-contract.md)); satisfy [references/evidence-contract.md](references/evidence-contract.md).

## Operating Principles

- Claims must not outrun evidence.
- Fresh evidence outranks confidence; verification maps back to the stated goal.
- Partial verification is labeled partial or blocked; unverified work is not complete.
- Pending human checks are not passes.
- Missing evidence is a first-class result.
- Short honest verification is better than long optimistic verification.

## Reasoning Procedure

1. Restate the completion claim and what must prove it.
2. Check the current verification artifacts and evidence.
3. Decide whether the claim is proven, incomplete, or blocked.
4. Stop and report blocked if fresh proof is missing.

## Action Loop

- Thought: identify the proof required before completion can be claimed.
- Action: inspect or run the relevant verification check.
- Observation: record the real result and whether it covers the claim.
- Repeat until the completion claim is either proven or blocked.

## Fresh-check variant

- Thought: identify the smallest check that can prove the claim.
- Action: run the verification command or inspect the evidence.
- Observation: record the real result and exit code.
- Repeat until the claim is proven or blocked.


## Examples

### Example 1

Input: Fresh evidence proves the requested work is complete.

Output:
- Final claim-to-evidence check: supported by validator and test output.
- Honest status: complete.
- Explicit blockers or gaps: none.

### Example 2

Input: The evidence is stale or incomplete for the completion claim.

Output:
- Final claim-to-evidence check: insufficient.
- Honest status: blocked until fresh proof is gathered.
- Explicit blockers or gaps: missing current verification.
## Output Contract

This skill must produce:

- a final claim-to-evidence check
- an honest status
- explicit blockers or gaps

## Common Failure Modes

- calling a change done because tests passed but scope was broader
- burying deferred human checks in prose
- letting summary language overclaim past the evidence

## Checklist Before Done

- [ ] The claimed outcome was restated
- [ ] Evidence was matched against the claim
- [ ] Status was downgraded if proof was incomplete
- [ ] Human checks are explicit when required
- [ ] The final wording does not overclaim

## Example

Verification script — prove the claimed behavior, not just that code compiles:

```bash
# Fresh-check variant: rerun the actual failing scenario end to end
npm test -- orders.spec.ts 2>&1 | tee /tmp/test.log
grep -q "3 passed" /tmp/test.log || { echo "FAIL: tests did not pass"; exit 1; }
# Verify the observable behavior, not the implementation detail
curl -sf http://localhost:3000/api/orders | jq '.items | length'
# Report evidence: command run, output seen, criterion met
echo "VERIFIED: endpoint returns 200 with non-empty items"
```
