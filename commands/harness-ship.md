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
- `report-writer`
- `remembering`
- `code-review` when final inspection is needed

## Delegated Workers

Before shipping, the main agent may dispatch the read-only `gatekeeper` worker to decide whether the next command is allowed based on VERIFY, REVIEW, and ship blocker evidence.

Rules:

- consume the shared `### Agent Result` envelope and any `WORKER_RUN.md` lifecycle artifact
- do not treat provider-specific conversation format as gate evidence
- block ship when the gatekeeper decision is `block` or evidence is insufficient

See `docs/delegated-workers.md` for support levels. Claude uses native `.claude/agents/harness-gatekeeper.md`; Cursor and Codex use adapter-level delegation in v1.

## Dispatch Template

For execution-facing dispatch, read `.ai-harness/prompt-templates/harness-ship.md`.

Use this command doc as the reference contract for phase behavior and artifact discipline. Use the prompt template as the execution instruction. Do not execute `harness-ship` freestyle when the prompt template is available.

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check the tools needed for release evidence and final review.

## Tool Routing

- use `git diff` and `git log` for release scope context
- run `node scripts/generate-report-context.js --json` to gather changed files and diff stats
- use `rg` before `grep` when locating ship evidence
- treat missing optional tools as degraded routing, not failure
- if shipping depends on unavailable required evidence tooling, stop and return `Blocked`

## Daily Report / PR Notes

Before completing this command, produce or update in the active session:

- `REPORT.md`
- `PR_MESSAGE.md`
- `CHANGE_SUMMARY.md`

These artifacts must be based on:

- active session plan
- completed tasks
- verification evidence
- actual git changes from `generate-report-context.js` or equivalent git commands

Do not create PR-ready text if verification is missing or blocked.

If git diff cannot be inspected, stop with Blocked instead of guessing file lists.

## Step-By-Step Workflow

1. Confirm that the active session `VERIFY.md` supports the current status.
2. Run `node scripts/generate-report-context.js --json` or inspect git status and diff.
3. Summarize what changed, why it changed, and what was actually verified.
4. Write `REPORT.md`, `PR_MESSAGE.md`, and `CHANGE_SUMMARY.md`.
5. Record follow-ups, deferred work, and residual risk honestly.
6. Write the handoff summary into the active session `SHIP.md`.
7. Transition to `harness-remember` for durable lessons.

## Required Outputs

- active session `SHIP.md`
- active session `REPORT.md`
- active session `PR_MESSAGE.md`
- active session `CHANGE_SUMMARY.md`
- `.harness/STATE.md` updated with ship or handoff state
- explicit follow-ups or known gaps when verification is not a full pass

## Redirect Behavior

- If the active session `VERIFY.md` is missing, stale, or lacks evidence, stop and redirect to `harness-verify`.
- If the plan or goal is no longer the right frame for the work, stop and redirect to `harness-discuss` or `harness-plan`.
- If implementation is still incomplete, stop and redirect to `harness-run`.

## Blocking Questions

- If verification status is blocked, pending, contradictory, or missing required evidence, the agent must stop and ask the user before shipping.
- If changed files cannot be inspected from git, stop and ask whether to run verification or provide diff context manually.
- If residual risk, deferred verification, or manual acceptance needs a human decision, record the blocker and stop instead of writing an optimistic ship summary.
- Use `.harness/BLOCKED.md` when the next allowed command is known but shipping cannot proceed yet.

## Failure Conditions

- Do not make a success claim without evidence.
- Do not hide residual risk, failing checks, or skipped verification.
- Do not upgrade unverified implementation into a shipped success by wording alone.

## Completion Gate

The command is complete when the handoff summary matches the evidence in the active session `VERIFY.md`, follow-ups are explicit, and no hidden assumptions remain about status, risk, or next steps.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/TASKS.md`, `.harness/sessions/<active-session>/VERIFY.md`, `.harness/REVIEW.md`, git status and diff
- Write: `.harness/sessions/<active-session>/SHIP.md`, `.harness/sessions/<active-session>/REPORT.md`, `.harness/sessions/<active-session>/PR_MESSAGE.md`, `.harness/sessions/<active-session>/CHANGE_SUMMARY.md`, `.harness/STATE.md`

## Human Approval

Ask for approval if shipping requires accepting residual risk, deferred verification, or incomplete scope.

## Notes

`harness-ship` depends on `harness-verify`. It should not be used to upgrade an unverified implementation into a claimed success. It must also produce PR-ready report artifacts when verification supports shipping.
