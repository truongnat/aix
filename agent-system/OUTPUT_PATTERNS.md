# Output Patterns

Reusable blocks for harness responses. Combine with `RESPONSE_CONTRACT.md` formats.

## Phase Gate

| Gate | Required | Current | Status |
|---|---|---|---|
| Session state | known | unknown | blocked |
| Plan approval | approved | draft | blocked |
| Verification | evidence | missing | blocked |

## Next Action Block

```txt
Next allowed command:
  harness-verify
```

## Evidence Table

| Evidence | Source | Result |
|---|---|---|
| `npm test` | command | passed |
| `git diff --stat` | inspection | 3 files |

## Report Table

| File | Change Type | Why |
|---|---|---|
| `commands/harness-ship.md` | updated | PR-ready outputs |

## Provider Capability Table

| Provider | Native Commands | Fallback | Notes |
|---|---|---|---|
| Claude Code | project `/harness-*` | — | strongest path |
| Cursor | no | rules + catalog | honest fallback |

## Session Start Snapshot

```md
status: ready
session: sessions/YYYY-MM-DD-topic
phase: verify
next_command: harness-verify
```
