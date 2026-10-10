# Testing IaC — Terratest, OPA, and CI Gates

## Testing pyramid for IaC

```
         ┌─────────────────────┐
         │  Policy (OPA/Sentinel) │  ← cheapest; catches compliance violations pre-apply
         ├─────────────────────┤
         │  Integration (Terratest) │  ← real cloud resources; slow but authoritative
         ├─────────────────────┤
         │  Unit (validate + tflint) │  ← fast; syntax and lint only
         └─────────────────────┘
```

## Unit tests (fast, no cloud)

Run on every commit:
```bash
terraform fmt -check -recursive
terraform validate
tflint --recursive
```

Tools:
- **tflint** — catches deprecated syntax, missing required attributes, wrong variable types.
- **checkov** / **tfsec** — static security analysis (open ports, unencrypted storage).

## Policy-as-code (OPA / Sentinel)

Run before `apply` in CI:

**OPA + conftest:**
```bash
conftest test --policy policies/ plan.json
```

Example policy (deny public S3 bucket):
```rego
package terraform.aws.s3

deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket_acl"
  resource.change.after.acl == "public-read"
  msg := sprintf("S3 bucket %v must not be public", [resource.address])
}
```

**Sentinel** (Terraform Cloud/Enterprise):
```hcl
import "tfplan/v2" as tfplan
main = rule { all tfplan.resource_changes as _, rc {
  rc.type is not "aws_s3_bucket" or rc.change.after.acl is not "public-read"
}}
```

## Integration tests (Terratest)

Spin up real resources, assert, tear down:
```go
func TestVpcModule(t *testing.T) {
  opts := &terraform.Options{TerraformDir: "../modules/vpc", Vars: map[string]interface{}{"name": "test"}}
  defer terraform.Destroy(t, opts)
  terraform.InitAndApply(t, opts)
  vpcId := terraform.Output(t, opts, "vpc_id")
  assert.NotEmpty(t, vpcId)
}
```

Best practices:
- Use unique resource names (`fmt.Sprintf("test-%s", random.UniqueId())`).
- Always `defer Destroy` — leaked resources cost money.
- Run in isolated AWS account / GCP project.
- Parallelise with `t.Parallel()` where resources don't conflict.
- Cache `terraform init` artifacts in CI to speed up.

## CI pipeline gates

```yaml
# GitHub Actions example
- name: Terraform validate
  run: terraform validate

- name: tflint
  run: tflint --recursive

- name: OPA policy check
  run: conftest test --policy policies/ plan.json

- name: Terraform plan (PR gate)
  run: terraform plan -out=tfplan
  # Post plan output as PR comment

- name: Manual approval (prod only)
  uses: trstringer/manual-approval@v1

- name: Terraform apply
  run: terraform apply tfplan
  if: github.ref == 'refs/heads/main'
```

## Cost estimation

- **Infracost** (`infracost diff --path .`) — attach cost diff to every PR.
- Block merges when monthly cost increase exceeds threshold.
