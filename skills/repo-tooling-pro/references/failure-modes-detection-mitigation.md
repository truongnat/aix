# Failure modes — detection and mitigation (repo tooling)

## Contents

1. [Environment and paths](#environment-and-paths)
2. [Stale artifacts](#stale-artifacts)
3. [Resource limits](#resource-limits)
4. [CI and automation](#ci-and-automation)

---

## Environment and paths

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Wrong cwd** | “File not found” for `config.md` / KB paths | `cd` to repo root; document in CI `working-directory` — **`edge-cases.md`** |
| **Missing `dist/tools.js`** | ENOENT on `node dist/tools.js` | `npm install` + `npm run build`; cache `dist/` in CI or always build — **`edge-cases.md`** |
| **Broken Node version** | Native module or engine errors | Match `engines` in root `package.json` — **`versions.md`** |

---

## Stale artifacts

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Stale embeddings** | Answers omit new docs | `build-kb` then `verify-kb` after doc edits — **`decision-tree.md`** |
| **Stale skill index** | New skill invisible to tooling | `build-skill-index` after `skills/**` changes — **`repo-tooling-and-kb-lifecycle-system-model.md`** |
| **Wrong `--index` path** | Empty or wrong corpus | Verify path to index base; rebuild `index-project` if tree changed — **`kb-and-repo-scripts.md`** |

---

## Resource limits

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Batch OOM** | Process killed mid-batch | Smaller batches; shorter prompts; more RAM — **`edge-cases.md`** |
| **Disk full during build** | `build-kb` / `index-project` fails | Clean artifacts; expand volume — **`deployment-pro`** for runners |

---

## CI and automation

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Validate passes locally, fails in CI** | Different Node, missing `dist/` | Align Node; explicit build step — **`quality-validation-and-guardrails.md`** |
| **Secrets in logged commands** | API keys in shell history | Use env vars; mask logs — **`security-pro`** |
