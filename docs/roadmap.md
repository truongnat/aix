# Roadmap

## V1: Markdown-First Operating System

- establish the central operating contract in `AGENTS.md`
- standardize operational command documents
- provide compact reusable skills
- define practical workflows and team patterns
- provide safe, fillable `.harness/` templates
- document concepts, architecture, artifact layout, and quality gates
- ship lightweight validation scripts and GitHub Actions CI

## V2: Harness Design System

- `v0.2.0`: Harness Design System
- `v0.2.0` includes design and docs for target repository validation
- full target repository validator implementation is a later optional step
- add `harness-build` as the entry point for project-specific harness design
- add harness profile templates for workflow, team, skills, gates, memory, and harness context
- document team architecture selection for project-specific collaboration shape
- document memory model and memory safety for durable, sanitized recall
- document SDLC execution model for goal and task lifecycle control
- document a skill authoring system for compact reusable capability contracts
- add a skill template for future project-specific skills
- enforce anti-bloat rules for future skill growth
- add a demo harness build that shows project-specific profile output end to end
- add harness build contract validation for profile and goal artifacts
- add harness-build usage guidance for real host repositories
- add target repository validation design for adopted host repos
- document system positioning so each layer has a clear role and boundary
- close the highest-value gaps identified in relation to [TARGET.md](../TARGET.md)
- keep adoption, validation, and markdown-first execution lightweight

## V3: Lightweight Host Repository Validation

- `v0.3.0`: Lightweight Host Repository Validation
- implemented in this release
- supports `node validate.js --target <path>`
- supports `--profile-only`
- supports `--goal <goal-id>`
- validates only structural `.harness/` contracts
- reuses existing heading contracts where practical
- keeps validation dependency-free and safe
- keeps target validation structural rather than semantic

## V4: Ergonomics Polish

- `v0.4.0`: Ergonomics Polish
- implemented in this release
- focus on install-to-profile clarity
- focus on first-time adoption experience
- improve adoption clarity rather than validation scope
- improve ergonomics without adding runtime systems
- keep validation structural-only and markdown-first

## V5: Plugin Distribution Model

- `v0.5.0`: Plugin Distribution Model
- implemented in this release
- clarify the harness as a capability pack
- support plugin-like consumption
- focus on conceptual and distribution clarification rather than packaging automation
- keep runtime adapters and marketplace automation out of scope for now

## V6: Runtime Consumption Guides

- `v0.6.0`: Runtime Consumption Guides
- implemented in this release
- docs-only usage guidance for consuming the capability pack in common runtimes
- runtime consumption model and per-runtime guides
- runtime comparison guide with shared prompt and validation patterns
- no runtime adapters or integrations in this release

## V7: Capability Pack Packaging

- `v0.7.0`: Capability Pack Packaging
- implemented in this release
- defines manual packaging and manifest contracts for the capability pack
- `PACK.md` manifest, packaging model, manifest spec, and verification checklist
- lightweight `PACK.md` heading validation and manual packaging guide
- release archive model and checklist integration with `PACK.md`
- no publishing automation, marketplace automation, archive generation automation, or runtime adapters in this release

## V8: Real Capability Pack Dogfood

- `v0.8.0`: Real Capability Pack Dogfood
- implemented in this release
- Scenario A and Scenario B satisfied minimum dogfood requirement (two repos, two runtimes)
- evidence from install/copy, profile and goal artifacts, and structural target validation
- friction log, follow-up backlog, and dogfood fix pass
- no runtime adapter work and no distribution automation in this release

## V9: Stable Contract Freeze (planned)

- `v0.9.0`: Stable Contract Freeze
- lock PACK.md, installed surface, harness profile, goal artifacts, validation, and packaging flow before `v1.0.0`

## V10: Stable Capability Pack Release (planned)

- `v1.0.0`: Stable Capability Pack Release
- first stable release after dogfood evidence and contract freeze

## Later Optional Work

- optional archive generation automation
- optional installed surface hash or checksum validation
- optional manifest body or version value validation
- optional runtime adapters
- optional marketplace package or plugin registry distribution
- optional package publishing automation
- optional deeper validation ideas beyond structural harness contracts
- optional semantic validation research
- optional context warnings for non-required artifacts
- optional interactive setup wizard
- optional automatic harness or profile generation
- optional Scenario C dogfood (backend/tooling) beyond minimum two-scenario bar
- optional minimal install tier for tiny repositories (v0.9 discussion)
- optional package or marketplace distribution automation
- optional plugin registry distribution
- optional memory backend integrations
- optional remote skill or template registry
- optional automation layers for artifact lifecycle management

## Release Milestones

- `v0.1.0`: markdown-first harness operating model
- `v0.2.0`: Harness Design System
- `v0.3.0`: Lightweight Host Repository Validation
- `v0.4.0`: Ergonomics Polish
- `v0.5.0`: Plugin Distribution Model
- `v0.6.0`: Runtime Consumption Guides
- `v0.7.0`: Capability Pack Packaging
- `v0.8.0`: Real Capability Pack Dogfood

Heavy runtime systems remain out of scope for v1. Any future automation should support the markdown operating model rather than replace it.
