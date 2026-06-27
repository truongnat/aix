# KB Workflow Anti-Patterns

## 1. No Tags

**What it looks like:** Pushing a solution without `--tags` flag or with empty tags.

**Why it fails:** Solution becomes an orphan node in the graph. No RELATED_TO edges are created. It can only be found via full-text search, not graph traversal.

**Fix:** Always include 3-5 specific tags. Use technology names + problem type as baseline.

## 2. Duplicate Entries

**What it looks like:** Pushing "Docker Port Conflict Fix" when "Docker Compose Port Conflict on Multi-Project VPS" already exists.

**Why it fails:** Fragments knowledge. Searchers find one or the other, never the full picture.

**Fix:** Always `skill kb search` before pushing. If similar solution exists, update it (`PATCH /kb/:id`) rather than creating new.

## 3. Wall of Text

**What it looks like:** Solution with no headings, no code blocks, no structure. Just a paragraph dump.

**Why it fails:** Impossible to scan. The H1 becomes the title — without it, the entry is untitled. The "Key Insight" is what makes it worth reading; without it, it is just a log.

**Fix:** Follow the canonical format: H1 → Problem → Solution → Key Insight → Tags → Technologies.

## 4. Overly Broad Scope

**What it looks like:** "Complete Guide to Docker" or "Everything about NestJS Guards"

**Why it fails:** KB solutions should be atomic — one problem, one solution. Broad guides belong in documentation or skill files, not the KB.

**Fix:** Split into specific problems: "Docker Port Conflict on VPS", "NestJS Guard Not Activating Without APP_GUARD".

## 5. Missing Code Examples

**What it looks like:** "The fix was to change the import statement" without showing the actual code.

**Why it fails:** Developer KB is code-first. Without copy-pasteable examples, the solution requires mental translation that wastes time.

**Fix:** Always include the working code, command, or config. Show before/after when relevant.

## 6. Generic Tags Only

**What it looks like:** Tags: `fix, code, backend, issue`

**Why it fails:** These tags connect to everything and therefore to nothing useful. RELATED_TO edges become noise.

**Fix:** Use specific technology + problem tags: `nestjs, throttler, rate-limiting, APP_GUARD`

## 7. Not Searching First

**What it looks like:** Push a new solution → response shows `related_found: 3` with very similar titles.

**Why it fails:** You just created a duplicate or near-duplicate, fragmenting knowledge.

**Fix:** Make `skill kb search` a reflex. Before any push, check what exists. The 5-second search saves minutes of confusion later.

## 8. Stale Solutions Never Updated

**What it looks like:** Solution says "use import MeiliSearch from 'meilisearch'" but SDK changed to named export months ago.

**Why it fails:** Stale solutions actively mislead. Worse than no solution.

**Fix:** When you discover a solution is outdated during search, update it immediately: `skill kb get <id>` → edit → push update.
