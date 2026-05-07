# Workflows

Workflows are organized by domain to support scalable addition of new skills and workflows across different business areas.

## Domain Structure

```
workflows/
├── dev/              # Development workflows (coding, architecture, API)
├── ops/              # Operations workflows (deployment, monitoring, incident)
├── qa/               # Quality Assurance workflows (testing, code review, audit)
├── pm/               # Project Management workflows (ticket, planning, release)
├── data/             # Data workflows (migration, analytics, database)
├── security/         # Security workflows (audit, compliance, threat modeling)
├── hr/               # HR/Onboarding workflows
├── finance/          # Finance workflows (future)
├── trading/          # Trading workflows (future)
├── marketing/        # Marketing workflows (future)
└── [future-domains]/ # Extensible for new domains
```

## Workflow Naming Convention

- Use kebab-case: `/feature-dev`, `/api-test`, `/load-test`
- Domain prefix optional: `/dev/feature-dev`, `/ops/deploy`
- Short forms preferred: `/ticket` instead of `/pm/ticket`

## Adding New Domains

To add a new domain:

1. Create directory: `workflows/<domain>/`
2. Create `README.md` with domain overview
3. Add workflows following existing patterns
4. Update this README with new domain
5. Register domain skills in `skills/` directory

## Current Workflows by Domain

### dev/ (Development)
- `/ticket` - Ticket/feature development
- `/refactor` - Safe refactoring
- `/api-design` - API design
- `/route` - Request routing optimization

### ops/ (Operations)
- `/release` - Release management
- `/hotfix` - Urgent production fix
- `/incident` - Incident response
- `/index-project` - Codebase indexing
- `/sync-kb` - Knowledge base sync

### qa/ (Quality Assurance)
- `/code-review` - Structured code review
- `/test-strategy` - Test strategy
- `/debug` - Systematic debugging
- `/security-audit` - Security review
- `/arch-review` - Architecture review
- `/perf-investigation` - Performance investigation

### pm/ (Project Management)
- (Ticket workflow covers PM needs)

### data/ (Data)
- `/data-migration` - Data/database migration

### security/ (Security)
- (Security-audit covers most security needs)

### hr/ (Human Resources)
- `/onboarding` - Team onboarding

## Proposed Future Domains

### finance/
- `/financial-audit` - Financial statement audit
- `/budget-planning` - Budget allocation
- `/revenue-forecast` - Revenue projection
- `/expense-tracking` - Expense monitoring

### trading/
- `/trade-execution` - Trade execution workflow
- `/risk-analysis` - Trading risk assessment
- `/portfolio-rebalance` - Portfolio adjustment
- `/market-analysis` - Market data analysis

### marketing/
- `/campaign-plan` - Marketing campaign
- `/content-strategy` - Content planning
- `/seo-audit` - SEO optimization
- `/analytics-review` - Marketing analytics

## Workflow Conventions

See [conventions.md](./conventions.md) for detailed workflow authoring guidelines.

This repo does **not** require an automated engine: an agent (or you) reads the file and executes steps in order; you can add a dedicated runner later.

## Parallel execution

Workflows may describe **safe concurrency** for agent hosts that support sub-agents (e.g. Cursor **Task** tool). Use a dedicated **`## Parallelization`** section (or bullets under **Steps**) with explicit **fork/join** semantics.

| Marker | Use |
|--------|-----|
| **`parallel-with: Step N`** | This step may run **at the same time** as Step *N* after shared prerequisites are done. |
| **`parallel-each: <unit>`** | **Fan-out:** one parallel task per `<unit>` (e.g. per module, per file); **join** before the next step that needs all units. |

**Rules of thumb:**

- Document **what must finish before** a fork and **what must exist before** the join.
- Prefer **independent outputs** (separate files) for parallel units to avoid merge conflicts.
- If the host has no Task API, agents should **fall back to sequential** execution in step order.

## Convention (Markdown)

Each workflow should include:

1. **Title** `# Workflow: <id>`
2. **Metadata table or list** — `id`, `name`, `version`
3. **Inputs / Outputs** — variable table
4. **Steps** — each step is `###` with:
   - Type: `skill` or prompt template / doc reference
   - Skill name or template id
   - Input/output (variables may use `` `topic` ``)

## Short example

Save as **`my-flow.md`** (see [Naming](#naming) above).

```markdown
# Workflow: my-flow

## Metadata
| Field | Value |
|-------|-------|
| **id** | `my-flow` |
| **version** | 1.0 |

## Inputs
| Variable | Required |
|----------|----------|
| `topic` | Yes |

## Steps
### Step 1 — collect
- **Type:** skill
- **Skill:** `my-skill`
- **Input:** `query` = `topic`
```

## Layout

- Domain folders under **`workflows/<domain>/`** (e.g. **`dev/`**). Add **`README.md`** per domain when you introduce a new folder. Update root **`README.md`** when you add or move workflow files.
