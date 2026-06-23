---
name: discuss
description: Use optionally when a brief, review finding, or proposed approach still feels unclear, risky, or disputed and needs technical review before planning.
metadata:
  version: 0.1.0
---

## Skill name

discuss

## Instruction

Take a concrete proposal, review finding, or recommended direction and pressure-test it before it hardens into a plan. This is an optional clarification and review skill: use it only when confidence is still low, assumptions are exposed, or the direction is being challenged. The job is to reduce uncertainty and record one explicit disposition, not to reopen the whole project or start planning.

## When to use

- a brief exists but the user wants to debate or challenge the recommendation before planning
- a review artifact or prior discussion exists and needs to be synthesized into one decision about what should happen next
- the request is no longer vague, but the chosen direction still feels unclear or weak
- multiple stakeholders or constraints pull in different directions and the tradeoff needs to be made explicit
- a proposed approach sounds plausible but could hide scope, risk, or contract drift

## When not to use

- no concrete brief or candidate approach exists yet — run `brainstorming` first
- the direction is already clear enough to break into tasks — go to `plan`
- the goal is understood and the only remaining work is writing tasks or implementing them
- the work is already being implemented — route through `plan` or `execute`, not back into open-ended debate

## Inputs

- the current brief or proposed approach under review
- any existing review or discussion artifact that defines why the proposal is in question
- the constraints, success criteria, and assumptions already on record
- current repo facts that can confirm or falsify the proposal

## Workflow

1. Read the exact proposal or review finding being discussed; do not re-derive the whole problem from scratch.
2. Restate the proposal under review in one sentence so the discussion has one stable target.
3. Separate confirmed facts from assumptions that still need proof, using repo and artifact evidence first.
4. Challenge the proposal on four axes: scope, compatibility, verification, and rollback cost, using `references/review-axes.md`. If a prior review artifact is the source, note whether its freshness was verified or remains unverified.
5. Name an alternative only if it is meaningfully different, still viable, and clarifies the decision rather than expanding the option space.
6. End with exactly one disposition: `approved`, `revise`, or `blocked`, plus the exact reason and next command.
7. Fill `assets/discussion-template.md` per `FORMS.md` (or run `scripts/new-discussion.sh <slug>`), then stop. Do not start planning or implementation here.

## Operating Principles

- `discuss` is optional review support, not a mandatory gate and not a second `brainstorming` pass.
- Keep pressure on the proposed direction, not on the user's wording.
- Act on local artifacts first; do not ask redundant "what output do you want?" questions when the context already shows what is being reviewed.
- A good discussion reduces uncertainty; it does not sprawl the scope.
- The discussion must converge on one disposition, not a vague "maybe."
- If the approach survives review, say so explicitly; otherwise say exactly what is still unclear.

## Output Contract

This skill must produce a short discussion note containing:

- the proposal under review
- the confirmed facts vs. remaining assumptions
- the review findings on scope, compatibility, verification, and rollback cost
- one explicit disposition: `approved`, `revise`, or `blocked`
- the next command or handoff: back to `brainstorming`, forward to `plan`, or wait for user decision
- if a prior review artifact shaped the discussion, a freshness note that says whether it was verified or not
- if not approved, the specific reason and what must change next

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "I'll just brainstorm from scratch again" | `discuss` reviews a concrete proposal; if no proposal exists, use `brainstorming` instead. |
| "I'll ask what kind of discussion the user wants before reading the artifacts" | If the proposal or review artifact already exists, synthesize it first and only ask when a real gap remains. |
| "The user seems mostly okay with it, that's approval" | Silence or weak agreement is not approval. Record an explicit disposition. |
| "I'll fix the weak parts while discussing" | Changing the proposal mid-review hides what actually got approved. State the revision clearly first. |
| "I'll always run this before plan just to be safe" | That turns an optional review skill into ceremony. If the brief is already clear, go straight to `plan`. |

## Checklist Before Done

- [ ] The reviewed proposal is named explicitly
- [ ] Facts are separated from assumptions
- [ ] Risks to scope, compatibility, verification, and rollback were checked
- [ ] The outcome is exactly one of `approved`, `revise`, or `blocked`
- [ ] The next command or handoff is explicit
- [ ] Review freshness is labeled when prior review artifacts were used
- [ ] No planning or implementation started after the discussion note

## Example

`brainstorming` recommends "copy provider rules and rewrite paths." During `discuss`, the review finds Claude permissions and Codex `.rules` are different native surfaces, so path-rewrite alone would encode the wrong model. Disposition: `revise` — replace provider rule copying with one common rule model plus provider-specific renderers. The note records that change, and only then can `plan` start.

## Output

A short discussion note with one explicit disposition, its reason, and the next command — used only when extra review was actually needed.

## References

- `FORMS.md` — guide for recording the review note
- `assets/discussion-template.md` — blank discussion note template
- `scripts/new-discussion.sh` — scaffolds a new discussion note from the template
- `references/review-axes.md` — what to check on scope, compatibility, verification, and rollback cost
