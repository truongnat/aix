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

## V3: Optional Memory Backend And Automation

- optional memory backend integrations
- optional remote skill or template registry
- optional automation layers for artifact lifecycle management

## Release Milestones

- `v0.1.0`: markdown-first harness operating model
- `v0.2.0`: Harness Design System
- `v0.3.0`: optional runtime-specific helpers, still no heavy runtime by default

Heavy runtime systems remain out of scope for v1. Any future automation should support the markdown operating model rather than replace it.
