# Versions and compatibility (microservices)

## Contract surfaces

| Surface | Pin / govern |
|---------|----------------|
| **REST/OpenAPI** | Breaking vs additive in CI — **`api-design-pro`** |
| **gRPC / Protobuf** | Field numbers; `optional` semantics per proto3 rules |
| **Async schema** | Avro/JSON Schema registry with compatibility mode |

## Runtime skew

- **Gateway vs services** — Mixed versions during rollout; **feature flags** + backward-compatible contracts — **`edge-cases.md`** deployment skew.
- **Mesh / ingress** — CRD and controller versions must match cluster policy — verify upgrade notes.

## Platform

- **Kubernetes** API version drift between envs causes surprise deploy failures — pin **policy/constraints** version.
