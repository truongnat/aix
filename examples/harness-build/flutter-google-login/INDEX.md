# Memory Index

## How To Use This Artifact

- Record reusable commands and references that future work can apply safely.

## Reusable Commands

| Name | Command | When To Use | Notes |
| --- | --- | --- | --- |
| Goal validation | `node validate.js --target ../my-project --goal google-login` | Check goal artifact structure | Run from the source pack |

## Verification Recipes

| Area | Check | Evidence To Capture | Notes |
| --- | --- | --- | --- |
| Auth goal artifacts | Goal validation plus manual review | CLI output and artifact inspection | Use before shipping docs |

## Useful References

| Topic | Artifact Or Doc | Why It Matters |
| --- | --- | --- |
| Shared memory policy | `MEMORY.md` | Explains what belongs in shared vs goal-level memory |
