# Terraform vs Pulumi — Decision Framework

## When to choose Terraform (HCL)

| Signal | Rationale |
|--------|-----------|
| Team already uses HCL | No migration cost |
| Multi-cloud (AWS + GCP + Azure) | Terraform has the widest provider ecosystem |
| Strong module marketplace needed | Terraform Registry has 10k+ verified modules |
| Non-developer operators (SRE/Ops) | HCL is readable without programming background |
| Compliance tooling (Sentinel, OPA) | Mature `conftest` + Terraform Cloud integration |

## When to choose Pulumi

| Signal | Rationale |
|--------|-----------|
| Team prefers TypeScript / Python / Go | Write infra in familiar language; IDE completion |
| Complex conditionals or loops | HCL `for_each` / `dynamic` blocks have sharp edges; Pulumi uses real loops |
| Native SDK testing | Use Jest / pytest to test Pulumi stacks in-process |
| Kubernetes-heavy workloads | Pulumi Kubernetes provider is more ergonomic than Helm + Terraform |
| Secrets management baked in | Pulumi has built-in secret config (`pulumi config set --secret`) |

## Migration path (Terraform → Pulumi)

1. Run `pulumi convert --from terraform` on existing `.tf` files.
2. Review generated TypeScript/Python; fix any `TODO` comments.
3. Import existing state with `pulumi import`.
4. Keep Terraform for resources not yet migrated; both can coexist.

## Anti-patterns to avoid

- **Mixing Terraform and Pulumi for the same resource** — dual-manage creates state conflicts.
- **Using CDK-tf without clear reason** — adds a compilation step with marginal benefit over vanilla HCL.
- **Switching tools for a single project** — migration cost usually outweighs benefits unless on greenfield.
