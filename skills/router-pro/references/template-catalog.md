# Template Catalog — Available templates for router-pro

Templates live in `templates/` at repo root. They provide scaffolds for common structured outputs.

## Available templates

| Template | File | When to use |
|----------|------|-------------|
| Skill template | `templates/SKILL.md` | Scaffold a new skill (see `skill-creator-pro`) |
| Config template | `templates/config.template.md` | Generate a `config.md` for KB configuration |
| Requirements | `templates/requirements.txt` | Python dependency scaffold |

## Report templates (inline, no file)

Generated on-demand by router-pro for:

| Report type | Trigger phrases |
|-------------|----------------|
| Gap analysis report | "gap analysis", "what skills are missing", "coverage report" |
| Skill audit report | "audit skills", "skill quality report", "review bundle" |
| Activity log entry | "log this", "record decision", "document outcome" |
| Architecture decision record (ADR) | "ADR", "decision record", "document architecture" |

## Template selection logic

1. User requests a specific template by name → load from `templates/`.
2. User requests a structured output (PRD, issue, report) → use inline template from relevant skill (`to-prd-pro`, `to-issues-pro`).
3. User requests a scaffold (new skill, config) → load from `templates/` and fill placeholders.

## Adding templates

New templates go in `templates/<name>.md`. Add to this catalog when adding a file. No code changes required — router-pro discovers templates by reading the `templates/` directory.
