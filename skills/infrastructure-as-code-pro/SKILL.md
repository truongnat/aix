---
name: infrastructure-as-code-pro
description: |
  Infrastructure-as-Code: Terraform and Pulumi module design, state management, workspace strategy, drift detection, policy-as-code, and testing (Terratest, OPA). Covers AWS/GCP/Azure provider patterns, remote state backends (S3+DynamoDB, GCS, Terraform Cloud), secret injection, and CI/CD pipeline integration (GitHub Actions, GitLab CI).

  Use this skill when the user works on Terraform (.tf files, modules, workspaces, state), Pulumi (TypeScript/Python stacks, component resources), cloud provisioning (AWS, GCP, Azure), infrastructure testing, IaC CI/CD pipelines, policy-as-code (OPA, Sentinel), or asks about drift detection, state locking, or infra rollback.

  Triggers: "Terraform", "Pulumi", "IaC", "infrastructure as code", "tf files", "tfstate", "terraform plan", "terraform apply", "terraform destroy", "modules", "workspaces", "remote state", "S3 backend", "DynamoDB lock", "drift", "OPA", "Sentinel", "Terratest", "CDK", "CloudFormation", "Bicep", "infra provisioning", "resource lifecycle", "state lock", "state migration".

  Combine with **`ci-cd-pro`** for IaC pipelines, **`security-pro`** for secret injection and least-privilege IAM, **`docker-pro`** for containerised infra, and **`deployment-pro`** for release strategies.

metadata:
  short-description: Terraform & Pulumi — modules, state, workspaces, policy, testing, CI/CD
  content-language: en
  domain: devops
  level: professional
---

# Infrastructure-as-Code (professional)

Skill text is **English**; answer in the user's preferred language when the conversation specifies it.

Use official [Terraform docs](https://developer.hashicorp.com/terraform) and [Pulumi docs](https://www.pulumi.com/docs/) for API truth. This skill encodes **module design discipline**, **state management safety**, **workspace strategy**, and **testing rigor** — not cloud-provider-specific resource syntax (combine with provider docs).

Confirm **IaC tool** (Terraform version, Pulumi SDK language), **cloud provider** (AWS/GCP/Azure/multi), and **team context** (solo vs team, CI/CD present, existing state backend) when known.

## Boundary

**`infrastructure-as-code-pro`** owns **IaC authoring, state management, testing, and CI/CD integration**. **`ci-cd-pro`** owns pipeline configuration beyond IaC steps. **`deployment-pro`** owns release strategies (blue/green, canary). **`security-pro`** owns IAM and secret hygiene. **`docker-pro`** owns container images and Compose.

## Related skills

| Skill | When to combine |
|-------|----------------|
| **`ci-cd-pro`** | Pipeline configuration for `terraform plan` / `apply` gates |
| **`security-pro`** | Least-privilege IAM, secret injection, SAST on IaC |
| **`deployment-pro`** | Blue/green and canary strategies for infra changes |
| **`docker-pro`** | Container registries and ECS/GKE infra |
| **`systematic-debugging-pro`** | Root-cause IaC failures and state corruption |

## When to use

- Authoring or reviewing Terraform, Pulumi, or adjacent IaC changes.
- Designing modules, remote state layout, workspaces/stacks, or policy-as-code.
- Validating `plan` / `preview` diffs, drift handling, and IaC CI/CD gates.
- Investigating infra provisioning changes that need predictable, auditable rollout.

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** IaC tool + version, cloud provider, state backend, team size → verify: [tool detected; provider confirmed].
2. **Think Before Coding** — read existing `.tf` / Pulumi files; ask only when module boundaries or state layout are ambiguous.
3. **Simplicity First** — minimum module that solves the problem; no speculative outputs or variables.
4. **Surgical Changes** — only touch resources directly related to the request; no unrelated refactors.
5. **Goal-Driven Execution** — `terraform plan` or `pulumi preview` output must match intent; loop until diff is clean.
6. **Respond** using Suggested response format.

### Operating principles

1. **Think Before Coding** — run `terraform validate` / `pulumi preview --diff` before claiming a change is safe. State assumptions about existing resources.
2. **Simplicity First** — flat module first; split into child modules only when reuse is confirmed. No dynamic blocks unless conditionals are genuinely needed.
3. **Surgical Changes** — a change to one module must not touch another module's state. Use `target` only for emergencies, not routine use.
4. **Goal-Driven Execution** — done = `plan` output shows only the intended diff and no unexpected destroys.

### Decision: Terraform vs Pulumi

Details: [references/terraform-vs-pulumi.md](references/terraform-vs-pulumi.md)

**Default recommendation:**
- **Terraform** — team already uses HCL, multi-cloud, strong community modules needed.
- **Pulumi** — team prefers TypeScript/Python, needs loops/conditions beyond HCL, wants native SDK testing.

### State management rules

Details: [references/state-management.md](references/state-management.md)

- **Always use remote state** for team environments (S3+DynamoDB, GCS, Terraform Cloud).
- **One state file per environment** (dev / staging / prod); never share state across envs.
- **Never edit state manually** — use `terraform state mv`, `rm`, `import`.
- **State locking** must be enabled; `DynamoDB` lock table or Terraform Cloud mandatory for CI.

### Module design

Details: [references/terraform-patterns.md](references/terraform-patterns.md)

- Module interface = inputs (`variables.tf`) + outputs (`outputs.tf`) + no hardcoded values.
- Deep modules: hide complexity behind a stable, minimal interface.
- Versioned modules via Git tags (`?ref=v1.2.0`); never `?ref=main` in production.

### Testing IaC

Details: [references/testing-iac.md](references/testing-iac.md)

- Unit: `terraform validate` + `terraform fmt -check` + `tflint` on every PR.
- Integration: Terratest (Go) spins up real resources and asserts outputs; tear down after.
- Policy: OPA (`conftest`) or Sentinel for compliance gates before `apply`.

## Suggested response format

1. **Context** — IaC tool, provider, current state layout.
2. **Recommendation** — module design or change with rationale.
3. **Code** — `.tf` / Pulumi snippet with only the required change.
4. **Plan diff** — expected `terraform plan` / `pulumi preview` output shape.
5. **Residual risks** — unintended destroys, drift sources, state lock concerns.

## Resources in this skill

| Topic | File |
|-------|------|
| Terraform vs Pulumi decision | [references/terraform-vs-pulumi.md](references/terraform-vs-pulumi.md) |
| State management patterns | [references/state-management.md](references/state-management.md) |
| Terraform module patterns | [references/terraform-patterns.md](references/terraform-patterns.md) |
| Testing IaC (Terratest, OPA) | [references/testing-iac.md](references/testing-iac.md) |

## Quick example

### 1 — Simple (Think + Simplicity)

**Input:** "Add an S3 bucket for uploads"
- **Ask:** Which environment? Versioning needed? Public access? Encryption?
- **Minimum:** `aws_s3_bucket` + `aws_s3_bucket_server_side_encryption_configuration` + `aws_s3_bucket_public_access_block`. No lifecycle rules unless requested.
- **Verify:** `terraform plan` shows 3 resources to add, 0 to destroy.

### 2 — Tricky (Surgical Changes)

**Input:** "Rename the `web_sg` security group"
- Renaming a resource forces destroy+create; warn user explicitly.
- Use `terraform state mv` to rename in state without destroying, then rename in `.tf`.
- Only touch the security group resource; don't refactor adjacent VPC resources.
- **Verify:** `terraform plan` shows 0 destroys after `state mv`.

### 3 — Cross-skill (Goal-Driven)

**Input:** "Set up IaC pipeline in CI"
- **Plan:**
  1. Add Terraform backend config → verify: [remote state accessible from CI]
  2. Add `terraform plan` step on PR → verify: [plan output in PR comment]
  3. Add `terraform apply` step on merge to main, gated by manual approval → verify: [apply runs only on main]
  4. Add OPA policy check before apply → verify: [policy violations block merge]
- Pair with **`ci-cd-pro`** for pipeline YAML.

## Checklist before calling the skill done

- [ ] Confirmed IaC tool version and state backend before writing any code (Think Before Coding)
- [ ] Started with minimum module; no speculative variables or outputs (Simplicity First)
- [ ] Only touched resources directly related to the request (Surgical Changes)
- [ ] `terraform plan` / `pulumi preview` output matches intent; no unexpected destroys (Goal-Driven Execution)
- [ ] Remote state configured for any team environment
- [ ] State locking enabled
- [ ] Module interface documented (inputs, outputs, no hardcoded values)
