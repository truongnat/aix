# Review feedback system model

## Lifecycle (mental map)

```text
Artifact (PR, doc, design)
    → Observation (diff, behavior, requirement)
        → Finding (impact + evidence + confidence)
            → Action (owner, change, deadline class)
                → Verification (how we know “done”)
                    → Closure (merged, ticketed, or risk accepted)
```

**Feedback is not done** until **verification** exists or **risk acceptance** is explicit — **`action-planning-and-closure.md`**.

## Roles (explicit or implicit)

| Role | Accountability |
|------|----------------|
| **Reviewer** | Signal quality: evidence, severity, constructive tone — **`finding-structure-and-evidence.md`**. |
| **Author** | Respond with fix, question, or trade-off proposal; escalate scope conflicts. |
| **Maintainer / tech lead** | Break ties; protect merge bar when reviewers conflict — **`edge-cases.md`**. |
| **Product / PM** | Own ambiguity in “what correct means” — separate from code craft — **`edge-cases.md`**. |

## Channels

| Channel | Fits when |
|---------|-----------|
| **Async PR comments** | Default; preserves evidence trail |
| **Short sync / RFC** | Architecture or product fork; stop endless threads — **`decision-tree.md`** |

## Outputs (contracts)

- **Finding** — At minimum: location, observation, impact, severity, recommendation, confidence.
- **Merge gate** — Must-fix list or explicit **risk accepted by name** — **`severity-and-prioritization.md`**.
