# Provider Compatibility Matrix

Generated from pack version **v1.0.1** and eval registry.

| Provider | Native slash | Subagents | Status | Eval tasks verified | Live evals |
| --- | --- | --- | --- | --- | --- |
| Claude Code | yes | yes | native-plugin | deterministic local (30 tasks) | no live evals yet |
| Codex | rules/fallback | adapter | plugin-packaging | deterministic local (30 tasks) | 1/1 passed (100% across 1 task) |
| Cursor | rules/fallback | adapter | plugin-ready | deterministic local (30 tasks) | no live evals yet |
| Gemini CLI | rules/fallback | adapter | native-command-files | deterministic local (30 tasks) | no live evals yet |

## Eval tasks

- `example-health-report` (workflow-discipline)
- `sample-abs` (bugfix)
- `sample-blockers-md` (workflow-discipline)
- `sample-bugfix` (bugfix)
- `sample-clamp` (bugfix)
- `sample-config-patch` (bugfix)
- `sample-context-md` (workflow-discipline)
- `sample-default-value` (bugfix)
- `sample-discussion-md` (workflow-discipline)
- `sample-divide` (bugfix)
- `sample-first-item` (bugfix)
- `sample-is-even` (bugfix)
- `sample-last-item` (bugfix)
- `sample-max` (bugfix)
- `sample-min` (bugfix)
- `sample-multiply` (bugfix)
- `sample-plan-md` (workflow-discipline)
- `sample-pr-message-md` (workflow-discipline)
- `sample-remember-md` (workflow-discipline)
- `sample-report-md` (workflow-discipline)
- `sample-response-contract` (workflow-discipline)
- `sample-reverse-string` (bugfix)
- `sample-review-md` (workflow-discipline)
- `sample-ship-md` (workflow-discipline)
- `sample-string-trim` (bugfix)
- `sample-subtract` (bugfix)
- `sample-sum-array` (bugfix)
- `sample-unique-count` (bugfix)
- `sample-uppercase` (bugfix)
- `sample-verify-md` (workflow-discipline)

Regenerate:

```bash
node scripts/generate-compatibility-matrix.js
```
