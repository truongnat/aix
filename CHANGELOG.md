# Changelog

## [Unreleased]

### Changed

- Final cleanup pass: stale “installer not shipped” docs updated; pin examples use `v0.9.1`; `.gitignore` excludes local `harness-dogfood-*` dirs

## [0.9.1] - 2026-06-02

**Experimental Runtime-Native Installer** — runtime-native modes are experimental; stable per-runtime support is **not** claimed. See [v0.9.1-release-notes.md](docs/v0.9.1-release-notes.md).

### Fixed

- AGENTS.md ownership between `.harness/` init and `generic`/`codex` runtime bootstrap — init no longer writes minimal `AGENTS.md` that blocked `runtime/bootstrap/AGENTS.project.md`

### Added

- experimental runtime-native installer ([install-runtime.js](install-runtime.js), [runtime/](runtime/)) with runtime + scope selector in [install.sh](install.sh)
- project `.harness/` init (`--scope project --init-harness`) — [harness-init-usage.md](docs/harness-init-usage.md)
- runtime-aware target validation — [runtime-aware-validation.md](docs/runtime-aware-validation.md); `node validate.js --target <repo> --runtime <name> --profile-only`
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
- minimal `node validate.js --target <path>` mode
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
