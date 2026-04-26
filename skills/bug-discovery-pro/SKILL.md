---
name: bug-discovery-pro
description: |
  Professional defect discovery and production-oriented debugging: full methodology (observe, reproduce, narrow, hypothesize, validate, handoff fix, regression prevention), bug taxonomy (logic, state, concurrency, data, integration, config, infra, performance, security), hypothesis-driven experiments, GitNexus graph-assisted exploration (query, context, impact, api_impact, shape_check, detect_changes), runtime signals (logs, traces, metrics, profiling, dumps), failure modes (timeout, partial failure, retry storm, cascade, stale cache, split-brain), state/concurrency and distributed-boundary debugging, observability correlation — always as triaged candidates with confidence, never false "100%" guarantees.

  Use this skill when hunting bugs, tracing regressions, triaging production incidents with telemetry, asking what else could break, or needing structured candidate lists with confidence when GitNexus MCP is available after indexing. Combine with tests, runtime evidence, and security-pro for vulns. Fixes delegate to domain *-pro skills.

  Use with testing-pro (repro, coverage), security-pro (abuse boundaries), content-analysis-pro (logs/dumps), api-design-pro (contracts), deployment-pro / network-infra-pro (infra rollouts). External Cursor skills: gitnexus-cli, gitnexus-debugging, gitnexus-exploring, gitnexus-impact-analysis.

  Triggers: "bug", "bugs", "find bug", "regression", "root cause", "blast radius", "who calls", "impact", "GitNexus", "knowledge graph", "candidate defect", "hypothesis", "race condition", "deadlock", "memory leak", "distributed trace", "retry storm", "stale cache", "incident", "production bug", "flaky", "timeout", "span", "correlation id", "shape mismatch", "stale index", "git bisect", "false positive graph".

metadata:
  short-description: Bug discovery — methodology, taxonomy, graph + runtime debugging, candidates, confidence
  content-language: en
  domain: debugging
  level: professional
---

# Bug discovery (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

No tool yields **100%** of all bugs — treat outputs as **candidates** with **evidence** and **confidence** (**`bug-candidates-and-confidence.md`**). This skill encodes **end-to-end debugging methodology** (static + graph + runtime), **taxonomy-informed triage**, and **related-defect** analysis via GitNexus **`impact`** and **`api_impact`** when indexed. Confirm **repro** (or logs), **indexed** graph freshness, and **repo** identity in multi-repo setups.

**GitNexus:** Index the codebase first (**`gitnexus-cli`** skill or org pipeline), then use MCP tools on the **`user-gitnexus`** server per [references/gitnexus-graph-workflow.md](/skills/bug-discovery-pro/references/gitnexus-graph-workflow.md).

## Boundary

**`bug-discovery-pro`** owns **debugging process**, **hypothesis discipline**, **bug classification cues**, **graph-assisted** and **telemetry-aware** investigation narratives, and **candidate** reporting. It does **not** replace **on-call runbooks**, full **APM** ownership, or **`*-pro`** implementations — delegate **fixes** and deep **framework** edits to the right skill.

## Related skills (this repo)

| Skill | When to combine with `bug-discovery-pro` |
|-------|------------------------------------------|
| **`testing-pro`** | Repro, flaky tests, coverage, CI signals, regression tests after root cause |
| **`security-pro`** | Vulnerability-class issues, threat-relevant bugs |
| **`content-analysis-pro`** | Parse **logs**, **build output**, or **crash dumps** as attached text |
| **`api-design-pro`** | Contract drift, idempotency/retry semantics at boundaries |
| **`deployment-pro`** | Rollouts, flags, mixed versions during incidents |
| **`network-infra-pro`** | DNS, LB, saturation, cascading failure patterns |

**External (Cursor):** **`gitnexus-cli`** (index/analyze), **`gitnexus-debugging`**, **`gitnexus-exploring`**, **`gitnexus-impact-analysis`** — use their `SKILL.md` for tool-specific steps; **`bug-discovery-pro`** ties them into a **bug-hunting** and **incident triage** narrative.

## When to use

- **Root-cause** and **related** breakage analysis (shared code paths).
- **Production** symptoms — pair **runtime** references with graph when code location is unclear.
- **Deep repo** exploration when grep is not enough — **execution flows** and **impact**.
- **API** response vs consumer **shape** mismatches (`shape_check` / `api_impact`).
- **Pre-commit** / **pre-PR** “what did I break?” (`detect_changes`).
- Honest **candidate** lists — not a promise of total bug enumeration.

## When not to use

- **Authoritative pen-test or compliance sign-off** — **`security-pro`** + human review.
- **Pure feature design** with no failure — other skills first.

## Required inputs (when triaging)

- **Symptom** and **scope** (env, version, user cohort).
- **Repro** status or **telemetry** pointers (trace id, time window).
- **GitNexus** availability and **index** freshness if using graph steps.

## Expected output

Follow **Suggested response format (STRICT)** — eight sections with **confidence-labeled** candidates and explicit experiments.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** **symptom**, **repro** or **logs/traces**, **branch**, GitNexus **index** status, **taxonomy** hint → verify: [context captured].
2. **State assumptions** about bug location, root cause (**Think Before Coding**).
3. **Apply** minimum debugging approach first; add complexity (graph analysis) only when justified (**Simplicity First**).
4. **Make surgical changes** — only investigate code paths related to the symptom (**Surgical Changes**).
5. **Define success criteria** (repro case, fix verification, regression test); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format (STRICT)**; note **stale graph**, **false positives**, **untested** paths, and **observability** gaps.

### Operating principles

1. **Think Before Coding** — State assumptions: bug location, reproduction conditions. Ask when uncertain.
2. **Simplicity First** — Start with simple debugging; add graph/tools only when justified.
3. **Surgical Changes** — Only investigate code paths directly related to the symptom.
4. **Goal-Driven Execution** — Define reproduction criteria, fix verification, regression tests upfront.
5. **Candidates, not certainty** — Label confidence; prove or falsify with tests/runtime (**`hypothesis-driven-debugging.md`**).
6. **Methodology over gadgets** — Graph augments **`debugging-methodology.md`**; it does not replace reproduce/narrow.
7. **Repro first** when feasible — Smallest failing case wins; **bisect** when useful.
8. **Taxonomy steers tactics** — **`bug-taxonomy.md`** picks graph-heavy vs trace-heavy vs infra-heavy steps.
9. **Graph augments reading** — GitNexus **does not** replace reading suspicious code.
10. **Related bugs** — Use **`impact`** / **`api_impact`** to widen regression surface.
11. **Index currency** — Re-index after large refactors before trusting **impact**.
12. **Security** — Do not treat graph output as **pen-test**; use **`security-pro`** for abuse models.

### Evidence, graph, and hypothesis (system model) (summary)

Observe → reproduce → narrow; hypothesis ledger; graph accelerates — **`evidence-graph-and-hypothesis-system-model.md`**.

Details: [references/evidence-graph-and-hypothesis-system-model.md](/skills/bug-discovery-pro/references/evidence-graph-and-hypothesis-system-model.md)

### Failure modes — detection and mitigation (summary)

Stale graph, false confidence, missing telemetry, intermittent repro — **`failure-modes-detection-mitigation.md`** (see also **`failure-modes.md`** for system failure shapes).

Details: [references/failure-modes-detection-mitigation.md](/skills/bug-discovery-pro/references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Graph-first vs telemetry-first; bisect vs read; stop rules — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](/skills/bug-discovery-pro/references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Evidence vs inference; confidence labels; no false certainty — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](/skills/bug-discovery-pro/references/quality-validation-and-guardrails.md)

### Debugging methodology (summary)

Observe → reproduce → narrow → hypothesize → validate → fix handoff → regression prevention.

Details: [references/debugging-methodology.md](/skills/bug-discovery-pro/references/debugging-methodology.md)

### Hypothesis-driven debugging (summary)

Hypothesis → experiment → result → update belief; pair **`bug-candidates-and-confidence.md`**.

Details: [references/hypothesis-driven-debugging.md](/skills/bug-discovery-pro/references/hypothesis-driven-debugging.md)

### Bug taxonomy (summary)

Logic, state, concurrency, data, integration, config, infra, performance, security — drives next investigation step.

Details: [references/bug-taxonomy.md](/skills/bug-discovery-pro/references/bug-taxonomy.md)

### Runtime debugging (summary)

Logs, traces, metrics, profiling, dumps — production-first evidence.

Details: [references/runtime-debugging.md](/skills/bug-discovery-pro/references/runtime-debugging.md)

### Failure modes (summary)

Timeouts, partial failure, retry storms, cascades, stale cache, split-brain, config drift.

Details: [references/failure-modes.md](/skills/bug-discovery-pro/references/failure-modes.md)

### State and concurrency debugging (summary)

Races, deadlocks, ordering, async, retries, eventual consistency read issues.

Details: [references/state-and-concurrency-debugging.md](/skills/bug-discovery-pro/references/state-and-concurrency-debugging.md)

### Distributed systems debugging (summary)

Boundaries, contracts, queues, duplicate/out-of-order delivery, cross-service traces.

Details: [references/distributed-systems-debugging.md](/skills/bug-discovery-pro/references/distributed-systems-debugging.md)

### Observability integration (summary)

Correlation IDs, tracing, sampling, metrics alignment — **`observability-integration.md`**.

Details: [references/observability-integration.md](/skills/bug-discovery-pro/references/observability-integration.md)

### GitNexus graph workflow (summary)

Preconditions: **indexed** repo; tool order **`query`** → **`context`** → **`impact`** / **`api_impact`** / **`shape_check`** / **`detect_changes`**.

Details: [references/gitnexus-graph-workflow.md](/skills/bug-discovery-pro/references/gitnexus-graph-workflow.md)

### Bug candidates and confidence (summary)

Why **100%** is impossible; **related bug** meanings; triage vocabulary; handoff to **`testing-pro`** / **`security-pro`**.

Details: [references/bug-candidates-and-confidence.md](/skills/bug-discovery-pro/references/bug-candidates-and-confidence.md)

### Tips and tricks (summary)

Repro, bisect, **`query`** hints, **`impact`** d=1 priority, IDE fallback without graph.

Details: [references/tips-and-tricks.md](/skills/bug-discovery-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Stale graph, dynamic imports, monorepo **`repo`**, shape_check false positives — plus runtime, concurrency, distributed, infra, observability edges.

Details: [references/edge-cases.md](/skills/bug-discovery-pro/references/edge-cases.md)

### Decision flow and anti-patterns (summary)

Where to start (graph vs telemetry); intermittent repro; 100% claims; stale index.

Details: [references/decision-tree.md](/skills/bug-discovery-pro/references/decision-tree.md) · [references/anti-patterns.md](/skills/bug-discovery-pro/references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`testing-pro`**, **`security-pro`**, **`content-analysis-pro`**, **`api-design-pro`**, **`deployment-pro`**, GitNexus Cursor skills.

Details: [references/integration-map.md](/skills/bug-discovery-pro/references/integration-map.md)

### Versions (summary)

Index schema, monorepo `repo` param, tool naming by CLI version.

Details: [references/versions.md](/skills/bug-discovery-pro/references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Symptom, env/version, severity, repro status, GitNexus index freshness if used.
2. **Problem / goal** — What “fixed” means; blast radius if unknown.
3. **System design** — Evidence loop (observe→repro→narrow) — **`evidence-graph-and-hypothesis-system-model.md`**.
4. **Decision reasoning** — Graph-first vs telemetry-first; next experiment choice — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Ordered investigation steps, tool calls — **Code** for command lines or query snippets.
6. **Trade-offs** — Speed vs depth; wide `impact` vs deep file read.
7. **Failure modes** — Stale index, false positives, missing spans — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Confidence table; delegation to **`testing-pro`** / **`security-pro`** / stack **`*-pro`**.

## Resources in this skill

- `references/` — Methodology, taxonomy, runtime, failure modes, GitNexus workflow, confidence model, integration map.
- **MCP:** read tool schemas under your IDE’s GitNexus MCP folder before calling tools.

| Topic | File |
|-------|------|
| **Evidence & hypothesis model** | [references/evidence-graph-and-hypothesis-system-model.md](/skills/bug-discovery-pro/references/evidence-graph-and-hypothesis-system-model.md) |
| Failure modes (debugging) | [references/failure-modes-detection-mitigation.md](/skills/bug-discovery-pro/references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](/skills/bug-discovery-pro/references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](/skills/bug-discovery-pro/references/quality-validation-and-guardrails.md) |
| Debugging methodology | [references/debugging-methodology.md](/skills/bug-discovery-pro/references/debugging-methodology.md) |
| Hypothesis-driven debugging | [references/hypothesis-driven-debugging.md](/skills/bug-discovery-pro/references/hypothesis-driven-debugging.md) |
| Bug taxonomy | [references/bug-taxonomy.md](/skills/bug-discovery-pro/references/bug-taxonomy.md) |
| Runtime debugging | [references/runtime-debugging.md](/skills/bug-discovery-pro/references/runtime-debugging.md) |
| Failure modes | [references/failure-modes.md](/skills/bug-discovery-pro/references/failure-modes.md) |
| State & concurrency | [references/state-and-concurrency-debugging.md](/skills/bug-discovery-pro/references/state-and-concurrency-debugging.md) |
| Distributed systems | [references/distributed-systems-debugging.md](/skills/bug-discovery-pro/references/distributed-systems-debugging.md) |
| Observability integration | [references/observability-integration.md](/skills/bug-discovery-pro/references/observability-integration.md) |
| GitNexus workflow | [references/gitnexus-graph-workflow.md](/skills/bug-discovery-pro/references/gitnexus-graph-workflow.md) |
| Candidates & confidence | [references/bug-candidates-and-confidence.md](/skills/bug-discovery-pro/references/bug-candidates-and-confidence.md) |
| Tips and patterns | [references/tips-and-tricks.md](/skills/bug-discovery-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/bug-discovery-pro/references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](/skills/bug-discovery-pro/references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/bug-discovery-pro/references/anti-patterns.md) |
| Integration map | [references/integration-map.md](/skills/bug-discovery-pro/references/integration-map.md) |
| Versions | [references/versions.md](/skills/bug-discovery-pro/references/versions.md) |

## Quick example

**Input:** Intermittent 500 on `/api/orders` after deploy — find related risk.  
**Expected output:** Taxonomy hint (**integration**/**failure mode**); **`api_impact`** / **`shape_check`** if indexed; **trace** correlation suggestion; **candidates** table with confidence; **no** “all bugs found.”

**Input:** “Graph says no callers — bug impossible.”  
**Expected output:** **Dynamic import**, scripts, **unindexed** paths; **confidence** low; **`testing-pro`** repro; do not close on graph alone.

**Input:** Memory grows over 24h — leak suspected.  
**Expected output:** **Runtime** path (**heap**, allocation profile); graph only for **who allocates** after narrowing; hypothesis loop.

## Checklist before calling the skill done

### Core

- [ ] **Symptom** and **repro or telemetry** referenced where possible.
- [ ] **Taxonomy** considered — at least implicit — so tactics match bug class.
- [ ] **Hypothesis / evidence** distinguished from conclusions.
- [ ] **Candidates** labeled; **no false 100%** claim.

### Methodology & graph

- [ ] **`debugging-methodology.md`** phases respected — not **only** graph traversal.
- [ ] **GitNexus** steps skipped or noted if index unavailable.
- [ ] **Related** code paths considered via **impact** or equivalent when graph exists.
- [ ] **Index freshness** considered after large refactors.
- [ ] **Graph limitations** (dynamic imports, monorepo root) stated when relevant.

### Runtime & distribution (when relevant)

- [ ] **Logs/traces/metrics** angle mentioned for production-shaped failures.
- [ ] **Concurrency** / **ordering** / **duplicate delivery** noted if flaky or messaging involved.
- [ ] **Failure modes** (timeout, retry storm, stale cache) considered for incidents.

### Handoff

- [ ] Fix implementation **delegated** to appropriate **`*-pro`** skill when coding.
- [ ] **Regression prevention** (test or monitor) mentioned when root cause identified.
