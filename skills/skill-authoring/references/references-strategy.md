# References Strategy

## When to Create a Reference File

Split content to `references/` when:
- A topic exceeds **20 lines** in SKILL.md
- Code examples are **lengthy** (> 30 lines)
- Decision trees have **multiple branches** (> 3 conditions)
- Anti-patterns need **detailed explanations** with examples
- A topic is **independently useful** (could be read standalone)

Keep in SKILL.md when:
- Content fits in 3-5 bullet points
- It's a quick reminder, not deep documentation
- The summary IS the full content (no more depth needed)

## Naming Convention

| File Name | Content |
|-----------|---------|
| `anti-patterns.md` | Common mistakes with explanations |
| `decision-tree.md` | When to choose what approach |
| `edge-cases.md` | Tricky scenarios and gotchas |
| `tips-and-tricks.md` | Non-obvious techniques |
| `integration-map.md` | How this skill connects to others |
| `versions.md` | Version-specific differences |
| `{topic-name}.md` | Domain-specific deep content |

## Linking Pattern

In SKILL.md, every reference file MUST be linked twice:

### 1. In the summary stanza:
```markdown
### Topic name (summary)

- Key point one
- Key point two
- Key point three

Details: [references/topic-name.md](references/topic-name.md)
```

### 2. In the Resources table:
```markdown
## Resources in this skill

| Topic | File |
|-------|------|
| Topic name | [references/topic-name.md](references/topic-name.md) |
```

## File Structure

Each reference file should be self-contained:
- Start with `# Title` matching the topic
- Use sections with `##` headings
- Include code examples where relevant
- No YAML frontmatter (only SKILL.md has frontmatter)
- Target length: 50-200 lines (enough to be useful, not a textbook)

## How Many Reference Files?

| Skill Complexity | Recommended Files |
|------------------|-------------------|
| Simple workflow | 2-3 (anti-patterns + 1-2 topics) |
| Standard domain | 4-6 (anti-patterns + decision-tree + topics) |
| Complex domain | 7-10 (comprehensive coverage) |
| Never | 15+ (split into multiple skills instead) |

## Anti-Pattern: Dumping in SKILL.md

```markdown
# BAD — SKILL.md is 800 lines with everything inline

## Cypher Patterns
[200 lines of Cypher examples...]

## Transaction Patterns  
[150 lines of transaction code...]
```

```markdown
# GOOD — SKILL.md has summaries, references have depth

### Cypher patterns (summary)
- MATCH for reads, MERGE for idempotent writes, CREATE for guaranteed new
- Always parameterize: $variable, never string concatenation
- ON CREATE SET before SET after MERGE

Details: [references/cypher-patterns.md](references/cypher-patterns.md)
```

The SKILL.md summary gives the AI enough context to know WHEN to load the reference. The reference file provides the full depth WHEN needed.
