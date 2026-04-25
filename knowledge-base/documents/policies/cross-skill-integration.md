# Cross-Skill Integration Policy

## Purpose

Define how skills coordinate with each other and prevent scope overlap.

## Integration Patterns

### 1. Direct Handoff
Skill A explicitly calls Skill B when:
- A's scope ends, B's begins naturally
- Clear input/output contract between skills
- Documented in A's `## Cross-skill handoffs` section

**Example:** `code-review-pro` → `testing-pro` (review identifies need for test coverage)

### 2. Shared Context
Multiple skills access same context without handoff:
- `auth-pro`, `security-pro`, `api-design-pro` all reference authentication concepts
- Each skill owns its domain (auth system vs security patterns vs API security)
- Use `## Boundary` to clarify scope overlap

### 3. Optional Combination
Skills can be combined by the user without strict ordering:
- `react-pro` + `typescript-pro` for React TypeScript work
- `design-system-pro` + `frontend-design-pro` for cohesive visual language
- Documented in both skills' "Related skills" section

## Scope Resolution Rules

When two skills touch the same domain:

1. **Upstream/downstream principle**: Earlier stage skill doesn't prescribe later stage
   - `planning-pro` (what) vs `executing-plans-pro` (how)
   - `api-design-pro` (contract) vs `nestjs-pro` (implementation)

2. **Tooling vs abstraction**: Framework skill owns framework, abstraction skill owns patterns
   - `nextjs-pro` owns Next.js specifics
   - `react-pro` owns React patterns that apply everywhere
   - Overlap is okay; `nextjs-pro` references `react-pro` for foundational concepts

3. **Domain authority**: Deepest skill wins
   - `sql-data-access-pro` (queries)
   - `postgresql-pro` (Postgres-specific)
   - `data-analysis-pro` (insights)
   - Each owns different layer

## Preventing Duplicates

New skills must not duplicate:

1. **Existing general skills**: If topic covered by a general skill, extend instead
   - Don't create `email-pro` if `api-design-pro` covers email API patterns

2. **Related narrow skills**: Check if topic better served by combination
   - Consider `api-design-pro` + `security-pro` before creating `api-security-pro`

3. **Test the boundary**: Can a user understand scope from the title + description?
   - "When to use" and "When not to use" should be unambiguous

## Coordination Examples

### Good (Clear Boundaries)
```
planning-pro:    "What should we build?"
executing-plans-pro: "How do we build it?"
testing-pro:     "How do we verify it works?"
feedback-pro:    "What should we improve?"
```

### Good (Shared Context, Different Layers)
```
api-design-pro:  Contract/schema
nestjs-pro:      NestJS-specific implementation  
security-pro:    Security patterns in APIs
```

### Avoid (Unclear Overlap)
```
❌ react-pro + react-patterns-pro (confusing split)
❌ testing-pro + unit-testing-pro (too specific to split)
❌ auth-pro + login-pro (too narrow split)
```

## Integration Checklist

When designing a new skill, verify:

- [ ] Checked "already covered" list in SKILL_AUTHORING_RULES.md
- [ ] Boundary is clear in the skill's `## Boundary` section
- [ ] Related skills are documented with "when to combine" rationale
- [ ] No overlap in "When to use" conditions with existing skills
- [ ] Cross-skill handoff points are explicit, not implicit
- [ ] PR description explains why this is a distinct skill
