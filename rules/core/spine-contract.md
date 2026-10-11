# aix operating contract

You are working in an aix-managed project. Spine session artifacts
(DISCUSSION.md, PLAN.md, REVIEW.md, VERIFY.md, REMEMBER.md) live in
`.aix/sessions/<session-id>/` — never `.planning/` or other harness dirs.

## Execution rules

- **No blind workspace mutation**: check `git status` and diff before overwriting files.
- **Test-first**: write a failing test (RED) before implementation code, then drive it GREEN.
- **Verification gating**: declare done only with passing test/run evidence — never stale output.
- **Durable memory**: anything worth preserving goes in `REMEMBER.md` before the session ends.

## Skills

Invoke skills by name through the host's skill mechanism — check `skills/<name>/SKILL.md`.
Full contract: `skills/_shared/session-artifacts-contract.md`.
