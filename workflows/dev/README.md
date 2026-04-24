# Workflows — `dev` domain

Markdown workflows for **development** delivery: tickets, releases, hotfixes, code review, debugging, security audit, architecture review, performance investigation, refactor, incident response, data migration, onboarding, API design, test strategy, dependency audit, and **project indexing** (overview + vector index + optional parallel docs + **wiki** via `generate-wiki` or GitNexus).

| `/ticket` | Run the **ticket** workflow ([`workflows/dev/ticket.md`](ticket.md)) — Kanban; layout and phases in that file (skills under [`skills/`](../../skills/)) |
| `/release` | Run the **release** workflow ([`workflows/dev/release.md`](release.md)) — release notes → implementation detail |
| `/hotfix` | Run the **hotfix** workflow ([`workflows/dev/hotfix.md`](hotfix.md)) — prod-urgent fix path |
| `/code-review` | Structured code review ([`workflows/dev/code-review.md`](code-review.md)) |
| `/debug` | Systematic debugging ([`workflows/dev/debug.md`](debug.md)) |
| `/security-audit` | Security audit ([`workflows/dev/security-audit.md`](security-audit.md)) |
| `/arch-review` | Architecture review ([`workflows/dev/arch-review.md`](arch-review.md)) |
| `/perf-investigation` | Performance investigation ([`workflows/dev/perf-investigation.md`](perf-investigation.md)) |
| `/refactor` | Safe refactor ([`workflows/dev/refactor.md`](refactor.md)) |
| `/incident` | Incident response ([`workflows/dev/incident.md`](incident.md)) |
| `/data-migration` | Data migration ([`workflows/dev/data-migration.md`](data-migration.md)) |
| `/onboarding` | Onboarding ([`workflows/dev/onboarding.md`](onboarding.md)) |
| `/api-design` | API design review ([`workflows/dev/api-design.md`](api-design.md)) |
| `/test-strategy` | Test strategy ([`workflows/dev/test-strategy.md`](test-strategy.md)) |
| `/dep-audit` | Dependency audit ([`workflows/dev/dep-audit.md`](dep-audit.md)) |
| `/index-project` | Index a project: overview docs + `index-project` CLI + query via `query-kb --index`; optional **parallel** Steps 3–4 via Task/sub-agents; **Step 7** wiki: `generate-wiki` or GitNexus `wiki` ([`workflows/dev/index-project.md`](index-project.md)) |
| `/sync-kb` | Sync KB from origin, auto-rebuild embeddings, verify ([`workflows/dev/sync-kb.md`](sync-kb.md)) — pull KB changes, detect document changes, rebuild embeddings |

Parent index: [`../README.md`](../README.md).
