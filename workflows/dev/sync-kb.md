---
description: Sync KB from origin, auto-rebuild embeddings, verify
---

# Sync KB — Sync knowledge base from origin

Pull latest KB changes from origin, detect document changes, auto-rebuild embeddings, and verify KB integrity. This workflow is designed for syncing knowledge base between multiple work locations (home, office, etc.).

## When to use

- Pulling KB changes from another location
- Syncing KB between home and office
- After merging KB changes from a PR
- Need to ensure embeddings are up-to-date with documents

## Workflow

### Step 1 — Pull from origin

**Type:** git operation

**Actions:**
```bash
git pull origin main
```

Check for changes in `knowledge-base/documents/` directory.

**Output:** List of changed files in KB documents.

---

### Step 2 — Detect document changes

**Type:** analysis

**Actions:**
- Compare `knowledge-base/documents/` before and after pull
- Identify new, modified, or deleted documents
- Check if `knowledge-base/INDEX.md` was updated

**Output:** Change summary:
- New documents: {{count}}
- Modified documents: {{count}}
- Deleted documents: {{count}}
- INDEX.md updated: Yes / No

---

### Step 3 — Rebuild KB embeddings

**Type:** script execution

**Actions:**
```bash
node dist/tools.js build-kb
```

If no document changes detected, skip this step (embeddings already current).

**Output:** Embeddings rebuilt successfully or skipped.

---

### Step 4 — Verify KB integrity

**Type:** script execution

**Actions:**
```bash
node dist/tools.js verify-kb
```

**Output:** KB verification result (pass/fail).

---

### Step 5 — Summary report

**Type:** documentation

**Actions:**
Generate summary report including:
- Pull result (up-to-date / changes pulled)
- Document changes detected
- Embeddings rebuild status
- Verification result
- Recommended next steps

**Output:** Sync summary report.

---

## Notes

- **Safety:** `build-kb` is idempotent - safe to run even if embeddings are current
- **Performance:** Embedding rebuild takes 30-60 seconds depending on corpus size
- **Conflict resolution:** If git pull has conflicts, resolve them manually before proceeding to Step 3
- **INDEX.md:** If INDEX.md was updated, review it to ensure new documents are properly indexed

## Auto-sync script

### Mac/Linux

```bash
# Run after git pull to auto-rebuild KB if documents changed
./scripts/auto-sync-kb.sh
```

### Windows

```powershell
# Run after git pull to auto-rebuild KB if documents changed
.\scripts\auto-sync-kb.ps1
```

Both scripts:
- Detect if `knowledge-base/documents/` changed after pull
- Automatically run `build-kb` and `verify-kb` if changes detected
- Skip rebuild if no document changes (saves time)

### Git hooks

Git hooks are in `.git/hooks/`:
- **Mac/Linux:** `post-merge`, `post-checkout` (bash scripts, executable)
- **Windows:** Hooks require additional Git configuration; use manual script for reliability

On Mac/Linux, hooks auto-run after `git pull` or branch checkout. On Windows, run the manual script after pulling.

---

## Related

- Command: [`commands/sync-kb.md`](../../commands/sync-kb.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)
