# Workflows

A workflow is a **Markdown contract** (`.md` file) describing a sequence of steps: each step invokes a **skill** (by `name` in `SKILL.md`) or references a **prompt template** in `prompts/` / [templates/PROMPT_TEMPLATES.md](../templates/PROMPT_TEMPLATES.md).

This repo does **not** require an automated engine: an agent (or you) reads the file and executes steps in order; you can add a dedicated runner later.

## Naming

- **Runnable workflow files** use a **slug** name: pattern **`<slug>.md`** (e.g. `ticket.md`, `hotfix.md`, `release.md`). This matches slash commands **`/<slug>`** via a single stub in **`commands/<slug>.md`** (deployed to **`.cursor/commands/`** and **`.claude/commands/`** by the installer, or symlinked in this repo for dev).
- **Index files** only: `README.md` in `workflows/` or `workflows/<domain>/` — no prefix.

## Bundled workflows (by domain)

| Command | Document | Purpose |
|---------|----------|---------|
| **`/route`** | [`dev/route.md`](./dev/route.md) | Request routing & skill orchestration |
| **`/ticket`** | [`dev/ticket.md`](./dev/ticket.md) | Ticket / Kanban |
| **`/release`** | [`dev/release.md`](./dev/release.md) | Release notes → work |
| **`/hotfix`** | [`dev/hotfix.md`](./dev/hotfix.md) | Urgent production fix |
| **`/code-review`** | [`dev/code-review.md`](./dev/code-review.md) | Structured review |
| **`/debug`** | [`dev/debug.md`](./dev/debug.md) | Systematic debugging |
| **`/security-audit`** | [`dev/security-audit.md`](./dev/security-audit.md) | Security review |
| **`/arch-review`** | [`dev/arch-review.md`](./dev/arch-review.md) | Architecture review |
| **`/perf-investigation`** | [`dev/perf-investigation.md`](./dev/perf-investigation.md) | Performance |
| **`/refactor`** | [`dev/refactor.md`](./dev/refactor.md) | Safe refactor |
| **`/incident`** | [`dev/incident.md`](./dev/incident.md) | Incident response |
| **`/data-migration`** | [`dev/data-migration.md`](./dev/data-migration.md) | Data / DB migration |
| **`/onboarding`** | [`dev/onboarding.md`](./dev/onboarding.md) | Onboarding |
| **`/api-design`** | [`dev/api-design.md`](./dev/api-design.md) | API design |
| **`/test-strategy`** | [`dev/test-strategy.md`](./dev/test-strategy.md) | Test strategy |
| **`/dep-audit`** | [`dev/dep-audit.md`](./dev/dep-audit.md) | Dependencies |
| **`/index-project`** | [`dev/index-project.md`](./dev/index-project.md) | Index any repo |

Slash commands are authored once under **`commands/`**. **`*.md`** stubs include **`targets: [cursor, claude]`** by default. Routing helpers (`route`, `optimize`, `find-skill`, `run-workflow`) use **`targets: [claude]`** only. **`.cursor/commands/`** and **`.claude/commands/`** in this repo are symlinks into **`commands/`** for IDE discovery.

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
