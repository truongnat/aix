# Provider Compatibility Matrix

Generated from pack version **v1.0.1** and eval registry.

| Provider | Native slash | Subagents | Status | Eval tasks verified |
| --- | --- | --- | --- | --- |
| Claude Code | yes | yes | native-plugin | deterministic local (20 tasks) |
| Codex | rules/fallback | adapter | plugin-packaging | deterministic local (20 tasks) |
| Cursor | rules/fallback | adapter | plugin-ready | deterministic local (20 tasks) |
| Gemini CLI | rules/fallback | adapter | native-command-files | deterministic local (20 tasks) |

## Eval tasks

- `example-health-report` (workflow-discipline)
- `sample-abs` (bugfix)
- `sample-blockers-md` (workflow-discipline)
- `sample-bugfix` (bugfix)
- `sample-clamp` (bugfix)
- `sample-config-patch` (bugfix)
- `sample-context-md` (workflow-discipline)
- `sample-default-value` (bugfix)
- `sample-divide` (bugfix)
- `sample-is-even` (bugfix)
- `sample-max` (bugfix)
- `sample-min` (bugfix)
- `sample-plan-md` (workflow-discipline)
- `sample-response-contract` (workflow-discipline)
- `sample-reverse-string` (bugfix)
- `sample-ship-md` (workflow-discipline)
- `sample-string-trim` (bugfix)
- `sample-sum-array` (bugfix)
- `sample-unique-count` (bugfix)
- `sample-verify-md` (workflow-discipline)

Regenerate:

```bash
node scripts/generate-compatibility-matrix.js
```
