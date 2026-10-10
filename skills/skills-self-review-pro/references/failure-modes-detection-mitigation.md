# Failure modes — detection and mitigation (skills self-review)

## Contents

1. [Green validate, bad content](#green-validate-bad-content)
2. [Stale tech refresh](#stale-tech-refresh)
3. [INDEX drift](#index-drift)
4. [Scope explosion in one PR](#scope-explosion-in-one-pr)

---

## Green validate, bad content

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Passes scripts, weak triggers** | Human read finds gaps | Manual §2 checklist — **`authoring-rules-crosscheck.md`** |

---

## Stale tech refresh

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Only local analyze, no web** | Outdated API notes | Pair **`web-research-pro`** — **`tech-refresh-and-web-research.md`** |

---

## INDEX drift

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **New KB doc not indexed** | Broken navigation | Update **INDEX** + optional **`build-kb`** — **`repo-tooling-pro`** |

---

## Scope explosion in one PR

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Unrelated skills rewritten** | Review fatigue | Enforce PR scope — **`anti-patterns.md`** |
