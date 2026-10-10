# Six-Layer Architecture

## Overview

Every skill is built from six mandatory layers. Each layer serves a specific function in the AI tool's skill routing and execution pipeline.

```
┌─────────────────────────────────────┐
│ 1. METADATA    → Discovery/routing  │  YAML frontmatter
├─────────────────────────────────────┤
│ 2. CONTRACT    → Scope definition   │  Boundary, When to use/not
├─────────────────────────────────────┤
│ 3. DECISION    → Professional logic │  Principles, defaults, trees
├─────────────────────────────────────┤
│ 4. KNOWLEDGE   → Deep reference     │  references/*.md + summaries
├─────────────────────────────────────┤
│ 5. EXECUTION   → Agent workflow     │  Steps, format, examples
├─────────────────────────────────────┤
│ 6. QUALITY     → Verification gates │  Checklist
└─────────────────────────────────────┘
```

## Layer 1: Metadata

**Location:** YAML frontmatter at top of SKILL.md

**Purpose:** Enables AI tool to discover and route to this skill based on user input.

**Required fields:**
- `name`: kebab-case, must match folder name
- `description`: Multi-line with scope, use-cases, triggers, and combine-with references
- `metadata.short-description`: One line for listings

**Optional fields:**
- `metadata.content-language`: `en` (default)
- `metadata.domain`: category (e.g., `backend`, `devops`, `frontend`)
- `metadata.level`: `foundation` | `professional` | `advanced`

**Critical:** The `description` field is the PRIMARY routing mechanism. Include generous trigger keywords.

## Layer 2: Contract

**Location:** `## Boundary`, `## When to use`, `## When not to use`, `## Required inputs`, `## Expected output`

**Purpose:** Defines exactly what this skill owns and what it defers to other skills.

**Boundary pattern:**
```markdown
**`skill-name`** owns **[specific scope]**. Defers to **`other-skill`** for [out-of-scope].
```

**When to use:** Concrete scenarios, not abstract descriptions. Include trigger keywords as code spans.

**When not to use:** Explicit redirections to other skills with reasons.

## Layer 3: Decision

**Location:** `### Operating principles`, `## Default recommendations by scenario`, `## Anti-patterns`, `## Decision trees`

**Purpose:** Encodes professional judgment — what a senior practitioner would decide without thinking.

**Operating principles:** Always include the 4 Karpathy principles plus domain-specific ones (5-8 total).

**Default recommendations:** Table format. Scenario → recommended approach.

**Anti-patterns:** Brief description + why it fails. Link to `references/anti-patterns.md` for details.

## Layer 4: Knowledge

**Location:** `### Topic (summary)` blocks in SKILL.md + `references/*.md` files

**Purpose:** Deep technical reference that the AI loads when depth is needed.

**Pattern in SKILL.md:**
```markdown
### Topic name (summary)

- Key point one
- Key point two (keep to 3-5 bullets)

Details: [references/topic-file.md](references/topic-file.md)
```

**Reference file naming:**
- `anti-patterns.md` — common mistakes
- `decision-tree.md` — when to choose what
- `edge-cases.md` — tricky scenarios
- `tips-and-tricks.md` — non-obvious techniques
- Topic-specific: `graph-modeling.md`, `cypher-patterns.md`, etc.

## Layer 5: Execution

**Location:** `## Workflow`, `## Suggested response format`, `## Quick example`

**Purpose:** Tells the AI exactly how to execute the skill.

**Workflow:** Always 3 steps:
1. **Confirm** — verify context, versions, constraints
2. **Apply** — use principles and knowledge, start minimal
3. **Respond** — use the suggested format, verify success

**Suggested response format:** Standard labels:
1. Issue or goal
2. Recommendation
3. Code
4. Residual risks

**Quick example:** Real input/output showing the skill in action.

## Layer 6: Quality

**Location:** `## Checklist before calling the skill done`

**Purpose:** Gate that must pass before the skill's output is considered complete.

**Mandatory items (every skill):**
```markdown
- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
```

**Plus domain-specific items** (3-5 additional checks relevant to the skill's topic).
