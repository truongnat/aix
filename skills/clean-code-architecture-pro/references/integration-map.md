# Integration map — clean-code-architecture-pro

| Combined skill | Why | This skill owns | Other skill owns |
|----------------|-----|-----------------|------------------|
| **`testing-pro`** | Safe refactors | Boundary-level tests; characterization plan | Runners, CI, pyramid, flake policy |
| **`git-operations-pro`** | Reviewable diffs | Commit granularity for mechanical moves | Git mechanics |
| **`nestjs-pro`** / **`react-pro`** / **`nextjs-pro`** | Framework wiring | Keep domain free of framework leakage | Module/DI/API specifics |
| **`typescript-pro`** | Types at boundaries | Ports/adapters typing patterns | Compiler/tsconfig details |
| **`postgresql-pro`** / **`sql-data-access-pro`** | Persistence | Repository boundaries; no ORM in domain rules | SQL tuning, migrations |
| **`api-design-pro`** | Contracts | DTO vs domain mapping at HTTP boundary | OpenAPI, versioning |
| **`deployment-pro`** | Release | N/A for pure structure | Rollout when architecture implies service split |
| **`feedback-pro`** | Review output | Structure of architecture review | Severity / people framing |
| **`business-analysis-pro`** | Rare | Align module boundaries with domain language | Requirements ownership |

**Boundary:** **`clean-code-architecture-pro`** owns **dependency direction**, **module semantics**, **refactor sequencing**, and **structural trade-offs**; framework and infra skills own **tool-specific** implementation truth.
