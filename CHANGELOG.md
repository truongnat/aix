# Changelog

## 1.1.4

### Patch Changes

- Remove the redundant `init` command and make `install` the single bootstrap path.
- Fix non-git install fallback, provider prompt gating, and `flow` / install command routing.
- Expand the Codex-native install surface with agents, hooks, domain generation, and plugin build workflow.
- Fix CI regressions across lint, Node 18 wizard flows, and Windows smoke install.

## 1.1.3

### Patch Changes

- Improve provider binary detection, make project installs fail fast without git, and align update, uninstall, status, and doctor with the recorded install manifest.

## 1.1.2

### Patch Changes

- Refine domain bootstrap UX by removing interactive domain prompts from `init` and `install`, adding the headless `domains` command, tightening the session-start bootstrap guidance, and fixing duplicate Cursor rule output during project installs.

## 1.1.1

### Patch Changes

- Add a headless `domains` command, remove interactive domain prompts from `init` and `install`,
  and update session-start guidance for automatic domain bootstrap.

## [1.1.0] - 2026-06-08

### Added

- agent-driven domain skill generation: `init` analysis gate (`prompt-templates/domain-analysis.md`, `lib/stack-detect.ts`) plus deterministic generation into `.harness/skills/`, `.harness/SKILLS.md`, `.harness/WORKFLOW.md`, and path-scoped domain rules for Claude, Cursor, Codex, and Gemini
- spec-driven layer (opt-in): `templates/CHANGE_SPEC.md` delta specs and optional `.harness/specs/`
- delegated-worker memory (opt-in): `.harness/memory/workers/` with bounded notes
- explorer worker and `docs/context-engineering.md` doctrine; `docs/token-budget.md`
- prompt-quality standard (`skills/PROMPT_FORMAT_STANDARD.md`) with modular Few-shot/CoT/ReAct format enforced across skills and dispatch prompts, plus a conformance eval
- eval harness maturity (A/B runner, LLM judge, telemetry insights) and policy engine G0–G3
- `v1.1.0` release notes — [v1.1.0-release-notes.md](docs/v1.1.0-release-notes.md)

### Changed

- backend lifecycle (install, uninstall, update, doctor, skeleton, git-hygiene) ported to in-process TypeScript
- generated domain skills conform to the full core skill heading contract

### Fixed

- core review findings across git hygiene, evals, and policy enforcement
- keep CI green when the repo no longer has root-level JavaScript files
- build before contract validation in the tag-triggered publish workflow

### Notes

- `v1.1.0` is a minor release: new capabilities are backward-compatible and opt-in.
- The core workflow loop and provider support posture are unchanged.

## [1.0.1] - 2026-06-05

### Added

- walkthrough video integration in the README and GitHub Pages landing page
- `v1.0.1` release notes — [v1.0.1-release-notes.md](docs/v1.0.1-release-notes.md)
- release metadata regression test for package/docs/site version alignment

### Changed

- README positioning, quickstart flow, and walkthrough visibility
- landing page onboarding flow, embedded product walkthrough section, and open-source presentation polish
- release metadata aligned to `v1.0.1` across package manifests, docs index, and user-facing site labels

### Notes

- `v1.0.1` is a patch release focused on docs, demo, and release polish.
- Core workflow contracts and provider support posture are unchanged.

## [1.0.0] - 2026-06-04

### Added

- Session Start protocol (`docs/session-start.md`, `templates/SESSION_START.md`)
- Daily dev report layer (`REPORT.md`, `PR_MESSAGE.md`, `CHANGE_SUMMARY.md`, `scripts/generate-report-context.js`)
- Hooks and dynamic skills layer (`hooks/core/*`, skill lifecycle, compose/create workflows)
- Provider rule adapter layer (`rules/core/`, `rules/providers/`, `lib/provider-rule-renderer.js`)
- Delegated workers with Claude native agent adapter
- Layered validation (`lib/validate/session-start.js`, `daily-dev-report.js`, etc.)
- GitHub Pages 1.0.0 landing page refresh

### Changed

- Product positioning: markdown-first workflow **guardrail kit** (not agent framework)
- README and landing page focused on 10-second clarity: Session Start → loop → evidence → PR-ready ship
- `harness-ship` documents report artifacts as required outputs when verification supports shipping
- Claude provider template tracked in git despite common global `CLAUDE.md` ignore patterns

### Notes

- v1.0.0 means stable **contract** for dogfooding; provider behavior still varies.
- Historical: [0.11.0] and earlier entries below.

## [0.9.2] - Unreleased

### Added

- v0.9.2 installer UX and git hygiene design — [installer-ux-v0.9.2-plan.md](docs/installer-ux-v0.9.2-plan.md)
- git hygiene policy — [git-hygiene-policy.md](docs/git-hygiene-policy.md); **`.git/info/exclude` preferred** for private/local project installs
- install command model (`install` / `uninstall` / `update`) — [install-command-model.md](docs/install-command-model.md); `--ignore-strategy info-exclude|gitignore|none|auto`
- uninstall and update design — [uninstall-update-design.md](docs/uninstall-update-design.md)
- Antigravity provider research — [antigravity-provider-research.md](docs/antigravity-provider-research.md) (planned, not implemented)

### Changed

- private-mode ignore policy: do **not** edit `.gitignore` by default (tracked file); use `.git/info/exclude` instead

### Added (implementation)

- dogfood E1: private Cursor git hygiene — [scenario-e1-cursor-private-git-hygiene.md](docs/pack-dogfood-reports/scenario-e1-cursor-private-git-hygiene.md)
- experimental Windows PowerShell bootstrap wrapper in [aih.ps1](aih.ps1)
- private project install via `.git/info/exclude` in [install.sh](install.sh)
- `--visibility private|shared` and `--ignore-strategy info-exclude|none|auto`
- `install` verb alias; warning when `--visibility` omitted (defaults shared)
- [private-install-git-hygiene.md](docs/private-install-git-hygiene.md)
- **Step 2:** private `.ai-harness/` capability cache — [install-cache.js](install-cache.js), [private-capability-cache.md](docs/private-capability-cache.md)
- `--install-cache` / `--no-install-cache`; default cache for all project runtime-native providers
- provider-agnostic model: entrypoint → `.ai-harness/` → `.harness/` (docs + runtime README)
- runtime bootstraps (Cursor, generic, Claude, Gemini, OpenCode) point to `.ai-harness/` + `.harness/`
- stop exposing `windsurf` as a first-class runtime until a verified native payload exists
- project `install.sh uninstall` for runtime-native installs
- uninstall safe defaults: keep `.ai-harness/` and `.harness/` unless explicitly removed
- uninstall cleans the harness block from `.git/info/exclude`
- project `install.sh update` for runtime-native installs
- update refreshes `.ai-harness/` and runtime entrypoints with overwrite semantics
- update preserves `.harness/` project state
- simplified `install.sh` command defaults so `install`, `update`, and `uninstall` work as short primary commands
- runtime auto-detection for simple project `install`, `update`, and `uninstall`
- lightweight `install.sh status` and `install.sh doctor`
- non-interactive simple install no longer defaults to manual root-copy fallback when runtime detection fails
- `aih.sh` lifecycle dispatcher for `install`, `update`, `uninstall`, `status`, and `doctor`
- `install.sh` kept as a compatibility wrapper around `aih.sh`
- dogfood F1: simple lifecycle flow validated for `aih.sh` + `install.sh` wrapper compatibility

### Planned (implementation)

- **Step 3+:** uninstall/update verbs; wizard; Antigravity
- provider multi-select and install wizard
- `install.sh` verbs: install, uninstall, update
- Antigravity runtime paths after verification

## [0.11.0] - 2026-06-03

### Added

- Standardized canonical harness command IDs to hyphen form (`harness-plan`, …); native slash `/harness-plan` where supported; colon form deprecated in active docs
- v0.11.0 Step 4 public demo polish — GitHub Actions [CI](.github/workflows/ci.yml), README Demo section, [TRANSCRIPT.md](examples/dogfood-tiny-node-api/TRANSCRIPT.md)
- v0.11.0 Step 3 end-to-end dogfood demo — [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api) with `.harness/` artifacts and real `npm test` evidence in VERIFY
- v0.11.0 Step 2 command execution contracts: minimum read sets, phase preconditions, required outputs, redirect behavior, and failure conditions across harness commands
- verification evidence contract for `VERIFY.md`: status, tests run, manual checks, evidence, and known gaps
- skill boundaries and output contracts: `Inputs`, `Output Contract`, and `Common Failure Modes` across validated skills
- progressive loading guidance in [AGENTS.md](AGENTS.md) so skills and artifacts are loaded only when they directly support the active command and task

### Changed

- Narrowed active provider scope to Claude Code, Cursor, Codex, and Gemini.
- Removed OpenCode from active provider support (wizard, install-runtime, README, matrices).
- Claude Code as primary recommended path; Cursor secondary; Codex/Gemini experimental.
- Product identity: lightweight markdown-first workflow kit (README, PACK.md, package description).
- harness phase discipline now redirects to earlier commands when preconditions fail instead of allowing soft-success prose
- Contract validation beyond headings: substantive command/skill sections, VERIFY/PLAN templates, dogfood demo contracts

### Notes

- Historical changelog entries may still mention OpenCode where relevant to previous versions.
- Release notes and checklist: [docs/v0.11.0-release-notes.md](docs/v0.11.0-release-notes.md). Feature scope frozen at v0.11.0.

## [0.10.8] - 2026-06-03

### Fixed

- `harness-discuss` contract: action-oriented synthesis when `.harness/REVIEW.md` (or plan/status) exists — no redundant "what do you want?" prompts
- Runtime catalog discuss stub includes behavior hint; [harness-command-behavior.md](docs/harness-command-behavior.md) documents act-first policy

## [0.10.7] - 2026-06-03

### Fixed

- Codex support model: **plugin-packaging** (`.codex-plugin/plugin.json` + `skills/`) — not project-local `/harness:*` slash
- Codex `interface` metadata aligned with OpenAI plugin examples; removed `commands` from Codex manifest
- Wizard/plan/status/doctor: Codex shows plugin + AGENTS fallback; no fake slash claim
- [codex-plugin-support.md](docs/codex-plugin-support.md)

## [0.10.6] - 2026-06-03

### Added

- Provider-native plugin packaging: `.cursor-plugin/`, `.claude-plugin/`, `.codex-plugin/`, `gemini-extension.json`, `.opencode/INSTALL.md`, `hooks/`
- [provider-native-command-research.md](docs/provider-native-command-research.md), [provider-command-matrix.md](docs/provider-command-matrix.md)

### Changed

- OpenCode: native `.opencode/commands/harness-*.md` → `/harness-plan` per OpenCode docs
- Claude: flat `.claude/commands/harness-*.md` (not nested `harness/plan.md`); plugin via `.claude-plugin/`
- Cursor: plugin-ready via `.cursor-plugin/plugin.json`; no project `.cursor/commands/` native claim
- Gemini: stop inventing extension `commands/*.md` slash files
- Manifest `commandSurface` includes `nativeCommands`, `fallbackActivation`, `packagingPath`, `installMethod`

## [0.10.5] - 2026-06-03

### Fixed

- Stop overclaiming universal `/harness:*` native slash commands — separate local catalog from provider-native registration
- Provider command capability matrix in [runtime-command-surface.md](docs/runtime-command-surface.md) (`native-verified`, `native-unverified`, `fallback-only`)
- Cursor installs fallback rule only (no `.cursor/commands/` as native slash)
- Manifest `commandSurface` + `canonicalCommands`; status/doctor report per-provider modes
- CLI install plan shows honest command support per provider

## [0.10.4] - 2026-06-03

### Fixed

- Interactive wizard no longer hangs on Windows after `intro()` — `note()` now uses Clack v1.5 signature `note(message, title)` instead of `note(message, { title })`

## [0.10.3] - 2026-06-03

### Added

- Polished terminal wizard via `@clack/prompts` — [terminal-wizard-ux.md](docs/terminal-wizard-ux.md)
- `lib/cli-ui.js` — intro, multiselect, plan notes, spinner, grouped status/doctor
- `--verbose` flag streams raw `aih.sh` backend output (default hides unless error)

### Changed

- Interactive install/update/uninstall use clack when TTY; non-interactive stays compact
- Status/doctor render grouped ✓ / ! / ✗ summary instead of raw shell dump (unless `--verbose`)

## [0.10.2] - 2026-06-03

### Added

- Project-scoped `/harness:*` command surface — [runtime-command-surface.md](docs/runtime-command-surface.md)
- `runtime-command-catalog.js` generates `.ai-harness/runtime-commands/`, `activation.md`, `manifest.json`
- Claude project commands: `.claude/commands/harness/*.md`
- Cursor command files + mapping rule fallback (native slash not claimed)
- Gemini / OpenCode / AGENTS.md command alias mappings
- `commands/harness-status.md`, `commands/harness-doctor.md`
- Status/doctor validate command catalog and activation references

### Changed

- Install/update refresh provider command entrypoints; uninstall removes per-provider command files
- CLI install plan lists `/harness:*` commands and provider command paths

## [0.10.1] - 2026-06-03

### Changed

- v0.10.x NPX CLI productization: README rewrite (npx-first, short), PACK.md aligned
- `package.json` `files` whitelist — npm tarball excludes `test/` and `examples/`
- CLI plan warns on non-Git private targets; expanded “will not modify” list
- Docs sweep: [npx-cli-ux.md](docs/npx-cli-ux.md), [simple-cli-ux.md](docs/simple-cli-ux.md), [plugin-install-ux.md](docs/plugin-install-ux.md), [npm-publish.md](docs/npm-publish.md), [v0.10.0-release-notes.md](docs/v0.10.0-release-notes.md)
- Tests: package contract, npm pack dry-run, npx-first README guards
- `--all` flag on CLI uninstall; bundled `aih.sh` path check

## [0.10.0] - 2026-06-03

### Added

- npm package `ai-engineering-harness` published to registry
- NPX interactive CLI (`bin/aih.js`) with `ai-engineering-harness` and `aih` bin aliases
- Provider selection wizard (checkbox UI when TTY supports raw mode; numbered fallback)
- Detection as **recommendation only** — no silent auto-install in interactive mode
- [npx-cli-ux.md](docs/npx-cli-ux.md)

### Changed

- Primary consumer UX: `npx ai-engineering-harness install`
- Node CLI fronts install/update/uninstall; `aih.sh` remains shell backend (requires `sh`)
- `aih.sh`, `install.sh`, `aih.ps1` documented as fallbacks

## [Unreleased]

### Changed

- Windows bootstrap docs and `aih.ps1` help: recommended PowerShell install includes `-Yes` for copy-paste flows
- `aih.ps1` warns when private project install/update targets a non-Git directory (`.git/info/exclude` unavailable)
- `doctor` and docs: clearer non-Git target messaging (`git init` or cloned repo)
- Final cleanup pass: stale “installer not shipped” docs updated; pin examples use `v0.9.1`; `.gitignore` excludes local `harness-dogfood-*` dirs
- README landing page cleaned up after `v0.9.2`
- `PACK.md` now describes `aih.sh` + runtime entrypoint + `.ai-harness/` + `.harness/` as the current consumption model

## [0.9.1] - 2026-06-02

**Experimental Runtime-Native Installer** — runtime-native modes are experimental; stable per-runtime support is **not** claimed. See [v0.9.1-release-notes.md](docs/v0.9.1-release-notes.md).

### Fixed

- AGENTS.md ownership between `.harness/` init and `generic`/`codex` runtime bootstrap — init no longer writes minimal `AGENTS.md` that blocked `runtime/bootstrap/AGENTS.project.md`

### Added

- experimental runtime-native installer ([install-runtime.js](install-runtime.js), [runtime/](runtime/)) with runtime + scope selector in [install.sh](install.sh)
- project `.harness/` init (`--scope project --init-harness`) — [harness-init-usage.md](docs/harness-init-usage.md)
- runtime-aware target validation — [runtime-aware-validation.md](docs/runtime-aware-validation.md); `node bin/validate.js --target <repo> --runtime <name> --profile-only`
- runtime payloads for `generic`, `codex`, `cursor`, `opencode`, `gemini`, `claude` (plus `windsurf` alias, `all` sequential — **experimental**, `all` not dogfooded)
- dogfood reports Scenario C and D1–D6 — [runtime-dogfood-summary.md](docs/runtime-dogfood-summary.md)
- v0.9.x readiness and release scope — [v0.9.x-readiness.md](docs/v0.9.x-readiness.md), [v0.9.x-release-scope.md](docs/v0.9.x-release-scope.md)
- Plugin Install UX pivot docs: [plugin-install-ux.md](docs/plugin-install-ux.md), [install-sh-usage.md](docs/install-sh-usage.md), [runtime-native-install-audit.md](docs/runtime-native-install-audit.md), one-line installer dogfood ([scenario-c-one-line-installer.md](docs/pack-dogfood-reports/scenario-c-one-line-installer.md))

### Not included

- stable runtime-native support claims
- npm publishing, marketplace automation, semantic validation
- verified manual IDE/CLI sessions for every runtime
- `--runtime all` as stable

## [0.9.0] - 2026-06-02

### Planned

- stable contract index
- breaking change policy
- minimal install tier decision
- frozen PACK.md contract ([frozen-pack-contract.md](docs/frozen-pack-contract.md))
- frozen installed surface contract ([frozen-installed-surface-contract.md](docs/frozen-installed-surface-contract.md))
- frozen target profile contract ([frozen-target-profile-contract.md](docs/frozen-target-profile-contract.md))
- frozen goal artifact contract ([frozen-goal-artifact-contract.md](docs/frozen-goal-artifact-contract.md))
- frozen validation behavior contract ([frozen-validation-contract.md](docs/frozen-validation-contract.md))
- frozen runtime consumption contract ([frozen-runtime-consumption-contract.md](docs/frozen-runtime-consumption-contract.md))
- frozen packaging and release contract ([frozen-packaging-release-contract.md](docs/frozen-packaging-release-contract.md))
- frozen source pack vs target repo boundary contract ([frozen-source-target-boundary-contract.md](docs/frozen-source-target-boundary-contract.md))
- v0.9.0 readiness audit ([v0.9.0-readiness.md](docs/v0.9.0-readiness.md))
- v0.9.0 release scope documentation ([v0.9.0-release-scope.md](docs/v0.9.0-release-scope.md))
- v1.0.0 readiness path

## [0.8.0] - 2026-06-02

### Planned

- real capability pack dogfood plan
- dogfood scenarios
- dogfood report template
- friction log
- follow-up backlog
- evidence-based path toward v1.0.0

### Added

- Scenario A tiny repo health-check dogfood report
- Scenario B frontend/mobile feature dogfood report
- dogfood-driven validation and source-pack clarification
- harness example to target layout guide
- dogfood fix pass for Scenario A/B findings
- v0.8.0 readiness audit
- v0.8.0 release scope documentation
- v0.8.0 release notes

## [0.7.0] - 2026-06-02

### Planned

- capability pack packaging model
- pack manifest spec
- PACK.md manifest
- manual release archive packaging guidance
- pack verification checklist
- optional lightweight manifest validation

### Added

- pack verification checklist
- lightweight PACK.md heading validation
- manual packaging guide
- v0.7.0 readiness audit
- v0.7.0 release scope documentation
- v0.7.0 release notes

## [0.6.0] - 2026-06-02

### Planned

- runtime consumption model
- Claude Code capability pack usage guide
- Cursor capability pack usage guide
- Codex capability pack usage guide
- Gemini CLI capability pack usage guide
- OpenCode capability pack usage guide
- runtime comparison guidance
- docs-only runtime consumption polish

### Added

- Claude Code capability pack consumption guide
- Cursor capability pack consumption guide
- Codex capability pack consumption guide
- Gemini CLI capability pack consumption guide
- OpenCode capability pack consumption guide
- runtime comparison guide
- v0.6.0 readiness audit
- v0.6.0 release scope documentation
- v0.6.0 release notes

## [0.5.0] - 2026-06-02

### Planned

- plugin-like capability pack positioning
- plugin model documentation
- distribution model documentation
- installed surface contract
- consumption mode guide
- consume-as-pack quick guide
- release archive model
- release archive checklist
- clearer source repo vs target repo distinction
- future plugin or registry boundary documentation
- v0.5.0 readiness audit
- v0.5.0 release scope documentation

## [0.4.0] - 2026-06-02

### Planned

- ergonomics polish for first-time adoption
- clearer post-install guidance
- installer output examples
- install-to-profile flow improvements
- tiny-repo adoption example
- lightweight memory conventions for small repositories

### Added

- post-install next-step guidance
- install output examples
- fixed installed docs surface for post-install guidance
- tiny repo adoption example
- small repo memory conventions
- compact small memory template
- install-to-profile walkthrough
- validation troubleshooting guide
- v0.4.0 readiness audit
- v0.4.0 release scope documentation

## [0.3.1] - 2026-06-02

### Added

- dogfood notes for local target repository validation
- v0.4.0 idea notes based on dogfood findings

## [0.3.0] - 2026-06-02

### Planned

- Lightweight host repository validation
- minimal `node bin/validate.js --target <path>` mode
- optional `--profile-only`
- optional `--goal <goal-id>`
- structural `.harness/` contract validation for adopted repositories
- Validator refactor toward reusable validation modes

### Added

- implemented target profile validation mode
- implemented target goal validation mode
- documented target profile and goal validation usage
- v0.3.0 readiness audit
- v0.3.0 release scope documentation

## [0.2.0] - 2026-06-02

### Planned

- Harness build command
- Harness profile templates
- Gap analysis
- System positioning
- Project-specific harness design surface
- Team architecture selection
- Memory model and memory safety
- SDLC execution model
- Task and execution templates
- Skill authoring rules
- Skill system documentation
- Skill template
- Updated writing-skills guidance
- Demo harness build for Flutter Google login
- Harness build contract documentation
- Heading validation for harness profile templates and demo artifacts
- Harness build usage guide
- Harness build review checklist
- Harness build prompt library
- Target repository validation design
- Target repository validation checklist
- Target repository validation prompt guide
- v0.2.0 readiness audit
- release scope documentation

## [0.1.0] - 2026-06-02

### Added

- Markdown-first harness operating contract
- Command loop
- Core skills
- Workflows
- Agent team patterns
- Artifact templates
- Adoption guide
- Runtime usage guides
- Skill packs
- Workflow scenarios
- Quality gates matrix
- Adoption smoke test
- Lightweight install and validation helpers
