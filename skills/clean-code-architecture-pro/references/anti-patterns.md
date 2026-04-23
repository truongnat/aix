# Anti-patterns — clean code / architecture

1. **God module** — One file owns unrelated concerns; becomes change bottleneck.
2. **Leaky domain** — ORM entities or DTOs drive business rules instead of explicit domain model.
3. **Premature layering** — Four packages for a CRUD prototype; slows delivery without payoff.
4. **“Utils” dumping ground** — Hidden coupling and unclear ownership.
5. **Feature folders that mirror layers only** — `services/` full of mixed domains; prefer feature or domain slices when team agrees.
6. **Refactor without tests** — Restructure without characterization tests invites silent behavior drift.
7. **Abstract factory for one implementation** — YAGNI until a second real backend exists.

See [decision-tree.md](decision-tree.md), [edge-cases.md](edge-cases.md), [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md).
