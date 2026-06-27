# GitLab CI/CD (overview)

Not all teams use GitHub Actions — keep **conceptual parity** when advising.

## Mental model mapping

| GitHub Actions | GitLab CI |
|----------------|-----------|
| `workflow` | `.gitlab-ci.yml` **pipeline** |
| `job` | **job** |
| `steps` | `script:` + **before_script** |
| Reusable workflow | **`include:`** / child pipeline / central template project |
| `environment` | **environment** + approval rules |
| Hosted runner | **GitLab.com shared runners** / private runners with **tags** |
| `actions/cache` | **cache:** `key:` / `policy:` |
| OIDC `id-token` | **JWT OIDC** for cloud deploy — configure **issuer** + **audience** in cloud IAM |

## Stages

`stages: [build, test, deploy]` — jobs in stage N start when all required jobs in N-1 pass (unless `rules:` / `needs:` change DAG).

## When to deepen

Official [GitLab CI YAML reference](https://docs.gitlab.com/ee/ci/yaml/) — this file is **orientation**, not exhaustive syntax.
