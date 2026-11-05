# State Management — Patterns and Safety Rules

## Remote state backends

| Backend | When to use | Lock mechanism |
|---------|-------------|----------------|
| **S3 + DynamoDB** | AWS-native teams | DynamoDB `LockID` table |
| **GCS** | GCP-native teams | GCS object locks |
| **Terraform Cloud / HCP Terraform** | Multi-team, audit trail needed | Built-in |
| **Azure Blob Storage** | Azure-native teams | Blob lease |
| **Local** | Solo dev / ephemeral only | No lock — dangerous for teams |

## State isolation strategy

```
envs/
├── dev/
│   └── terraform.tfstate  ← isolated; dev experiments don't touch prod
├── staging/
│   └── terraform.tfstate
└── prod/
    └── terraform.tfstate
```

Never share state files across environments. Use workspace-per-env or directory-per-env (directory-per-env preferred — clearer isolation).

**Terraform workspaces vs directories:**
- Workspaces: same backend, different state key. Risk: easy to `terraform apply` to wrong workspace.
- Directories: separate backend config per env. Preferred for prod isolation.

## Safe state operations

| Operation | Command | Risk |
|-----------|---------|------|
| Move resource in state | `terraform state mv old.addr new.addr` | Low if addresses correct |
| Remove resource from state (don't destroy) | `terraform state rm addr` | Medium — resource becomes unmanaged |
| Import existing resource | `terraform import addr resource_id` | Low |
| List state | `terraform state list` | Read-only |
| Manual edit | `terraform state push` (after `pull` + edit) | **High — avoid** |

**Never:** `terraform state push` a hand-edited state file unless absolutely necessary. Prefer `state mv` and `import`.

## Drift detection

Run `terraform plan` on a schedule (daily/weekly in CI) with no pending changes. Any diff = drift. Alert on:
- Unexpected resource modifications (attribute changes outside IaC).
- Unexpectedly missing resources (manual deletes).

Respond to drift by either:
1. Importing the drift into state (`terraform import`).
2. Removing the drift (manual change was wrong; let Terraform restore).
3. Updating IaC to reflect the intentional change.

## State locking failures

If a lock is stuck (process killed mid-apply):
```bash
terraform force-unlock <LOCK_ID>
```
Verify no concurrent apply is actually running before forcing unlock.
