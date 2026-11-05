# Quality validation and guardrails (anti-hallucination)

## API truth

- [ ] **Nest major** — Decorator and `fastify`/`express` adapter options differ by version — point to migration guide — **`versions.md`**.
- [ ] Do **not** invent **`@nestjs/...` package versions** — use placeholders or user `package.json`.

## Security claims

- [ ] **Guards alone** don’t enforce **RLS** — database role + `SET` + policies — **`postgresql-rls-integration.md`**.
- [ ] **`ValidationPipe`** ≠ authorization — always **Guards** for roles/permissions — **`nestjs-runtime-pipeline-and-di-model.md`**.

## Snippets

- [ ] **`ConfigService.get`** vs `process.env` — prefer Nest config module for testability — **`tips-and-tricks.md`**.

## Cross-links

- [ ] Link **PostgreSQL RLS** docs to **`row-level-security.md`** (correct filename) — not misspelled paths.
