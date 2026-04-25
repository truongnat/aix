# Skill Validation Runbook

## Purpose
Validate a new or updated skill against the mandatory rules in `SKILL_AUTHORING_RULES.md`.

## Quick Checklist

- [ ] Skill folder name matches frontmatter `name` field (kebab-case, ends with `-pro`)
- [ ] `SKILL.md` exists and has proper YAML frontmatter
- [ ] Required frontmatter keys: `name`, `description`, `metadata` (with `domain`, `level`)
- [ ] All section headings match canonical order from §3 of authoring rules
- [ ] `## Boundary` section exists and defines scope vs related skills
- [ ] `## When to use` and `## When not to use` sections exist
- [ ] `## Workflow` has 6 numbered steps including Karpathy principles
- [ ] `## Suggested response format` includes "Issue or goal", "Recommendation", "Code", "Residual risks"
- [ ] `## Quick example` has 3 cases with Input/Expected output format
- [ ] `## Checklist before calling the skill done` matches SKILL_AUTHORING_RULES.md §6
- [ ] Topic is not already in the "already covered" list (unless extending)
- [ ] If non-trivial domain: `references/` directory exists with depth docs
- [ ] All references in `SKILL.md` point to actual files
- [ ] Karpathy principles integrated throughout (workflow, examples, checklist)

## Validation Steps

### 1. Check Structure
```bash
npm run validate-skills -- --dir skills/<skill-name>
```

### 2. Check References Exist
```bash
# For each reference link in SKILL.md, verify file exists:
ls -la skills/<skill-name>/references/
```

### 3. Verify Karpathy Integration
Search SKILL.md for these 4 principles:
- "Think Before Coding"
- "Simplicity First"
- "Surgical Changes"
- "Goal-Driven Execution"

Each should appear at least once in Workflow + Operating principles + Examples + Checklist.

### 4. Build Skill Index
```bash
npm run build-skill-index
```

Verify the skill appears in `skill_index.json` with correct metadata.

## Common Issues

| Issue | Fix |
|-------|-----|
| Frontmatter YAML parse error | Check YAML indentation (2 spaces, not tabs) |
| Missing sections | Add missing sections in canonical order |
| Broken reference links | Create missing files in `references/` |
| No `## Boundary` section | Add clear scope definition vs related skills |
| Karpathy principles missing | Add to Workflow steps, Operating principles, Examples, Checklist |

## Sign-Off

When all checks pass:
1. Run `npm run validate-skills`
2. Review by domain expert (optional)
3. Create PR with clear description
4. CI will re-validate on merge
