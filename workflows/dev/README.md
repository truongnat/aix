# Workflows — `dev` domain

Markdown workflows for **development** delivery: tickets, releases, hotfixes, code review, debugging, security audit, architecture review, performance investigation, refactor, incident response, data migration, onboarding, API design, test strategy, dependency audit, and **project indexing** (overview + vector index + optional parallel docs + **wiki** via `generate-wiki` or GitNexus).

| `/ticket` | Run the **ticket** workflow ([`ticket.md`](/workflows/dev/ticket.md)) — Kanban; layout and phases in that file (skills under [`skills/`](/skills/)) |
| `/release` | Run the **release** workflow ([`release.md`](/workflows/dev/release.md)) — release notes → implementation detail |
| `/hotfix` | Run the **hotfix** workflow ([`hotfix.md`](/workflows/dev/hotfix.md)) — prod-urgent fix path |
| `/code-review` | Structured code review ([`code-review.md`](/workflows/dev/code-review.md)) |
| `/debug` | Systematic debugging ([`debug.md`](/workflows/dev/debug.md)) |
| `/security-audit` | Security audit ([`security-audit.md`](/workflows/dev/security-audit.md)) |
| `/arch-review` | Architecture review ([`arch-review.md`](/workflows/dev/arch-review.md)) |
| `/perf-investigation` | Performance investigation ([`perf-investigation.md`](/workflows/dev/perf-investigation.md)) |
| `/refactor` | Safe refactor ([`refactor.md`](/workflows/dev/refactor.md)) |
| `/incident` | Incident response ([`incident.md`](/workflows/dev/incident.md)) |
| `/data-migration` | Data migration ([`data-migration.md`](/workflows/dev/data-migration.md)) |
| `/onboarding` | Onboarding ([`onboarding.md`](/workflows/dev/onboarding.md)) |
| `/api-design` | API design review ([`api-design.md`](/workflows/dev/api-design.md)) |
| `/test-strategy` | Test strategy ([`test-strategy.md`](/workflows/dev/test-strategy.md)) |
| `/dep-audit` | Dependency audit ([`dep-audit.md`](/workflows/dev/dep-audit.md)) |
| `/index-project` | Index a project: overview docs + `index-project` CLI + query via `query-kb --index`; optional **parallel** Steps 3–4 via Task/sub-agents; **Step 7** wiki: `generate-wiki` or GitNexus `wiki` ([`index-project.md`](/workflows/dev/index-project.md)) |
| `/sync-kb` | Sync KB from origin, auto-rebuild embeddings, verify ([`sync-kb.md`](/workflows/dev/sync-kb.md)) — pull KB changes, detect document changes, rebuild embeddings |

Parent index: [`workflows/README.md`](/workflows/README.md).
