---
name: skill-template
description: |
  One-line professional scope for this skill.

  Use this skill when … (concrete situations, stack, user asks).

  Do not use when … (brief — out of scope).

  Triggers: "keyword1", "keyword2", …

metadata:
  short-description: Short label — areas, comma-separated
  content-language: en
  domain: your-domain
  level: professional
---

# Skill display name (professional)

Skill text is **English**; match the user’s **response language** from Cursor User Rules / project rules when applicable (see `skills/SKILL_AUTHORING_RULES.md` §13).

Use official [Primary docs](https://example.com) for API truth; this skill encodes **professional defaults**, **…**, and **…**. Confirm **version** / **environment** from the project when known.

## Boundary

What this skill **owns** vs defers to other skills (one short paragraph). Optional **`Related skills (this repo)`** table here.

## When to use

- Scenario …
- Scenario …
- Trigger keywords: `…`, `…`

## When not to use

- Out-of-scope scenario …
- Better handled by **`other-pro`** …

## Required inputs

- Stack / version …
- Constraints the agent must confirm …

## Expected output

Short list mirroring **Suggested response format** (shape only): **Issue or goal** → **Recommendation** → **Code** → **Residual risks** (or your extended blocks per `SKILL_AUTHORING_RULES.md` §5).

## Workflow

1. Confirm … (versions, stack, constraints).
2. Apply operating principles and summaries below; open `references/` when you need depth.
3. Respond using **Suggested response format**; note main risks (domain-specific).

### Operating principles

1. **Principle one** — …
2. **Principle two** — …

## Default recommendations by scenario

| Scenario | Default |
|----------|---------|
| … | … |

## Decision trees

Summary + Details link when you add `references/decision-tree.md`.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary + Details link when you add `references/anti-patterns.md`.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Topic area (summary)

- Bullet …

Details: [references/topic-file.md](references/topic-file.md)

## Cross-skill handoffs

Which `*-pro` skills to invoke and when.

Details: [references/integration-map.md](references/integration-map.md) *(optional file)*

## Suggested response format (implement / review)

1. **Issue or goal** — …
2. **Recommendation** — …
3. **Code** — …
4. **Residual risks** — …

## Resources in this skill

- `references/` — keep long content out of `SKILL.md`.

| Topic | File |
|-------|------|
| Topic A | [references/topic-file.md](references/topic-file.md) |

## Quick example

### 1 — Simple

**Input:** …  
**Expected output:** …

### 2 — Tricky

**Input:** …  
**Expected output:** …

### 3 — Cross-skill

**Input:** …  
**Expected output:** …

## Checklist before calling the skill done

- [ ] Read **`skills/SKILL_AUTHORING_RULES.md`** — new skills must satisfy every mandatory rule before adding a folder under `skills/`.
- [ ] Frontmatter `description` states when to use and when **not** to use; `name` matches folder name.
- [ ] Section order matches **`SKILL_AUTHORING_RULES.md` §2** (six-layer architecture).
- [ ] Workflow is exactly three steps (§4); **Suggested response format** matches §5 or documented extended format.
- [ ] Long docs live in `references/`, not pasted into `SKILL.md`.
