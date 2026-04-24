| Field | Value |
|-------|-------|
| title | Activity and decisions log |
| summary | Dated entries: user/agent decisions, audits, follow-ups for this skills template repo |
| tags | repo, activity, decisions |
| updated | 2026-04-03 |

# Activity and decisions log

**Purpose:** Record **short** notes on important decisions (not a substitute for git log). Maintainers or agents add a dated section when a decision is clear.

**Policy:** See [documentation-persistence.md](../policies/documentation-persistence.md) and Cursor rule **`.cursor/rules/documentation-persistence.mdc`**.

---

### 2026-04-24

- **Change:** **Major refactor: Removed Skill System v1, replaced with router-pro system skill.** Removed TypeScript-based Skill System v1 code (`src/core/`, `src/skills/`) and CLI scripts. Created **router-pro** system skill for automatic request analysis, prompt optimization, and dynamic skill/workflow/template discovery. Added **/route** command and workflow. Updated skill architecture documentation to distinguish system skills vs working skills. Upgraded all report and issue templates to professional quality with executive summaries, risk assessments, and detailed sections. Removed local skill installation option - now always installs to global IDE directories. Fixed `saveInstallManifest` to create `.cursor` directory before writing manifest. Updated AGENTS.md, skills-layout.md, and rebuilt skill index (now 48 skills including router-pro).

- **Source:** user + agent

### 2026-04-03

- **Change:** **Skills Pro Tier A sweep (plan):** Upgraded remaining **Tier C/B** bundles with **`references/decision-tree.md`**, **`anti-patterns.md`**, **`integration-map.md`**, **`versions.md`** (where applicable), expanded **`SKILL.md`** (3 Quick examples, 7+ checklist, triggers) for **Wave 2** (analysis/research), **Wave 3** (ops/meta incl. **`repo-tooling-pro`** **`command-matrix.md`**), **Wave 4** (Tier B: **`docker-pro`**, **`ci-cd-pro`**, **`planning-pro`**, **`feedback-pro`**, **`git-operations-pro`**, **`caching-pro`**, **`auth-pro`**, **`design-system-pro`** — integration + versions maps). **Wave 5:** README stubs for **`typescript-pro`**, **`ai-integration-pro`**, **`microservices-pro`**, **`performance-tuning-pro`**, **`clean-code-architecture-pro`**; trigger/Related-skill polish across existing Tier A stacks. Ran **`validate-skills`**, **`build-skill-index`**, **`build-kb`**, **`verify-kb`**, **`npm run build`**.

- **Change:** **Repo hygiene + README:** Removed stray **`.claude/worktrees/`** (untracked duplicate tree); **`.gitignore`** — ignore `.claude/worktrees/`, fixed RAG comment. Root **[`LICENSE`](../../../LICENSE)** (MIT). **[`README.md`](../../../README.md)** — directory layout aligned with tree, **Project indexing** section, `/index-project` row + parallel note, License pointer.

- **Change:** **`generate-wiki` extensions:** [`src/tools.ts`](../../../src/tools.ts) — **pipe tables**; relative **`.md`→`.html`** in link hrefs; sidebar **keyword search** (embedded script); CLI **`--watch`** (1.5s poll on `docs/`) and **`--open`** (system browser). Docs: [`workflows/dev/index-project.md`](../../../workflows/dev/index-project.md), [`commands/index-project.md`](../../../commands/index-project.md), [`scripts/README.md`](../../../scripts/README.md), [`skills/repo-tooling-pro/SKILL.md`](../../../skills/repo-tooling-pro/SKILL.md).

- **Change:** **`generate-wiki` renderer:** [`src/tools.ts`](../../../src/tools.ts) — fix indented `-` list markers; **`[text](url)`** links with `javascript:`/`data:` blocked; **ordered lists** (`1.`); **dark mode** (`prefers-color-scheme`). [`skills/repo-tooling-pro/SKILL.md`](../../../skills/repo-tooling-pro/SKILL.md) — `index-project` / `generate-wiki` in description, triggers, When to use. Ran `build-skill-index`.

- **Change:** **`index-project` v1.1 — parallelization + wiki:** [`workflows/dev/index-project.md`](../../../workflows/dev/index-project.md) — **`## Parallelization`** (Steps 3–4 `parallel-with`; Step 4 `parallel-each` modules); **Step 7 `generate-wiki`** (GitNexus `npx gitnexus wiki` when status OK, else **`node dist/tools.js generate-wiki`**). **CLI:** `generate-wiki` — static HTML from `<index_base>/docs/**/*.md`. Convention: [`workflows/README.md`](../../../workflows/README.md) **`## Parallel execution`**. Updated [`commands/index-project.md`](../../../commands/index-project.md), [`templates/report/project-index-report.md`](../../../templates/report/project-index-report.md), **`package.json`**, **`scripts/README.md`**, **`AGENTS.md`**.

- **Change:** **`/index-project` workflow:** [`workflows/dev/index-project.md`](../../../workflows/dev/index-project.md) — six steps (scan structure, stack, overview, module summaries, CLI index, verify queries). **CLI:** `index-project` (multi-glob scan, binary skip, chunking; writes `embeddings.json` + `manifest.json`); **`query-kb` / `query-kb-batch`** accept **`--index <dir>`**. Stub [`commands/index-project.md`](../../../commands/index-project.md); report template [`templates/report/project-index-report.md`](../../../templates/report/project-index-report.md). Registry: **`workflows/dev/README.md`**, **`workflows/README.md`**, **`README.md`**, **`AGENTS.md`**, **`templates/README.md`**, **`scripts/README.md`**.

- **Change:** **Source-of-truth / devkit install:** Full bundle now syncs to **`.agents/devkit/`** (marker **`.devkit-bundle`**) instead of **`vendor/own-skills/`**; **`uninstall`** and **`verify-bundle-install`** still honor legacy **`vendor/own-skills/`** + **`.own-skills-bundle`**. **Slash commands:** single canonical copy under **`commands/`** with YAML **`targets`** (default Cursor+Claude; routing stubs Claude-only); **`.cursor/commands/`** and **`.claude/commands/`** are repo **symlinks** for dev. Installer **`installCommands`** reads **`commands/`** and symlinks into the consumer project. **`installSkill`:** added **`.codex/skills/`** when **`--all-ides`**. **`verify-bundle-install`:** resolves bundle path correctly, runs **`validate-skills`** via **`bundle/dist/tools.js`**, optional **`--strict`** drift warnings. **`package.json`:** **`devkit-bundle`**, bins **`devkit`** + **`own-skills`**. Docs: **`README.md`**, **`AGENTS.md`**, **`workflows/README.md`**, **`commands/README.md`**.

- **Change:** **Post–repo-review build:** [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) — `npm ci`, `npm run build`, `validate-skills`, `build-kb`, `verify-kb` on push/PR. **`.claude/commands/`** — copied all **`w-*.md`** from **`.cursor/commands/`** so Claude Code can run `/ticket`, `/code-review`, … parity with Cursor. **Report templates:** [`templates/report/test-strategy.md`](../../../templates/report/test-strategy.md), [`dependency-audit.md`](../../../templates/report/dependency-audit.md), [`debug-report.md`](../../../templates/report/debug-report.md); linked from [`OUTPUT_CONVENTIONS.md`](../../../OUTPUT_CONVENTIONS.md), [`templates/README.md`](../../../templates/README.md), and workflows [`test-strategy.md`](../../../workflows/dev/test-strategy.md), [`dep-audit.md`](../../../workflows/dev/dep-audit.md), [`debug.md`](../../../workflows/dev/debug.md). **`templates/PROMPT_TEMPLATES.md`** — explicit deprecation notice (canonical: `prompts/`). **`IMPROVEMENT_PLAN.md`** — expanded **Implementation status** table (CI, Claude parity, new reports). **Skills:** **`clean-code-architecture-pro`**, **`performance-tuning-pro`**, **`microservices-pro`** — added `references/decision-tree.md`, `anti-patterns.md`, `integration-map.md` + **`SKILL.md`** (summaries, three quick examples, checklist). **`workflows/README.md`**, **`AGENTS.md`** — document `.claude` `/*` mirror. Ran `node dist/tools.js validate-skills` + `build-skill-index`.

- **Source:** user + agent

### 2026-04-02

- **Change:** **IMPROVEMENT_PLAN.md** — added **Implementation status** (rolling snapshot + `build-skill-index` convention); **Diagnosis** labeled historical baseline. **`prompts/README.md`** — §4.2 compliance table (Few-shot / Chain audit backlog). **`skills/SKILL_AUTHORING_RULES.md`** §8 — row for substantive skill edits → **`node dist/tools.js build-skill-index`**.

- **Change:** **Templates sweep:** [`templates/PROMPT_TEMPLATES.md`](../../../templates/PROMPT_TEMPLATES.md) — “Using templates” now documents **`node dist/tools.js`** + `prompts/` (removed nonexistent `use_template.py`); banners/repo notes on [`templates/SKILL_SYSTEM_GUIDE.md`](../../../templates/SKILL_SYSTEM_GUIDE.md), [`templates/COOL_TECHNOLOGIES.md`](../../../templates/COOL_TECHNOLOGIES.md); fixed header + LangChain section + repo note on [`templates/GITHUB_DEPLOYMENT_GUIDE.md`](../../../templates/GITHUB_DEPLOYMENT_GUIDE.md).

- **Change:** **IMPROVEMENT_PLAN wave (mobile + desktop):** **`react-native-pro`**, **`flutter-pro`**, **`electron-pro`** — added `references/` (`anti-patterns`, `decision-tree`, `integration-map`, `versions`) and **`SKILL.md`** updates (Operating principles, Anti-patterns / decision / integration / versions summaries, Resources, three Quick examples, checklist). Ran `node dist/tools.js build-skill-index`.

- **Change:** **Docs sweep (Python → Node CLI):** updated **`skills-self-review-pro`** (`SKILL.md`, `references/*`), **`knowledge-base/VERIFY.md`**, **`README.md`**, **`embeddings/README.md`**, runbook **`rebuild-knowledge-base-index.md`**, **`config.example.md`**, **`templates/config.template.md`**, **`templates/START_HERE.md`**, **`PROJECT_GAP_ANALYSIS.md`**, **`web-research-pro`** workflow reference; **`.cursor/rules/documentation-persistence.mdc`**; policy **`documentation-persistence.md`** — commands use **`node dist/tools.js`** per [`scripts/README.md`](../../../scripts/README.md).

- **Change:** **Repo tooling + workflows:** rewrote [`skills/repo-tooling-pro/`](../../../skills/repo-tooling-pro/) (frontmatter, `SKILL.md`, `references/*`) for **Node** `dist/tools.js` / `npm` (removed Python/venv drift); updated [`skills/README.md`](../../../skills/README.md) bundle-audit commands. Added **Decision paths**, **Error handling**, **Output format** (link [`OUTPUT_CONVENTIONS.md`](../../../OUTPUT_CONVENTIONS.md)), **Time estimate**, **Escalation** to [`workflows/dev/ticket.md`](../../../workflows/dev/ticket.md) (v1.2), [`release.md`](../../../workflows/dev/release.md), [`hotfix.md`](../../../workflows/dev/hotfix.md).

- **Change:** **Support skills depth:** expanded **`planning-pro`**, **`feedback-pro`**, **`git-operations-pro`** — richer `tips-and-tricks.md` and `edge-cases.md` (examples: phased plans, finding tables, `git` command blocks); optional **`decision-tree.md`** + **`anti-patterns.md`** per skill; updated **`SKILL.md`** (summaries, Resources, three Quick examples, checklist). Ran `build-skill-index` / `validate-skills`.

- **Change:** **IMPROVEMENT_PLAN Phase 6 (start):** added core/mid-tier `references/` depth — **`nestjs-pro`**, **`postgresql-pro`** (`decision-tree`, `integration-map`, `anti-patterns`, `versions`) + **`SKILL.md`** updates; **`docker-pro`**, **`ci-cd-pro`**, **`auth-pro`**, **`caching-pro`** (`decision-tree`, `anti-patterns`; **ci-cd** also `tips-and-tricks`, `edge-cases`); **`ai-integration-pro`** (`decision-tree`, `anti-patterns`, `tips-and-tricks`, `edge-cases`, `integration-map`, `versions`). Expanded **Quick example** to three scenarios and **Resources** tables where updated. Ran `node dist/tools.js build-skill-index`.

- **Change:** Completed **IMPROVEMENT_PLAN** §3.2 gap: added workflows [`data-migration.md`](../../../workflows/dev/data-migration.md), [`onboarding.md`](../../../workflows/dev/onboarding.md), [`api-design.md`](../../../workflows/dev/api-design.md), [`test-strategy.md`](../../../workflows/dev/test-strategy.md), [`dep-audit.md`](../../../workflows/dev/dep-audit.md) with Cursor slash stubs under [`.cursor/commands/`](../../../.cursor/commands/); updated root **README**, **AGENTS**, [`workflows/README.md`](../../../workflows/README.md), [`workflows/dev/README.md`](../../../workflows/dev/README.md).

- **Source:** user + agent

### 2026-04-01

- **Change:** **IMPROVEMENT_PLAN** implementation: repo root [`OUTPUT_CONVENTIONS.md`](../../../OUTPUT_CONVENTIONS.md); report templates under [`templates/report/`](../../../templates/report/) (including performance + incident); [`skills/SKILL_AUTHORING_RULES.md`](../../../skills/SKILL_AUTHORING_RULES.md) §10–§12 (quality rubric, prompt guidance, update-vs-new decision tree); expanded [`workflows/dev/code-review.md`](../../../workflows/dev/code-review.md) and [`debug.md`](../../../workflows/dev/debug.md) with decision paths, error handling, output contracts; new workflows [`security-audit.md`](../../../workflows/dev/security-audit.md), [`arch-review.md`](../../../workflows/dev/arch-review.md), [`perf-investigation.md`](../../../workflows/dev/perf-investigation.md), [`refactor.md`](../../../workflows/dev/refactor.md), [`incident.md`](../../../workflows/dev/incident.md); [`prompts/`](../../../prompts/) reorganized by job (planning, review, debugging, generation, analysis, chains) with priority prompt files; template scaffolds under [`templates/prompt/`](../../../templates/prompt/), [`templates/workflow/`](../../../templates/workflow/), [`templates/issue/`](../../../templates/issue/), [`templates/kb-document/`](../../../templates/kb-document/); deepened **react-pro**, **nextjs-pro**, **security-pro**, **testing-pro**, **typescript-pro** with anti-patterns summaries, decision trees, integration maps, and expanded quick examples. Updated root **README**, **AGENTS**, **workflows** indexes, **templates/README**.

- **Change:** Full script runtime migrated to **TypeScript/Node**: added `src/` + `tsconfig.json`, compiled `dist/own-skills.js` and `dist/tools.js`, replaced Python tooling commands (`scripts/*.py`) with TypeScript command map (`list-skills`, `validate-skills`, `analyze-skills`, `build-skill-index`, `install-skill`, `verify-bundle-install`, `build-kb`, `query-kb`, `query-kb-batch`, `verify-kb`).
- **Change:** Removed legacy runtime files: `install.sh`, `uninstall.sh`, `bin/own-skills.mjs`, and all Python scripts under `scripts/`.
- **Change:** Updated command references in root README, scripts README, AGENTS, and `ticket` workflow command docs to Node/TS command forms.

- **Change:** Migrated **`bin/own-skills.mjs`** to **Node-only install/uninstall** (no `bash` dependency): bundle sync, rule link/copy, `install_skill.py` execution per skill, and Node filesystem-based uninstall. Prompt UX now uses option lists instead of Y/N confirms for key choices.

- **Change:** **Install UX:** removed **`install-remote.sh`** and **`uninstall-remote.sh`**; documented **npx** + **`bin/own-skills.mjs`** only. Root **`install.sh`** / **`uninstall.sh`** remain as engines invoked by the CLI (not removed).

- **Change:** **`ticket`** rework: ticket flow uses **only** bundled [`skills/`](../../../skills/) (catalog + `list_skills.py`); **`kanban/<ticket>/`** contract inlined in [`workflows/dev/ticket.md`](../../../workflows/dev/ticket.md) (no `ex/ticket`). Updated **`/ticket`** commands, **AGENTS**, **`release`** cross-refs.

- **Change:** Added **release** workflow [`workflows/dev/release.md`](../../../workflows/dev/release.md) (notes → implementation detail) and slash **`/release`** ([`.claude/commands/release.md`](../../../.claude/commands/release.md)); updated **`workflows/dev/README.md`**, root **README**, **AGENTS**, **templates**, **`run-workflow`**.

- **Change:** **Workflows:** moved ticket workflow to [`workflows/dev/ticket.md`](../../../workflows/dev/ticket.md); added hotfix as [`workflows/dev/hotfix.md`](../../../workflows/dev/hotfix.md) (renamed from `hotfix.md`) and slash **`/hotfix`**. Documented **naming rule** — runnable workflow files **`w-<slug>.md`** in [`workflows/README.md`](../../../workflows/README.md#naming). Updated root **README**, **AGENTS**, **`run-workflow`** / **`route`**, **§8** workflow row.

- **Source:** user + agent
- **Change:** Added **`scripts/verify_bundle_install.py`** to sanity-check full bundle installs in a target project; README + `install.sh` hint.
- **Change:** Normalized user-facing docs to **English** (README Quick start, activity log, KB INDEX, documentation persistence policy + Cursor rules, `formatting-common.mdc`, prompts, `external-reviemapping.md`, `web-research-pro` related-skills row; aligned `config.md` with `config.example.md`).
- **Change:** Simplified **remote** docs: two `curl` lines (install/uninstall) in README; removed zx / `install-remote.mjs` / `package.json`; streamlined `install-remote.sh` / `uninstall-remote.sh`; re-run install = **update** (messages in `install.sh`); removed `install-bundle-layout.md`.
- **Change:** Bundled skill **`cli-pro`** (advanced CLI: argv, exit/stderr, pipes/TTY, completion); updated §8 (`README`, `AGENTS`, `skills-layout`, `SKILL_AUTHORING_RULES` §1).
- **Change:** Remote install defaults to **multi-IDE**: `install-remote.sh` calls `install.sh --all-ides` (Cursor `.cursor/skills`, Claude Code `.claude/skills`, Antigravity `.agent/skills`); `install_skill.py` adds `--ides` / `--all-ides`; `uninstall.sh` removes all three paths; README / `scripts/README` updated.
- **Change:** **Full bundle install** (historical): `install.sh --full` / remote default copied the repo into `<project>/vendor/own-skills`, … — **superseded:** default bundle root is now **`.agents/devkit/`** (2026-04-03); uninstall/verify still clean legacy **`vendor/own-skills`** when present.
- **Change:** **Remote uninstall via pipe**: `uninstall-remote.sh` sets `--force` when stdin is not a TTY (avoids `read` EOF + `set -e`); `uninstall.sh` skips `read` when non-TTY; fixed `((removed_count++))` with `set -e`; README notes non-interactive behavior.

### 2026-03-31

- **Source:** agent + user request
- **Change:** Added **documentation-persistence** rule, policy + activity log; extended **skills-self-review-pro** (tech refresh + **web-research-pro**).
- **Follow-up:** Run `build_kb` after KB corpus changes; periodically self-review + official docs for the stack.
- **Change:** New skill **`market-research-pro`** (SKILL + references) and README/AGENTS/skills-layout per §8.
- **Change:** New skill **`strategic-consulting-pro`** (SKILL + references) and README/AGENTS/skills-layout/SKILL_AUTHORING_RULES per §8.

### YYYY-MM-DD (template)

- **Source:** (user / agent / CI)
- **Change:** (e.g. run `analyze_skills.py --self-review`, add skill X)
- **Conclusion / follow-up:** (…)
