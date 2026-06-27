# Decision framework and trade-offs (repo tooling)

## Contents

1. [Batch vs single query](#batch-vs-single-query)
2. [When to rebuild KB](#when-to-rebuild-kb)
3. [Analyze-skills depth](#analyze-skills-depth)
4. [Local vs CI responsibility](#local-vs-ci-responsibility)

Pair with **`decision-tree.md`** for short branches.

---

## Batch vs single query

| Prefer **`query-kb-batch`** | Prefer **`query-kb`** |
|-----------------------------|------------------------|
| Many questions, one session, acceptable RAM | One-off exploration, tight memory |

**Trade-off:** batch saves **latency and model load**; failure loses more work per run — split batches for resilience — **`failure-modes-detection-mitigation.md`**.

---

## When to rebuild KB

| Trigger | Action |
|---------|--------|
| `knowledge-base/documents/**` (or configured corpora) edited | `build-kb` → `verify-kb` |
| Only **skill markdown** changed, no KB docs | Usually **no** `build-kb`; still **`validate-skills`** + **`build-skill-index`** |

**Trade-off:** rebuild cost vs **correctness** of RAG answers — never skip rebuild after substantive doc changes — **`repo-tooling-and-kb-lifecycle-system-model.md`**.

---

## Analyze-skills depth

| Flag intent | Use when |
|-------------|----------|
| `--markdown` | Paste-ready audit for humans |
| `--only-actionable` | PR-sized fix lists |

**Trade-off:** deeper reports take longer to produce and read — combine with **`skills-self-review-pro`** for narrative.

---

## Local vs CI responsibility

- **Local:** fast iteration, `query-kb` experiments.
- **CI:** **`validate-skills`** (and optionally **`verify-kb`**) on every skills/KB PR — wiring owned by **`ci-cd-pro`** / **`deployment-pro`** at org level; this skill defines **what** to run.
