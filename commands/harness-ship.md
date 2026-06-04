# harness-ship

## Purpose

Finalize verified work, summarize the result, and prepare a clean handoff without overstating confidence.

## Minimum Read Set

- `.harness/STATE.md`
- active session current `PLAN-*.md`
- active session `VERIFY.md`
- `.harness/REVIEW.md` if present

## Preconditions

- active session `VERIFY.md` exists.
- active session `VERIFY.md` contains a real status.
- active session `VERIFY.md` contains non-empty tests run or equivalent evidence.
- Failures and known gaps are explicitly documented instead of implied away.

## When To Use

- after `harness-verify`
- before merge, PR submission, or task closure
- when a reliable handoff summary is required

## Skills To Use

- `using-harness`
- `verification`
- `remembering`
- `code-review` when final inspection is needed

## Dispatch Template

For execution-facing dispatch, read `.ai-harness/prompt-templates/harness-ship.md`.

Use this command doc as the reference contract for phase behavior and artifact discipline. Use the prompt template as the execution instruction. Do not execute `harness-ship` freestyle when the prompt template is available.

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check the tools needed for release evidence and final review.

## Tool Routing

- use `git diff` and `git log` for release scope context
- use `rg` before `grep` when locating ship evidence
- treat missing optional tools as degraded routing, not failure
- if shipping depends on unavailable required evidence tooling, stop and return `Blocked`

## Step-By-Step Workflow

1. Confirm that the active session `VERIFY.md` supports the current status.
2. Summarize what changed, why it changed, and what was actually verified.
3. Record follow-ups, deferred work, and residual risk honestly.
4. Write the handoff summary into the active session `SHIP.md`.
5. Transition to `harness-remember` for durable lessons.

## Required Outputs

- active session `SHIP.md`
- `.harness/STATE.md` updated with ship or handoff state
- explicit follow-ups or known gaps when verification is not a full pass

## Redirect Behavior

- If the active session `VERIFY.md` is missing, stale, or lacks evidence, stop and redirect to `harness-verify`.
- If the plan or goal is no longer the right frame for the work, stop and redirect to `harness-discuss` or `harness-plan`.
- If implementation is still incomplete, stop and redirect to `harness-run`.

## Blocking Questions

- If verification status is blocked, pending, contradictory, or missing required evidence, the agent must stop and ask the user before shipping.
- If residual risk, deferred verification, or manual acceptance needs a human decision, record the blocker and stop instead of writing an optimistic ship summary.
- Use `.harness/BLOCKED.md` when the next allowed command is known but shipping cannot proceed yet.

## Failure Conditions

- Do not make a success claim without evidence.
- Do not hide residual risk, failing checks, or skipped verification.
- Do not upgrade unverified implementation into a shipped success by wording alone.

## Completion Gate

The command is complete when the handoff summary matches the evidence in the active session `VERIFY.md`, follow-ups are explicit, and no hidden assumptions remain about status, risk, or next steps.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/VERIFY.md`, `.harness/REVIEW.md`
- Write: `.harness/sessions/<active-session>/SHIP.md`, `.harness/STATE.md`

## Human Approval

Ask for approval if shipping requires accepting residual risk, deferred verification, or incomplete scope.

## Notes

`harness-ship` depends on `harness-verify`. It should not be used to upgrade an unverified implementation into a claimed success.
