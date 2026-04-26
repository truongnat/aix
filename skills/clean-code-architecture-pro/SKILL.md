---
name: clean-code-architecture-pro
description: |
  Production-grade clean code and Clean Architecture: dependency rule as a system model (inward stability, ports/adapters, dependency vs control flow), bounded contexts and anti-corruption layers, strangler and incremental migration, failure modes (leaky domain, cycles, anemic model, god modules, distributed mud), decision frameworks and trade-offs (strict vs pragmatic layering, monolith vs services), stack dialects (TS/Java/Nest/Spring), boundary testing strategy, quality guardrails against over-engineering and diagram-only architecture, SOLID-informed boundaries, refactoring sequencing, and integration with tests and framework skills.

  Use when designing module boundaries, reviewing maintainability, inverting dependencies, breaking cycles, refactoring legacy toward clearer layers, or deciding how much architecture ceremony a codebase earns.

  Combine with testing-pro, git-operations-pro, nestjs-pro, react-pro, typescript-pro, api-design-pro as needed.

  Triggers: "clean code", "clean architecture", "hexagonal", "ports and adapters", "onion", "refactor", "SOLID", "SRP", "DIP", "OCP", "dependency inversion", "layering", "module boundary", "bounded context", "ACL anti-corruption", "strangler fig", "circular dependency", "god object", "anemic domain", "use case", "application service", "maintainability", "tech debt", "code smell", "feature envy", "dependency rule", "aggregate", "repository pattern".

metadata:
  short-description: Clean architecture — dependency rule, boundaries, failure modes, trade-offs, refactoring
  content-language: en
  domain: software-architecture
  level: professional
---

# Clean code and clean architecture (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2011/11/22/Clean-Architecture.html), [Refactoring catalog (Fowler)](https://refactoring.com/catalog/), and domain-driven **bounded context** thinking for conceptual truth; this skill encodes **dependency graphs**, **boundary failure modes**, **incremental strangler migration**, and **trade-offs** — not diagram aesthetics alone. Confirm **current layout**, **domain complexity**, **team conventions**, and **release risk** before restructuring.

## Boundary

**`clean-code-architecture-pro`** owns **dependency direction**, **module semantics**, **use-case orchestration shape**, **structural refactor sequencing**, and **architecture-level trade-offs**. **`nestjs-pro`** / **`react-pro`** own **framework wiring**; **`testing-pro`** owns **test mechanics**; **`postgresql-pro`** / **`sql-data-access-pro`** own **SQL and schema** — this skill defines **where** persistence must not leak inward.

## Related skills (this repo)

| Skill | When to combine |
|-------|------------------|
| **`testing-pro`** | Characterization tests, boundary tests, safe refactor gates |
| **`git-operations-pro`** | Split PRs, branch strategy for mechanical moves |
| **`typescript-pro`** | Types for ports/DTO boundaries |
| **`nestjs-pro`** / **`react-pro`** / **`nextjs-pro`** | Framework modules without domain coupling |
| **`api-design-pro`** | DTO vs domain at HTTP boundary |
| **`postgresql-pro`** / **`sql-data-access-pro`** | Repository implementation; migration coupling |
| **`deployment-pro`** | When extraction implies service boundaries |

## When to use

- Unclear ownership between domain, application, and infrastructure.
- Domain importing frameworks; ORM/API shapes leaking inward.
- Cycles between modules; god modules; utils dumping ground.
- Choosing **how much** layering for a greenfield vs legacy codebase.
- Reviewing PRs for long-term changeability.

## When not to use

- **Pure product prioritization** without code — **`business-analysis-pro`**.
- **Production rollout steps** — **`deployment-pro`** unless splitting deployables.

## Required inputs

- Repo **language/stack**, approximate **size**, **legacy vs greenfield**, and **constraints** (deadline, freeze).

## Expected output

Follow **Suggested response format** strictly — architecture through residual risks — including explicit **failure modes**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** stack, domain complexity, **dependency graph** → verify: [context captured].
2. **State assumptions** about architectural needs, refactoring scope (**Think Before Coding**).
3. **Apply** minimum architectural change first; add complexity only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch modules directly related to the request (**Surgical Changes**).
5. **Define success criteria** (test coverage, coupling metrics, build time); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; prefer **incremental** strangler over big-bang — **`bounded-context-and-strangler-patterns.md`**.

### Operating principles

1. **Think Before Coding** — State assumptions: domain complexity, team size, evolution needs. Ask when uncertain.
2. **Simplicity First** — Start with simple module structure; add architectural layers only when justified.
3. **Surgical Changes** — Only touch modules directly related to the request. Don't refactor unrelated code.
4. **Goal-Driven Execution** — Define coupling metrics, test coverage, build time targets upfront.
5. **Depend inward** — Domain and application policies do not depend on UI, DB drivers, or HTTP stacks — **`dependency-rule-system-model.md`**.
6. **One reason to change per module** — cohesion over clever DRY across unrelated features.
7. **Clear boundaries over shortcuts** — optimize for the **next reader** and safe evolution.
8. **Refactor in verified steps** — behavior preserved first — **`testing-pro`**.
9. **Architecture visible** — structure and names expose intent; enforce with **lint/import rules** where valuable.
10. **Right-sized ceremony** — **`decision-framework-and-tradeoffs.md`** picks depth for CRUD vs complex domain.

### Dependency rule and system model (summary)

Ports/adapters; dependency vs control flow; inward stability — **`dependency-rule-system-model.md`**.

Details: [references/dependency-rule-system-model.md](/skills/clean-code-architecture-pro/references/dependency-rule-system-model.md)

### Failure modes — detection and mitigation (summary)

Leaky domain, cycles, anemic model, god module — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](/skills/clean-code-architecture-pro/references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Strict vs pragmatic layering; monolith vs split — **`decision-framework-and-tradeoffs.md`**.

Details: [references/decision-framework-and-tradeoffs.md](/skills/clean-code-architecture-pro/references/decision-framework-and-tradeoffs.md)

### Bounded context, ACL, strangler (summary)

DDD-lite boundaries; incremental migration — **`bounded-context-and-strangler-patterns.md`**.

Details: [references/bounded-context-and-strangler-patterns.md](/skills/clean-code-architecture-pro/references/bounded-context-and-strangler-patterns.md)

### Quality validation and guardrails (summary)

Anti-over-engineering; stack honesty — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](/skills/clean-code-architecture-pro/references/quality-validation-and-guardrails.md)

### Versions and stack dialects (summary)

Java/TS/Nest/Spring packaging notes — **`versions-and-stack-dialects.md`**.

Details: [references/versions-and-stack-dialects.md](/skills/clean-code-architecture-pro/references/versions-and-stack-dialects.md)

### Clean code tips and tricks (summary)

Naming, seams, readability — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](/skills/clean-code-architecture-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Premature layers, microservices mud, ORM, events — **`edge-cases.md`**.

Details: [references/edge-cases.md](/skills/clean-code-architecture-pro/references/edge-cases.md)

### Anti-patterns (summary)

God module, leaky domain, premature layering — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](/skills/clean-code-architecture-pro/references/anti-patterns.md)

### Decision trees (summary)

Placement of logic, refactor timing, strict vs pragmatic — **`decision-tree.md`**.

Details: [references/decision-tree.md](/skills/clean-code-architecture-pro/references/decision-tree.md)

### Integration map (summary)

**`testing-pro`**, **`typescript-pro`**, **`api-design-pro`**, frameworks — **`integration-map.md`**.

Details: [references/integration-map.md](/skills/clean-code-architecture-pro/references/integration-map.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Stack, codebase scale, team constraint, legacy vs new feature.
2. **Problem** — Symptom (coupling smell, wrong layer, cycle) and **goal** (testable boundary, reduced churn).
3. **System design / architecture** — Target dependency graph: domain / use cases / adapters; ports and data flow at boundaries — cite **`dependency-rule-system-model.md`** when non-trivial.
4. **Decision reasoning** — Why this boundary vs alternatives; link **`decision-framework-and-tradeoffs.md`** / **`decision-tree.md`** (e.g. strangler vs rewrite).
5. **Implementation sketch** — Concrete steps: extract interface, move class, rename package — **small PR sequence**; pseudocode or folder outline; **no fake repo paths** unless illustrative.
6. **Trade-offs** — Velocity vs purity; duplication vs wrong abstraction; test cost — explicit.
7. **Failure modes** — Top risks for **this** change (hidden cycles, duplicate rules, mock-heavy tests lying) — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Untested paths, needing **`testing-pro`**, timeline risk, follow-up lint rules.

## Resources in this skill

| Topic | File |
|-------|------|
| Dependency rule & system model | [references/dependency-rule-system-model.md](/skills/clean-code-architecture-pro/references/dependency-rule-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](/skills/clean-code-architecture-pro/references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-tradeoffs.md](/skills/clean-code-architecture-pro/references/decision-framework-and-tradeoffs.md) |
| Bounded context & strangler | [references/bounded-context-and-strangler-patterns.md](/skills/clean-code-architecture-pro/references/bounded-context-and-strangler-patterns.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](/skills/clean-code-architecture-pro/references/quality-validation-and-guardrails.md) |
| Versions & stack dialects | [references/versions-and-stack-dialects.md](/skills/clean-code-architecture-pro/references/versions-and-stack-dialects.md) |
| Tips | [references/tips-and-tricks.md](/skills/clean-code-architecture-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/clean-code-architecture-pro/references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/clean-code-architecture-pro/references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](/skills/clean-code-architecture-pro/references/decision-tree.md) |
| Integration map | [references/integration-map.md](/skills/clean-code-architecture-pro/references/integration-map.md) |

## Quick example

**Input:** “Refactor service to clean architecture without breaking behavior.”  
**Expected output:** Full **Suggested response format**: target layers, strangler steps, characterization test hook, failure modes (duplicate logic).

**Input:** New `shared/kernel` for everything.  
**Expected output:** **Decision reasoning** against hidden coupling; bounded context alternative; **`edge-cases.md`** theme.

## Checklist before calling the skill done

### Architecture

- [ ] **Dependency direction** explicit — inner layers free of outer concrete imports.
- [ ] **Trade-off** depth matches domain complexity — not over-layered trivial code — **`quality-validation-and-guardrails.md`**.

### Execution

- [ ] **Incremental** path preferred; big-bang flagged with risks — **`bounded-context-and-strangler-patterns.md`**.
- [ ] **Implementation sketch** includes sequenced steps or checklist; not advice-only.

### Safety

- [ ] **Failure modes** section present — not only happy-path refactor.
- [ ] **`testing-pro`** cited when characterization or boundary tests are missing.
- [ ] **Utils** / shared hub growth called out when relevant — **`anti-patterns.md`**.
