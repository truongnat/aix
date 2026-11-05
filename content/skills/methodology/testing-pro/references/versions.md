# Testing stack — versions (concise)

`testing-pro` is runner-agnostic — pin versions per project.

| Tool | Note |
|------|------|
| **Jest / Vitest** | Align with ESM/`isolatedModules`; Vitest often pairs with Vite |
| **Playwright / Cypress** | Browser pin; trace on failure in CI |
| **pytest** | Fixtures and plugins per Python version |

Cite **`package.json` / `pytest.ini`** in project answers, not global latest.
