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

- [react-pro](/skills/react-pro/) | React web — components, hooks, a11y, SSR
- [nextjs-pro](/skills/nextjs-pro/) | Next.js — App Router, RSC, caching, middleware
- [react-native-pro](/skills/react-native-pro/) | RN / Expo — UI, perf, platform edges
- [flutter-pro](/skills/flutter-pro/) | Flutter — Material 3, multi-platform
- [javascript-pro](/skills/javascript-pro/) | JS runtime — async, modules, edges
- [typescript-pro](/skills/typescript-pro/) | TypeScript — types, `tsconfig`, migration
- [performance-tuning-pro](/skills/performance-tuning-pro/) | Profiling, bottlenecks, tuning
- [clean-code-architecture-pro](/skills/clean-code-architecture-pro/) | Boundaries, coupling, maintainability
- [cli-pro](/skills/cli-pro/) | CLI design — argv, UX, pipes, cross-platform
- [api-design-pro](/skills/api-design-pro/) | HTTP APIs — contracts, versioning, idempotency
- [graphql-pro](/skills/graphql-pro/) | GraphQL — schema, resolvers, perf, security
- [websocket-pro](/skills/websocket-pro/) | WebSocket — lifecycle, scale, reliability
- [microservices-pro](/skills/microservices-pro/) | Distributed systems — boundaries, resilience
- [stream-rtc-pro](/skills/stream-rtc-pro/) | Streaming / WebRTC — signaling, QoS
- [nestjs-pro](/skills/nestjs-pro/) | NestJS — APIs, modules, testing
- [postgresql-pro](/skills/postgresql-pro/) | PostgreSQL — SQL, migrations, RLS
- [sql-data-access-pro](/skills/sql-data-access-pro/) | SQLite & safe access patterns
- [testing-pro](/skills/testing-pro/) | Test strategy — pyramid, CI, flakes
- [test-driven-development-pro](/skills/test-driven-development-pro/) | TDD — RED-GREEN-REFACTOR, test-first discipline
- [security-pro](/skills/security-pro/) | Threat-aware hardening
- [auth-pro](/skills/auth-pro/) | Authn / authz — sessions, OAuth, tokens
- [electron-pro](/skills/electron-pro/) | Electron — IPC, packaging
- [tauri-pro](/skills/tauri-pro/) | Tauri — commands, capabilities
- [deployment-pro](/skills/deployment-pro/) | Release & rollout
- [docker-pro](/skills/docker-pro/) | Containers — Dockerfile, Compose
- [ci-cd-pro](/skills/ci-cd-pro/) | Pipelines — Actions, reliability
- [seo-pro](/skills/seo-pro/) | Organic search — technical + lifecycle
- [design-system-pro](/skills/design-system-pro/) | Design systems — tokens, components
- [frontend-design-pro](/skills/frontend-design-pro/) | Anti-slop aesthetics — distinctive, memorable UIs
- [ui-ux-system-pro](/skills/ui-ux-system-pro/) | Comprehensive design system intelligence
- [shadcn-mastery-pro](/skills/shadcn-mastery-pro/) | shadcn/ui components, patterns, theming
- [motion-design-pro](/skills/motion-design-pro/) | GSAP, Framer Motion, CSS animations
- [mobile-design-pro](/skills/mobile-design-pro/) | Mobile UX patterns
- [business-analysis-pro](/skills/business-analysis-pro/) | Requirements, decisions, metrics
- [content-analysis-pro](/skills/content-analysis-pro/) | Docs, images, video — structured analysis
- [data-analysis-pro](/skills/data-analysis-pro/) | EDA, pandas, viz, spreadsheets
- [image-processing-pro](/skills/image-processing-pro/) | Raster — Pillow, formats
- [web-research-pro](/skills/web-research-pro/) | Sources, citations, verification
- [market-research-pro](/skills/market-research-pro/) | TAM/SAM/SOM, competitors, ICP
- [strategic-consulting-pro](/skills/strategic-consulting-pro/) | Options, prioritization, memos
- [code-packaging-pro](/skills/code-packaging-pro/) | pyproject, Docker, publish
- [caching-pro](/skills/caching-pro/) | Cache patterns, TTL, consistency
- [network-infra-pro](/skills/network-infra-pro/) | Topology, traffic, diagnostics
- [parallel-agents-pro](/skills/parallel-agents-pro/) | Concurrent workflows — agent coordination, result aggregation
- [planning-pro](/skills/planning-pro/) | Scope, dependencies, estimates
- [systematic-debugging-pro](/skills/systematic-debugging-pro/) | 4-phase debugging — hypothesis-driven, root cause tracing
- [writing-plans-pro](/skills/writing-plans-pro/) | Detailed planning — task breakdown, acceptance criteria
- [executing-plans-pro](/skills/executing-plans-pro/) | Plan execution — batch, checkpoints, adaptive replanning
- [algorithm-pro](/skills/algorithm-pro/) | Modeling, correctness, complexity
- [brainstorming-pro](/skills/brainstorming-pro/) | Socratic brainstorming — assumption surfacing, convergence
- [feedback-pro](/skills/feedback-pro/) | Deep review, severity, closure
- [self-improve-agent-pro](/skills/self-improve-agent-pro/) | Agent quality loops
- [git-operations-pro](/skills/git-operations-pro/) | Git — PRs, branches
- [karpathy-coding-pro](/skills/karpathy-coding-pro/) | Karpathy principles — Think, Simplicity, Surgical, Goal-Driven
- [bug-discovery-pro](/skills/bug-discovery-pro/) | Defect discovery, GitNexus, telemetry
- [skills-self-review-pro](/skills/skills-self-review-pro/) | Audit this bundle
- [repo-tooling-pro](/skills/repo-tooling-pro/) | Repo scripts — KB, skill index
- [ai-integration-pro](/skills/ai-integration-pro/) | LLM apps — prompts, tools, RAG

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

Use skill **`skills-self-review-pro`** for how to read tiers and manual checklists. CLI map: **[`../scripts/README.md`](/scripts/README.md)**.

---

## Bundled skills (catalog)

| Skill | Focus |
|-------|--------|
| [router-pro](/skills/router-pro/) | System skill — routing / orchestration |
| [react-pro](/skills/react-pro/) | React web — components, hooks, a11y, SSR |
| [nextjs-pro](/skills/nextjs-pro/) | Next.js — App Router, RSC, caching, middleware |
| [react-native-pro](/skills/react-native-pro/) | RN / Expo — UI, perf, platform edges |
| [flutter-pro](/skills/flutter-pro/) | Flutter — Material 3, multi-platform |
| [javascript-pro](/skills/javascript-pro/) | JS runtime — async, modules, edges |
| [typescript-pro](/skills/typescript-pro/) | TypeScript — types, `tsconfig`, migration |
| [performance-tuning-pro](/skills/performance-tuning-pro/) | Profiling, bottlenecks, tuning |
| [clean-code-architecture-pro](/skills/clean-code-architecture-pro/) | Boundaries, coupling, maintainability |
| [cli-pro](/skills/cli-pro/) | CLI design — argv, UX, pipes, cross-platform |
| [api-design-pro](/skills/api-design-pro/) | HTTP APIs — contracts, versioning, idempotency |
| [graphql-pro](/skills/graphql-pro/) | GraphQL — schema, resolvers, perf, security |
| [websocket-pro](/skills/websocket-pro/) | WebSocket — lifecycle, scale, reliability |
| [microservices-pro](/skills/microservices-pro/) | Distributed systems — boundaries, resilience |
| [stream-rtc-pro](/skills/stream-rtc-pro/) | Streaming / WebRTC — signaling, QoS |
| [nestjs-pro](/skills/nestjs-pro/) | NestJS — APIs, modules, testing |
| [postgresql-pro](/skills/postgresql-pro/) | PostgreSQL — SQL, migrations, RLS |
| [sql-data-access-pro](/skills/sql-data-access-pro/) | SQLite & safe access patterns |
| [testing-pro](/skills/testing-pro/) | Test strategy — pyramid, CI, flakes |
| [test-driven-development-pro](/skills/test-driven-development-pro/) | TDD — RED-GREEN-REFACTOR, test-first discipline |
| [ui-reverse-engineer-pro](/skills/ui-reverse-engineer-pro/) | UI reverse engineering — images to system-based code |
| [security-pro](/skills/security-pro/) | Threat-aware hardening |
| [auth-pro](/skills/auth-pro/) | Authn / authz — sessions, OAuth, tokens |
| [electron-pro](/skills/electron-pro/) | Electron — IPC, packaging |
| [tauri-pro](/skills/tauri-pro/) | Tauri — commands, capabilities |
| [deployment-pro](/skills/deployment-pro/) | Release & rollout |
| [docker-pro](/skills/docker-pro/) | Containers — Dockerfile, Compose |
| [ci-cd-pro](/skills/ci-cd-pro/) | Pipelines — Actions, reliability |
| [seo-pro](/skills/seo-pro/) | Organic search — technical + lifecycle |
| [design-system-pro](/skills/design-system-pro/) | Design systems — tokens, components |
| [frontend-design-pro](/skills/frontend-design-pro/) | Anti-slop aesthetics — distinctive, memorable UIs |
| [ui-ux-system-pro](/skills/ui-ux-system-pro/) | Comprehensive design system intelligence |
| [shadcn-mastery-pro](/skills/shadcn-mastery-pro/) | shadcn/ui components, patterns, theming |
| [motion-design-pro](/skills/motion-design-pro/) | GSAP, Framer Motion, CSS animations |
| [mobile-design-pro](/skills/mobile-design-pro/) | Mobile UX patterns |
| [business-analysis-pro](/skills/business-analysis-pro/) | Requirements, decisions, metrics |
| [content-analysis-pro](/skills/content-analysis-pro/) | Docs, images, video — structured analysis |
| [data-analysis-pro](/skills/data-analysis-pro/) | EDA, pandas, viz, spreadsheets |
| [image-processing-pro](/skills/image-processing-pro/) | Raster — Pillow, formats |
| [web-research-pro](/skills/web-research-pro/) | Sources, citations, verification |
| [market-research-pro](/skills/market-research-pro/) | TAM/SAM/SOM, competitors, ICP |
| [strategic-consulting-pro](/skills/strategic-consulting-pro/) | Options, prioritization, memos |
| [code-packaging-pro](/skills/code-packaging-pro/) | pyproject, Docker, publish |
| [caching-pro](/skills/caching-pro/) | Cache patterns, TTL, consistency |
| [network-infra-pro](/skills/network-infra-pro/) | Topology, traffic, diagnostics |
| [parallel-agents-pro](/skills/parallel-agents-pro/) | Concurrent workflows — agent coordination, result aggregation
| [writing-plans-pro](/skills/writing-plans-pro/) | Detailed planning — task breakdown, acceptance criteria |
| [executing-plans-pro](/skills/executing-plans-pro/) | Plan execution — batch, checkpoints, adaptive replanning
| [algorithm-pro](/skills/algorithm-pro/) | Modeling, correctness, complexity |
| [brainstorming-pro](/skills/brainstorming-pro/) | Socratic brainstorming — assumption surfacing, convergence
| [self-improve-agent-pro](/skills/self-improve-agent-pro/) | Agent quality loops |
| [git-operations-pro](/skills/git-operations-pro/) | Git — PRs, branches |
| [karpathy-coding-pro](/skills/karpathy-coding-pro/) | Karpathy principles — Think, Simplicity, Surgical, Goal-Driven |
| [bug-discovery-pro](/skills/bug-discovery-pro/) | Defect discovery, GitNexus, telemetry |
| [skills-self-review-pro](/skills/skills-self-review-pro/) | Audit this bundle |
| [repo-tooling-pro](/skills/repo-tooling-pro/) | Repo scripts — KB, skill index |
| [ai-integration-pro](/skills/ai-integration-pro/) | LLM apps — prompts, tools, RAG |

---

## Using with Cursor

Copy or symlink a skill into **`.cursor/skills/<name>/`** — details in root [`AGENTS.md`](/AGENTS.md).
