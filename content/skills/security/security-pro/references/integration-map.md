# Integration map — security-pro

| Combined skill | Why | `security-pro` owns | Other skill owns |
|----------------|-----|----------------------|------------------|
| **`nestjs-pro`** | HTTP API | Threats, authz rules, validation policy | Guards, pipes, filters, module wiring |
| **`nextjs-pro`** | Web surface | CSP, cookie strategy, Server Action abuse, env leakage | Routing, cache, middleware mechanics |
| **`postgresql-pro`** | Data layer | RLS intent, least privilege | SQL, migrations, query patterns |
| **`api-design-pro`** | Public contracts | Abuse cases, versioning, idempotency for sensitive ops | OpenAPI shape, pagination ergonomics |
| **`auth-pro`** | Identity protocols | Session/JWT/OAuth threat framing | Provider wiring, token lifetimes in code |
| **`react-pro`** / **`react-native-pro`** / **`flutter-pro`** | Client surface | XSS, deep links, secure storage policy | UI implementation |
| **`testing-pro`** | Assurance | Abuse cases, security regression tests | CI layout, runners |
| **`ci-cd-pro`** | Pipelines | Secrets in CI, fork PR policy, action pinning | YAML structure, matrix |
| **`deployment-pro`** | Runtime exposure | TLS termination, WAF hints, secret mounts | Infra topology, rollout |
| **`network-infra-pro`** | Segmentation, DNS, TLS path | SSRF/lateral-movement narrative | VPC/firewall specifics |

**Handoff:** **`security-pro`** states **invariants and threats**; stack skills implement **wiring** without duplicating threat rationale.
