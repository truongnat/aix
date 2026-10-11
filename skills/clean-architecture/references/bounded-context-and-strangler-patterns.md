# Bounded context, ACL, and strangler

## Bounded context (DDD-lite)

- Each **module** aligns with a **linguistic boundary** — same word (“Order”) may mean different things in sales vs shipping **without** merging models prematurely.
- **Anti-corruption layer (ACL)** — Translate foreign model → your domain at the edge when integrating legacy or external systems.

## Strangler fig

1. Identify **seam** (feature slice, route, package).
2. Wrap old path behind **facade** or **adapter**.
3. Implement new path with correct dependency direction.
4. Route traffic gradually; delete old path when parity proven — **`testing-pro`**.

## Partial migration risks

- **Duplicate rules** in old/new — document **owner** of truth until cutover.
- **Shared database** across contexts — schema coupling; prefer API or events between contexts over shared tables when scaling teams.

## Modular monolith vs microservices

- Prefer **clear modules in one deployable** until **organizational or scale** pressure forces split — avoids distributed ball of mud — **`edge-cases.md`**.
