# CI/CD — Secrets and security

## OIDC authentication (no long-lived keys)

### AWS

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
      aws-region: us-east-1
```

### GCP

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: google-github-actions/auth@v2
    with:
      workload_identity_provider: projects/123/locations/global/workloadIdentityPools/...
      service_account: github-actions@my-project.iam.gserviceaccount.com
```

## Scoping GITHUB_TOKEN permissions

```yaml
permissions:
  contents: read       # checkout
  packages: write      # push to GHCR
  pull-requests: write # comment on PRs
  id-token: write      # OIDC
```

Minimize to what the workflow actually needs.

## Dynamic secrets masking

```yaml
- name: Get secret from vault
  id: vault
  run: |
    SECRET=$(vault kv get -field=password secret/myapp)
    echo "::add-mask::$SECRET"
    echo "password=$SECRET" >> $GITHUB_OUTPUT
```

## Environment protection rules

Configure in repo Settings → Environments:
- **Required reviewers** — humans must approve before the job runs.
- **Wait timer** — delay before deployment (e.g., 5 min for canary observation).
- **Deployment branches** — restrict to `main` or tag patterns.

```yaml
jobs:
  deploy-prod:
    environment:
      name: production
      url: ${{ steps.deploy.outputs.url }}
```

## Pinning third-party actions

```yaml
# Bad — mutable tag
- uses: actions/checkout@v4

# Good — pinned SHA
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

Use `dependabot` or `Renovate` to keep pins up-to-date automatically.

## Supply chain: SLSA provenance

```yaml
- uses: slsa-framework/slsa-github-generator/.github/workflows/generator_generic_slsa3.yml@v2
  with:
    base64-subjects: ${{ needs.build.outputs.hashes }}
```
