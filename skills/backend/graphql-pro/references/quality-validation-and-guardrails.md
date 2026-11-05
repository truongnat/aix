# Quality validation and guardrails (anti-hallucination)

## Spec and server accuracy

- [ ] **Directive / feature names** (`@defer`, federation `@key`) depend on **exact server/router** — verify docs for Apollo Router vs Mesh vs Yoga — **`versions.md`**.
- [ ] Do **not** invent **SDL** field names or types not in the user’s schema.

## Snippets

- [ ] **Resolver signatures** vary by framework (Apollo `parent/args/context`, NestJS decorators) — match stated stack — **`integration-map.md`**.

## Security claims

- [ ] **“Disable introspection = safe”** — false; authZ and query limits still required — **`security-pro`**.

## Performance claims

- [ ] **DataLoader** — Describe **batch function** semantics; avoid promising exact SQL without schema — **`tips-and-tricks.md`**.
