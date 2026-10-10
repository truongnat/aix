# Quality validation and guardrails (anti-hallucination)

## Before writing `pyproject.toml` advice

- [ ] **PEP 621** — `[project]` keys match current Python packaging spec; don’t invent tables.
- [ ] **Build backend** — Name exact backend (`hatchling.build_meta`) per project choice; don’t mix `[tool.poetry]` with `[project]` without migration context.
- [ ] **Version field** — Dynamic version (`setuptools-scm`, hatch) vs static — state assumption.

## Before Dockerfile snippets

- [ ] **Base image** tag — Pin major or digest; note **Windows** if claiming cross-platform.
- [ ] **No secrets** in `RUN echo` or build args that survive final stage.

## Wrong-answer prevention

- **“Use Poetry”** without knowing lockfile policy — give **criteria** — **`decision-framework-and-tradeoffs.md`**.
- **Universal GHCR path** — Registry URLs and org names are placeholders (`ghcr.io/OWNER/IMAGE`).

## Validation points

1. **`requires-python`** aligns with CI matrix.
2. **Release workflow** triggers only on **tag** or **manual** when secrets involved — not every PR.
