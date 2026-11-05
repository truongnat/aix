# API design — contract lifecycle (system model)

## Contents

1. [Contract surfaces](#contract-surfaces)
2. [Mutation and read paths](#mutation-and-read-paths)
3. [Evolution axis](#evolution-axis)
4. [Observability and governance](#observability-and-governance)

Pair with **[resource-modeling-and-actions.md](resource-modeling-and-actions.md)** and **[observability-and-api-governance.md](observability-and-api-governance.md)**.

---

## Contract surfaces

HTTP resources, RPC procedures, or **events** each imply different **idempotency**, **versioning**, and **error** mapping — **`decision-tree.md`**.

---

## Mutation and read paths

Writes define **consistency** obligations; reads define **pagination** and **cache** semantics — **`mutation-semantics-and-concurrency.md`**, **`consistency-and-conflicts.md`**.

---

## Evolution axis

Additive fields vs **breaking** renames — OpenAPI per major — **`versions.md`**.

---

## Observability and governance

Request id, stable **error codes**, deprecation headers — **`observability-and-api-governance.md`**.
