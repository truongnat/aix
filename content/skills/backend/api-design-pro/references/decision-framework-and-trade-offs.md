# Decision framework and trade-offs (API design)

## Contents

1. [REST vs RPC vs events](#rest-vs-rpc-vs-events)
2. [Cursor vs offset pagination](#cursor-vs-offset-pagination)
3. [Strict errors vs verbose debug](#strict-errors-vs-verbose-debug)
4. [Sync vs async operations](#sync-vs-async-operations)

See **`decision-tree.md`** for structured choices.

---

## REST vs RPC vs events

REST fits **resource** centric domains; RPC/events fit **workflows** and fan-out — **`workflow-and-state-transitions.md`**.

---

## Cursor vs offset pagination

Offset is simple but **degrades** on large shifting sets; cursor needs **stable ordering** — **`query-filtering-and-projection.md`**.

---

## Strict errors vs verbose debug

Public APIs minimize **internal** leakage; internal gateways may expose **diagnostic** fields — **`observability-and-api-governance.md`**.

---

## Sync vs async operations

Long work should be **202 + operation resource** vs risking **gateway timeouts** — **`async-webhooks-and-jobs.md`**.
