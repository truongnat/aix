# Skills bundle

Each skill lives in a **directory** with a required **`SKILL.md`** (YAML frontmatter: `name`, `description`, and usually `metadata`). Optional: **`references/`**, **`scripts/`**, **`assets/`**.

---

## Skill Types

Skills are organized into two categories:

### System Skills
Routing and orchestration skills that analyze queries, optimize prompts, and coordinate working skills.

- **router-pro** - Analyzes requests, optimizes prompts, identifies relevant skills, orchestrates workflows

### Working Skills
Domain-specific skills that perform actual work.

- [react-pro](react-pro/) | React web — components, hooks, a11y, SSR
- [nextjs-pro](nextjs-pro/) | Next.js — App Router, RSC, caching, middleware
- [react-native-pro](react-native-pro/) | RN / Expo — UI, perf, platform edges
- [flutter-pro](flutter-pro/) | Flutter — Material 3, multi-platform
- [javascript-pro](javascript-pro/) | JS runtime — async, modules, edges
- [typescript-pro](typescript-pro/) | TypeScript — types, `tsconfig`, migration
- [performance-tuning-pro](performance-tuning-pro/) | Profiling, bottlenecks, tuning
- [clean-code-architecture-pro](clean-code-architecture-pro/) | Boundaries, coupling, maintainability
- [cli-pro](cli-pro/) | CLI design — argv, UX, pipes, cross-platform
- [api-design-pro](api-design-pro/) | HTTP APIs — contracts, versioning, idempotency
- [graphql-pro](graphql-pro/) | GraphQL — schema, resolvers, perf, security
- [websocket-pro](websocket-pro/) | WebSocket — lifecycle, scale, reliability
- [microservices-pro](microservices-pro/) | Distributed systems — boundaries, resilience
- [stream-rtc-pro](stream-rtc-pro/) | Streaming / WebRTC — signaling, QoS
- [nestjs-pro](nestjs-pro/) | NestJS — APIs, modules, testing
- [postgresql-pro](postgresql-pro/) | PostgreSQL — SQL, migrations, RLS
- [sql-data-access-pro](sql-data-access-pro/) | SQLite & safe access patterns
- [testing-pro](testing-pro/) | Test strategy — pyramid, CI, flakes
- [security-pro](security-pro/) | Threat-aware hardening
- [auth-pro](auth-pro/) | Authn / authz — sessions, OAuth, tokens
- [electron-pro](electron-pro/) | Electron — IPC, packaging
- [tauri-pro](tauri-pro/) | Tauri — commands, capabilities
- [deployment-pro](deployment-pro/) | Release & rollout
- [docker-pro](docker-pro/) | Containers — Dockerfile, Compose
- [ci-cd-pro](ci-cd-pro/) | Pipelines — Actions, reliability
- [seo-pro](seo-pro/) | Organic search — technical + lifecycle
- [design-system-pro](design-system-pro/) | Design systems — tokens, components
- [mobile-design-pro](mobile-design-pro/) | Mobile UX patterns
- [business-analysis-pro](business-analysis-pro/) | Requirements, decisions, metrics
- [content-analysis-pro](content-analysis-pro/) | Docs, images, video — structured analysis
- [data-analysis-pro](data-analysis-pro/) | EDA, pandas, viz, spreadsheets
- [image-processing-pro](image-processing-pro/) | Raster — Pillow, formats
- [web-research-pro](web-research-pro/) | Sources, citations, verification
- [market-research-pro](market-research-pro/) | TAM/SAM/SOM, competitors, ICP
- [strategic-consulting-pro](strategic-consulting-pro/) | Options, prioritization, memos
- [code-packaging-pro](code-packaging-pro/) | pyproject, Docker, publish
- [caching-pro](caching-pro/) | Cache patterns, TTL, consistency
- [network-infra-pro](network-infra-pro/) | Topology, traffic, diagnostics
- [planning-pro](planning-pro/) | Scope, dependencies, estimates
- [algorithm-pro](algorithm-pro/) | Modeling, correctness, complexity
- [feedback-pro](feedback-pro/) | Deep review, severity, closure
- [self-improve-agent-pro](self-improve-agent-pro/) | Agent quality loops
- [git-operations-pro](git-operations-pro/) | Git — PRs, branches
- [bug-discovery-pro](bug-discovery-pro/) | Defect discovery, GitNexus, telemetry
- [skills-self-review-pro](skills-self-review-pro/) | Audit this bundle
- [repo-tooling-pro](repo-tooling-pro/) | Repo scripts — KB, skill index
- [ai-integration-pro](ai-integration-pro/) | LLM apps — prompts, tools, RAG

---

## What “production-grade” means here

Most `*-pro` skills include paired references such as:

- **`failure-modes-detection-mitigation.md`** — how things break and what to check
- **`decision-framework-and-trade-offs.md`** — explicit trade-offs, not vague advice
- **`quality-validation-and-guardrails.md`** — evidence discipline (no invented flags, URLs, or metrics)
- A **system model** doc (name varies by domain) — mental model before tactics

`SKILL.md` typically ends with **Suggested response format (STRICT)** — an **8-step** outline so agent answers stay comparable and complete.

---

## Before creating a new skill (mandatory)

1. Read **[SKILL_AUTHORING_RULES.md](SKILL_AUTHORING_RULES.md)** end-to-end.
2. Do **not** add a new folder under `skills/` unless **every** mandatory rule is satisfied. Otherwise extend an existing `*-pro` skill or add `references/`.
3. In Cursor, project rule **`.cursor/rules/skills-authoring.mdc`** applies when editing skills.

**Template:** copy [`examples/skill-template/`](examples/skill-template/), rename the folder, then align with `SKILL_AUTHORING_RULES.md`.

---

## Bundle audit (maintainers)

From **repo root** (`npm install` + `npm run build` if needed):

```bash
node dist/tools.js validate-skills
node dist/tools.js analyze-skills --self-review
node dist/tools.js build-skill-index
```

Use skill **`skills-self-review-pro`** for how to read tiers and manual checklists. CLI map: **[`../scripts/README.md`](../scripts/README.md)**.

---

## Bundled skills (catalog)

| Skill | Focus |
|-------|--------|
| [react-pro](react-pro/) | React web — components, hooks, a11y, SSR |
| [nextjs-pro](nextjs-pro/) | Next.js — App Router, RSC, caching, middleware |
| [react-native-pro](react-native-pro/) | RN / Expo — UI, perf, platform edges |
| [flutter-pro](flutter-pro/) | Flutter — Material 3, multi-platform |
| [javascript-pro](javascript-pro/) | JS runtime — async, modules, edges |
| [typescript-pro](typescript-pro/) | TypeScript — types, `tsconfig`, migration |
| [performance-tuning-pro](performance-tuning-pro/) | Profiling, bottlenecks, tuning |
| [clean-code-architecture-pro](clean-code-architecture-pro/) | Boundaries, coupling, maintainability |
| [cli-pro](cli-pro/) | CLI design — argv, UX, pipes, cross-platform |
| [api-design-pro](api-design-pro/) | HTTP APIs — contracts, versioning, idempotency |
| [graphql-pro](graphql-pro/) | GraphQL — schema, resolvers, perf, security |
| [websocket-pro](websocket-pro/) | WebSocket — lifecycle, scale, reliability |
| [microservices-pro](microservices-pro/) | Distributed systems — boundaries, resilience |
| [stream-rtc-pro](stream-rtc-pro/) | Streaming / WebRTC — signaling, QoS |
| [nestjs-pro](nestjs-pro/) | NestJS — APIs, modules, testing |
| [postgresql-pro](postgresql-pro/) | PostgreSQL — SQL, migrations, RLS |
| [sql-data-access-pro](sql-data-access-pro/) | SQLite & safe access patterns |
| [testing-pro](testing-pro/) | Test strategy — pyramid, CI, flakes |
| [security-pro](security-pro/) | Threat-aware hardening |
| [auth-pro](auth-pro/) | Authn / authz — sessions, OAuth, tokens |
| [electron-pro](electron-pro/) | Electron — IPC, packaging |
| [tauri-pro](tauri-pro/) | Tauri — commands, capabilities |
| [deployment-pro](deployment-pro/) | Release & rollout |
| [docker-pro](docker-pro/) | Containers — Dockerfile, Compose |
| [ci-cd-pro](ci-cd-pro/) | Pipelines — Actions, reliability |
| [seo-pro](seo-pro/) | Organic search — technical + lifecycle |
| [design-system-pro](design-system-pro/) | Design systems — tokens, components |
| [mobile-design-pro](mobile-design-pro/) | Mobile UX patterns |
| [business-analysis-pro](business-analysis-pro/) | Requirements, decisions, metrics |
| [content-analysis-pro](content-analysis-pro/) | Docs, images, video — structured analysis |
| [data-analysis-pro](data-analysis-pro/) | EDA, pandas, viz, spreadsheets |
| [image-processing-pro](image-processing-pro/) | Raster — Pillow, formats |
| [web-research-pro](web-research-pro/) | Sources, citations, verification |
| [market-research-pro](market-research-pro/) | TAM/SAM/SOM, competitors, ICP |
| [strategic-consulting-pro](strategic-consulting-pro/) | Options, prioritization, memos |
| [code-packaging-pro](code-packaging-pro/) | pyproject, Docker, publish |
| [caching-pro](caching-pro/) | Cache patterns, TTL, consistency |
| [network-infra-pro](network-infra-pro/) | Topology, traffic, diagnostics |
| [planning-pro](planning-pro/) | Scope, dependencies, estimates |
| [algorithm-pro](algorithm-pro/) | Modeling, correctness, complexity |
| [feedback-pro](feedback-pro/) | Deep review, severity, closure |
| [self-improve-agent-pro](self-improve-agent-pro/) | Agent quality loops |
| [git-operations-pro](git-operations-pro/) | Git — PRs, branches |
| [bug-discovery-pro](bug-discovery-pro/) | Defect discovery, GitNexus, telemetry |
| [skills-self-review-pro](skills-self-review-pro/) | Audit this bundle |
| [repo-tooling-pro](repo-tooling-pro/) | Repo scripts — KB, skill index |
| [ai-integration-pro](ai-integration-pro/) | LLM apps — prompts, tools, RAG |

---

## Using with Cursor

Copy or symlink a skill into **`.cursor/skills/<name>/`** — details in root [`AGENTS.md`](../AGENTS.md).
