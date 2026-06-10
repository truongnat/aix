# Memory Index

> Index reusable project memory here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Capture reusable commands, verification recipes, and lookup pointers that future work can apply safely.
- Use this file as the first stop for repeatable checks before re-deriving commands from scratch.
- Link out to DECISIONS.md, HAZARDS.md, goal artifacts, or repo docs when that is more durable than copying content.

## Reusable Commands

| Name | Command | When To Use | Notes |
| --- | --- | --- | --- |
| Full test suite | `npm test` | before shipping behavior changes | records build + test coverage of the public surface |
| Guard scope smoke | `node hooks/core/guard-scope.js --files <path> --session .harness/sessions/<id> --json` | after guard-scope or STATE routing changes | expect `"ok":true` not ENOENT/`failed` |
| Session wrapper | `node --test test/hooks/run-with-active-session.test.js` | after `run-with-active-session.js` changes | 4 tests; wrapper must invoke hook not silent skip |
| Router read/write gate | `node --test test/hooks/codex-hook-router.test.js` | after `codex-hook-router.js` or `file-edit-guards.js` changes | Read out-of-scope → allow; Write → deny |
| CLI flag edge | `node -e "require('./dist/lib/cli-args.js').parseArgv(['node','aih','install','--scope','--yes'])"` | after cli-args parser changes | must throw Missing value for --scope |
| Package validation | `node bin/validate.js` | when docs/templates/contracts move | catches repo-surface drift |

## Verification Recipes

| Area | Check | Evidence To Capture | Notes |
| --- | --- | --- | --- |
| Install flow | dry-run + real install in temp repo | created files and warnings | cover private and shared modes |
| Runtime docs | read rendered markdown in target | key headings and commands | verify wording, not just file existence |

## Useful References

| Topic | Artifact Or Doc | Why It Matters |
| --- | --- | --- |
| Workflow rules | `docs/phase-discipline.md` | defines hard phase stops |
| Session start | `docs/session-start.md` | explains state restoration contract |
| Context engineering | `docs/context-engineering.md` | explains compaction, retrieval, and spec discipline |
| Token budget | `docs/token-budget.md` | explains why the harness stays lightweight |
| Delta specs | `templates/CHANGE_SPEC.md` | captures behavior-changing deltas before folding them into durable memory |
