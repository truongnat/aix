---
description: Sync KB from origin, auto-rebuild embeddings, verify
targets: [cursor, claude]
---

Pull latest KB changes from origin, detect document changes, auto-rebuild embeddings, and verify KB integrity. Use when syncing knowledge base between multiple work locations (home, office, etc.).

## When to use

- Pulling KB changes from another location
- Syncing KB between home and office
- After merging KB changes from a PR
- Need to ensure embeddings are up-to-date with documents

## Workflow

See [`workflows/dev/sync-kb.md`](../workflows/dev/sync-kb.md) for detailed workflow steps.

## Related

- Workflow: [`workflows/dev/sync-kb.md`](../workflows/dev/sync-kb.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../OUTPUT_CONVENTIONS.md)
