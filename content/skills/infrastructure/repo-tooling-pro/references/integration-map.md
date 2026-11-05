# Repo tooling — integration map

| Skill | When |
|-------|------|
| **`skills-self-review-pro`** | Full bundle audit, authoring checklist, narrative on top of **`analyze-skills --markdown`**. |
| **`web-research-pro`** | External facts — not replaceable by `query-kb`. |
| **`ci-cd-pro`** | Wiring **`validate-skills`**, **`build`**, **`verify-kb`** into pipelines, matrix Node, caches. |
| **`deployment-pro`** | Runner sizing, secrets, cross-repo promotion of KB artifacts. |
| **`security-pro`** | API keys for embeddings / external search; log redaction. |
| **`documentation-persistence`** rule | When KB docs added — INDEX + **build-kb** / **verify-kb** per repo policy. |

**Handoff:** **`repo-tooling-pro`** defines **which CLI steps** apply; **`ci-cd-pro`** implements **YAML and runner** policy for your organization.
