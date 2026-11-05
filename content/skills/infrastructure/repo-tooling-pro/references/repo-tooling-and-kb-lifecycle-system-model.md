# Repo tooling — system model and KB lifecycle

## Contents

1. [Workspace contract](#workspace-contract)
2. [Skills pipeline](#skills-pipeline)
3. [Knowledge base pipeline](#knowledge-base-pipeline)
4. [Project index and wiki](#project-index-and-wiki)
5. [Query execution model](#query-execution-model)

Canonical flags live in **[`scripts/README.md`](/scripts/README.md)** at repo root — this file explains **relationships**, not every flag.

---

## Workspace contract

- **cwd = repo root** — Tools resolve `knowledge-base/`, `config.md`, `skills/`, and `dist/tools.js` from that anchor.
- **`dist/tools.js`** — Built output of TypeScript CLI; absent until **`npm run build`** — **`edge-cases.md`**.

---

## Skills pipeline

```
skills/** changed
    → validate-skills (YAML + layout)
    → build-skill-index (agent routing JSON)
```

Stale **`skill_index.json`** means agents may not see new skills — always pair validation with index rebuild when shipping skills — **`decision-tree.md`**.

---

## Knowledge base pipeline

```
knowledge-base/documents/** (and configured sources) edited
    → build-kb (embeddings / artifacts)
    → verify-kb (sanity check)
    → query-kb / query-kb-batch (read)
```

**Queries without rebuild** read **old vectors** — misleading answers — **`failure-modes-detection-mitigation.md`**.

---

## Project index and wiki

**`index-project`** builds embeddings for an **arbitrary tree**; **`query-kb --index <dir>`** targets that index; **`generate-wiki`** consumes indexed docs under a conventional layout — see **`scripts/README.md`** and **`kb-and-repo-scripts.md`**.

---

## Query execution model

| Mode | Model loads | Fit |
|------|-------------|-----|
| **`query-kb-batch`** | Typically **once** per invocation for the batch | Many questions in one session |
| **N × `query-kb`** | **N** loads | Anti-pattern at scale — **`anti-patterns.md`** |

RAM scales with **batch size**, **embedding model**, and **prompt length** — **`edge-cases.md`**.
