---
name: skill-creator-pro
description: |
  Create a new skill for this devkit following all SKILL_AUTHORING_RULES: correct frontmatter, concise SKILL.md (under 120 lines of prose), references/ folder for deep content, and a name matching the `<domain>-pro` convention. Use when the user wants to build, write, or add a new skill to the bundle.

  Triggers: "write a skill", "create a skill", "add a new skill", "make a skill for", "new skill", "skill-creator", "author a skill".

  Combine with **`skills-self-review-pro`** to audit the new skill after creation, and **`repo-tooling-pro`** to rebuild the skill index.

metadata:
  short-description: Author a new devkit skill following SKILL_AUTHORING_RULES and correct file structure
  content-language: en
  domain: meta
  level: professional
---

# skill-creator (professional)

Skill text is **English**; answer in the user's preferred language when the conversation specifies it.

Guide the creation of a new skill from requirements gathering through to a complete, index-ready file set.

## Boundary

**`skill-creator-pro`** owns **skill authoring**. **`skills-self-review-pro`** owns auditing existing skills. **`repo-tooling-pro`** owns rebuilding the skill index.

## Related skills

| Skill | When to combine |
|-------|----------------|
| **`skills-self-review-pro`** | Audit the new skill immediately after creation |
| **`repo-tooling-pro`** | Rebuild skill_index.json after adding the skill |
| **`writing-plans-pro`** | Write the implementation plan for a skill-shaped task |

## When to use

- Creating a brand-new skill in this repo.
- Rewriting an existing skill to comply with `SKILL_AUTHORING_RULES.md`.
- Defining frontmatter, boundaries, triggers, and references for a new domain skill.
- Preparing a skill that must pass `validate-skills` and be indexed cleanly.

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** skill name, domain, triggers, and overlap with existing skills → verify: [existing skills checked; no duplicate scope].
2. **Think Before Coding** — gather requirements before writing any content; ask only what the requirements phase cannot answer.
3. **Simplicity First** — minimum SKILL.md that meets §0 gate; move overflow to `references/`; no speculative sections.
4. **Surgical Changes** — only write the new skill's files; do not edit other skills' SKILL.md during this session.
5. **Goal-Driven Execution** — done when `validate-skills` passes, `build-skill-index` runs clean, and user confirms.
6. **Respond** using Suggested response format.

### Operating principles

1. **Think Before Coding** — check existing skills for overlap before writing a single line.
2. **Simplicity First** — SKILL.md prose ≤ 120 lines; everything longer belongs in `references/`.
3. **Surgical Changes** — write only the new skill's files; never touch adjacent skills.
4. **Goal-Driven Execution** — success = `validate-skills` passes + `build-skill-index` clean + user confirms.

## Suggested response format

Use this structure for skill-authoring work:

1. **Scope** — skill name, domain, triggers, overlap check result.
2. **File set** — `SKILL.md` sections and any `references/` files to create.
3. **Authoring decisions** — boundaries, guardrails, and what stays in `SKILL.md` vs references.
4. **Verification** — `validate-skills`, `build-skill-index`, and any remaining review step.
5. **Residual risks** — overlap, stale references, or missing citations.

## Resources in this skill

- [skills/SKILL_AUTHORING_RULES.md](skills/SKILL_AUTHORING_RULES.md) — mandatory authoring and completeness gate.
- This `SKILL.md` section `## Skill anatomy` — required file structure and frontmatter.
- This `SKILL.md` section `## Process` — authoring workflow from overlap check to index rebuild.

## Quick example

User asks: "Create a new `caching-pro` skill for cache strategy and invalidation."

Response shape:
- Check for overlap with existing skills first.
- Define the boundary, triggers, and minimal `SKILL.md` structure.
- Move deep material such as failure modes and decision trade-offs into `references/`.
- Verify with `validate-skills` and `build-skill-index`.

## Skill anatomy

```
skills/<name>-pro/
├── SKILL.md          # required — frontmatter + core content (≤120 prose lines)
└── references/       # optional — one file per deep topic
    ├── failure-modes-detection-mitigation.md
    ├── decision-framework-and-trade-offs.md
    ├── quality-validation-and-guardrails.md
    └── system-model.md
```

### SKILL.md frontmatter (required fields)

```yaml
---
name: <domain>-pro           # matches folder name exactly
description: |
  <What this skill does, when to use it, explicit triggers, what to combine it with.>
  Max 1024 characters. Third-person voice. Include "Triggers:" line.

metadata:
  short-description: <≤80 chars — used in skill index>
  content-language: en
  domain: <ui-framework|backend|devops|planning|meta|quality|language|...>
  level: <foundation|professional|advanced>
---
```

### Content rules

- **SKILL.md prose ≤ 120 lines** — move anything longer to `references/`.
- **No time-sensitive facts** — no "as of version X.Y" without a context-aware check.
- **Boundary section** — explicitly state what this skill owns vs adjacent skills.
- **Related skills table** — list skills to combine and when.
- **Guardrails section** — explicit validation checks and quality bar.
- **No fabricated APIs or file paths** — only assert what you read.

## Process

### 1. Gather requirements
Ask the user:
- What domain / task does the skill cover?
- What are the primary triggers (keywords that should activate it)?
- Are there reference materials, docs, or existing code patterns to encode?
- Does it need utility scripts or reference files?

### 2. Check for overlap
Search existing skills (`skills/`) for a skill covering the same domain. If one exists, ask whether to extend it or create a new one. Never duplicate coverage.

### 3. Draft SKILL.md
Write the full SKILL.md following the template above. Show it to the user.

### 4. Identify overflow content
If any section would exceed ~40 lines, propose splitting it into a `references/` file. Typical splits:
- Failure modes → `references/failure-modes-detection-mitigation.md`
- Decision trade-offs → `references/decision-framework-and-trade-offs.md`
- Quality guardrails → `references/quality-validation-and-guardrails.md`
- Conceptual model → `references/system-model.md`

### 5. Review with user
Present the complete file set and ask:
- Does the skill cover the right scope?
- Any missing triggers, failure modes, or guardrails?
- Any reference files needed?

### 6. Write files and rebuild index
Write `skills/<name>-pro/SKILL.md` (and any reference files). Then run:
```bash
npm run build-skill-index
```
to register the new skill in `knowledge-base/embeddings/skill_index.json`.

## Checklist before calling the skill done

- [ ] Checked existing skills for overlap before writing anything (Think Before Coding)
- [ ] SKILL.md prose ≤ 120 lines; overflow moved to `references/` (Simplicity First)
- [ ] Only wrote new skill's files; no adjacent skills edited (Surgical Changes)
- [ ] `npm run validate-skills` passes; `npm run build-skill-index` clean (Goal-Driven Execution)
- [ ] All 4 Karpathy principles present in `### Operating principles` and `## Checklist` (§0 gate)
- [ ] Name ends in `-pro` and matches folder name exactly
- [ ] Description ≤ 1024 characters with explicit Triggers line
