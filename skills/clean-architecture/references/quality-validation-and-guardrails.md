# Quality validation and guardrails (anti-hallucination)

## Before prescribing architecture

- [ ] **Codebase size and domain complexity** stated — don’t apply enterprise layering to 200-line scripts.
- [ ] **Stack named** — Nest/Spring/React influence **where** adapters live, not **whether** dependency rule applies.
- [ ] **No fictional file paths** — use placeholders like `src/domain/...` with “adjust to repo layout.”
- [ ] **Second implementation rule** — Don’t invent interfaces until a real second adapter or test need exists (YAGNI with eyes open).

## Wrong-answer prevention

- **Uncle Bob diagram worship** without mapping to **this repo’s** packages — reject; always anchor to **current** tree.
- **“Always microservices”** — violates trade-off framework — **`decision-framework-and-tradeoffs.md`**.
- **Rename-only PR labeled architecture** — call out if behavior unchanged but risk still exists (missed edge cases).

## Validation points

1. **Dependency direction** — Can inner layer compile without outer? (module graph / import rules).
2. **Use case trace** — One user story → one orchestration path → visible in code.
3. **Test pyramid** — Domain rules tested **without** HTTP when possible — **`testing-pro`**.
