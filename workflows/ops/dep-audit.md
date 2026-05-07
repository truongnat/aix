# Workflow: dep-audit

**Dependency and supply-chain audit** of manifests and lockfiles: known vulnerabilities, upgrade risk, license posture, and build integrity.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `dep-audit.md`.

**Invoke:** `/dep-audit`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `dep-audit` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `manifest_paths` | Yes | e.g. `package.json`, `pnpm-lock.yaml`, `requirements.txt`, `go.mod` |
| `audit_goal` | No | e.g. "pre-release", "SLSA posture", "license compliance" |
| `ecosystem` | No | npm, pnpm, pip, cargo, go modules, … |

## Outputs

| Variable | Description |
|----------|-------------|
| `findings` | Severity-ranked: vulns, risky packages, outdated critical deps |
| `remediation_plan` | Order: critical patches → upgrades → removals |
| `residual_risk` | Unfixable transitive issues; compensating controls |

## Decision paths

- **No lockfile:** Treat as **high process risk**; recommend lockfile + reproducible CI before deep audit.
- **Monorepo:** Audit per package or workspace; flag shared hoisting surprises.
- **GitHub / npm ecosystem:** Prefer `npm audit` / OSV / Dependabot signals; triage noise vs real reachability.

## Error handling

- **Scanner unavailable:** Fall back to manual review of direct deps + known CVE lists; state tool gap.
- **False positive flood:** Group by package; prioritize reachable paths from app entrypoints.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** (🔴🟡🟠🟢 for findings).  
Final artifact SHOULD align with **[`templates/report/dependency-audit.md`](../../templates/report/dependency-audit.md)**.  
Align narrative with **`prompts/analysis/dependency-audit.md`** when used as a companion prompt.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single app, recent lockfile | < 1 h |
| **Standard** | Multi-package or quarterly review | 4–8 h |
| **Deep** | SBOM + license + build provenance | > 2 days |

## Escalation

- **Human:** License legal review, vendor exceptions, breaking major upgrades.
- **Autonomous:** Triage list, patch PRs, CI gate suggestions.

## Steps

### Step 1 — `inventory`

- **Type:** skill
- **Skill:** `repo-tooling-pro`
- **Input:** `manifest_paths`, repo layout
- **Output:** Direct vs transitive picture; lockfile presence; duplicate ecosystems.

### Step 2 — `vulnerability-pass`

- **Type:** skill
- **Skill:** `security-pro` + `ci-cd-pro`
- **Input:** Ecosystem tools available (audit, osv-scanner, etc.)
- **Output:** CVE list with **reachable** vs **theoretical** notes where possible.

### Step 3 — `upgrade-and-risk`

- **Type:** skill
- **Skill:** `planning-pro` + domain `*-pro` (breaking API changes in frameworks)
- **Input:** Top offenders from Step 2
- **Output:** Upgrade sequencing; test requirements per bump.

### Step 4 — `licenses-and-integrity`

- **Type:** skill
- **Skill:** `code-packaging-pro` + `security-pro`
- **Input:** Org policy if stated
- **Output:** License conflicts; integrity (lockfile, checksums, signed releases).

### Step 5 — `synthesize`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Steps 1–4
- **Output:** `findings`, `remediation_plan`, `residual_risk`.

## Notes

- Does **not** replace a formal penetration test; pairs with **`w-security-audit`** for app-level threats.
