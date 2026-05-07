# Workflows — `ops` domain

Markdown workflows for **operations** delivery: release management, hotfixes, incident response, project indexing, knowledge base sync, and dependency auditing.

| `/release` | Run the **release** workflow ([`release.md`](/workflows/ops/release.md)) — release notes → implementation detail |
| `/hotfix` | Run the **hotfix** workflow ([`hotfix.md`](/workflows/ops/hotfix.md)) — prod-urgent fix path |
| `/incident` | Incident response ([`incident.md`](/workflows/ops/incident.md)) |
| `/index-project` | Index a project: overview docs + `index-project` CLI + query via `query-kb --index`; optional **parallel** Steps 3–4 via Task/sub-agents; **Step 7** wiki: `generate-wiki` or GitNexus `wiki` ([`index-project.md`](/workflows/ops/index-project.md)) |
| `/sync-kb` | Sync KB from origin, auto-rebuild embeddings, verify ([`sync-kb.md`](/workflows/ops/sync-kb.md)) — pull KB changes, detect document changes, rebuild embeddings |
| `/dep-audit` | Dependency audit ([`dep-audit.md`](/workflows/ops/dep-audit.md)) |

Parent index: [`workflows/README.md`](/workflows/README.md).
