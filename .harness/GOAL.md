# Goal

## Summary

Dogfood `ai-engineering-harness` in its own source repository: close the SessionStart hook gap so first-session domain bootstrap runs reliably, then self-init project surfaces (`.ai-harness/`, `.cursor/`, domain skills).

## Acceptance

- SessionStart hook injects domain-bootstrap intent when `domains: []` and no generated skills exist.
- Cursor rules document the same bootstrap contract.
- This repo has `.harness/` skeleton, `.ai-harness/` cache, `.cursor/` commands/rules, and domain skills for backend/devops/debugging.
- `npm test` passes with new hook tests.

## Out of Scope

- Full Cursor native SessionStart hook SDK integration (still pending per hooks-cursor.json).
- Publishing npm release.
