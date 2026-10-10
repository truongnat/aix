# Skill Authoring Anti-Patterns

## 1. Monolithic SKILL.md

**What it looks like:** SKILL.md is 800+ lines with all content inline. No references/ directory. Decision trees, code examples, and anti-patterns all stuffed in one file.

**Why it fails:** AI tools load the full SKILL.md when activated. 800 lines of context competes with the user's actual code for attention. The tool loses focus.

**Fix:** Keep SKILL.md under 500 lines. Move deep content to `references/`. Use summary stanzas (3-5 bullets) with `Details:` links.

## 2. Vague Triggers

**What it looks like:**
```yaml
description: |
  A skill for backend development.
  Use when working on the backend.
  Triggers: "backend", "code"
```

**Why it fails:** "backend" and "code" match everything. The skill either never triggers (too generic to rank) or triggers constantly (noise).

**Fix:** Include specific technology names, error messages, common question patterns:
```yaml
Triggers: "NestJS", "neo4j", "MERGE", "Cannot resolve dependencies",
  "OnModuleInit", "graph modeling", "Cypher query"
```

## 3. Missing Karpathy Checklist

**What it looks like:** Checklist has domain-specific items only:
```markdown
- [ ] Query is parameterized
- [ ] Constraints created
```

**Why it fails:** No quality gate for the universal principles. The skill may produce over-engineered, scope-creeping, or unverified output.

**Fix:** Always include the 4 Karpathy items FIRST, then domain-specific items:
```markdown
- [ ] Assumptions stated explicitly (Think Before Coding)
- [ ] Minimum solution, no speculation (Simplicity First)
- [ ] Only touched relevant code (Surgical Changes)
- [ ] Success criteria verified (Goal-Driven Execution)
- [ ] [domain-specific checks...]
```

## 4. Template Placeholders Left In

**What it looks like:**
```markdown
## Boundary

**`skill-name`** owns **[scope description]**. Defers to **`other-skill`** for [out-of-scope areas].
```

**Why it fails:** The AI tool will literally output "[scope description]" and "[out-of-scope areas]" as guidance. Placeholder text is worse than no text.

**Fix:** Replace EVERY placeholder. If you are unsure what to write, that section needs research, not a placeholder.

## 5. Wrong Section Order

**What it looks like:** `## Workflow` before `## Boundary`, or `## Checklist` in the middle.

**Why it fails:** AI tools that follow skill structure expect consistent ordering. Misordered sections confuse parsing and context loading.

**Fix:** Follow the canonical order exactly (17 sections). Reference the template or SKILL_AUTHORING_RULES.md §3.

## 6. No References for Deep Content

**What it looks like:** 150-line code examples inline in SKILL.md. Decision trees with 8 branches all in the main file.

**Why it fails:** SKILL.md should be scannable (< 500 lines). The AI loads it fully on activation — bloated files dilute the important guidance.

**Fix:** Extract to references/. Leave a 3-5 bullet summary in SKILL.md. The AI will load the reference file only when depth is needed.

## 7. Skill Overlaps Without Boundary

**What it looks like:** `docker-compose-pro` and `docker-pro` both explain Dockerfile best practices. No clear ownership.

**Why it fails:** When both skills activate, they may give conflicting advice. The user gets confused about which to trust.

**Fix:** Every skill's `## Boundary` section must explicitly state what it defers to other skills. Use the pattern: "**`skill-name`** owns X. Defers to **`other-skill`** for Y."

## 8. System Skill Doing Implementation Work

**What it looks like:** A "router" or "planner" skill that also includes 200 lines of React component code.

**Why it fails:** System skills coordinate; working skills implement. Mixing these creates a skill that is too broad to be useful in either role.

**Fix:** If the skill routes/orchestrates, it is a system skill — delegate implementation to working skills. If it implements domain-specific code, it is a working skill — remove orchestration logic.
