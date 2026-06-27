# Cursor Rules Format (.mdc)

## File Location

```
project-root/
└── .cursor/
    └── rules/
        ├── karpathy-discipline.mdc
        ├── project-conventions.mdc
        └── testing-standards.mdc
```

## Structure

```yaml
---
description: Brief description of what this rule enforces
globs: "**/*.{ts,tsx}"
alwaysApply: true
---

# Rule Title

Rule content in Markdown...
```

## Frontmatter Fields

### `description` (required)
- One sentence explaining the rule's purpose
- Used by Cursor to decide when to show the rule
- Be specific: "Enforce NestJS module patterns" not "Code rules"

### `globs` (optional)
- File pattern matching (uses glob syntax)
- `"*"` — all files
- `"**/*.{ts,tsx}"` — all TypeScript files
- `"apps/api/**/*.ts"` — only API TypeScript files
- `"*.test.ts"` — only test files
- If omitted, rule applies to all files

### `alwaysApply` (optional, default: false)
- `true` — rule is always active regardless of context
- `false` — rule is available but only applied when relevant
- Use `true` for: coding discipline, naming conventions, security rules
- Use `false` for: framework-specific patterns, optional best practices

## Content Best Practices

### Keep Focused
One rule file = one concern. Don't combine "naming conventions" with "testing strategy."

### Use Actionable Language
```markdown
# Good
- Always use parameterized queries with $variable syntax
- Never use string interpolation in Cypher queries

# Bad  
- It would be nice to use parameters
- Consider avoiding string concatenation maybe
```

### Include Examples
```markdown
## Good
\`\`\`typescript
const result = await session.run(
  'MATCH (n:Solution {id: $id}) RETURN n',
  { id: solutionId }
);
\`\`\`

## Bad
\`\`\`typescript
const result = await session.run(
  `MATCH (n:Solution {id: "${solutionId}"}) RETURN n`
);
\`\`\`
```

### Severity Levels (optional)
```markdown
- 🔴 MUST: Parameterize all Cypher queries
- 🟠 SHOULD: Use named volumes for persistence
- 🟡 NICE: Add JSDoc to exported functions
```

## Rule Categories

| Category | Scope | alwaysApply |
|----------|-------|-------------|
| Coding discipline | All files | true |
| Language conventions | `*.{ts,tsx}` | true |
| Framework patterns | `apps/api/**` | true |
| Testing standards | `*.{test,spec}.*` | false |
| Documentation | `*.md` | false |

## Relationship to CLAUDE.md

- `CLAUDE.md` is for Claude Code (project-level guide)
- `.cursor/rules/` is for Cursor IDE (rule enforcement)
- Content can overlap — both describe conventions
- CLAUDE.md is prose-oriented; rules are checklist-oriented
- A project can have both for dual-tool compatibility

## Relationship to Skills

- Skills teach HOW to do something (workflow + knowledge)
- Cursor rules enforce THAT something is done correctly (constraints)
- A skill might say "use parameterized queries" in its guidance
- A cursor rule ENFORCES "no string concatenation in Cypher" on save

## Template

See `templates/cursor-rule.mdc` for the starter template.
