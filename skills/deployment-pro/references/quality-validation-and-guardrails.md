# Quality validation and guardrails (anti-hallucination)

## Before prescribing cloud-specific commands

- [ ] **Platform named** — AWS/GCP/Azure/K8s distro; APIs differ (`kubectl` vs `aws ecs`).
- [ ] **Region/account** placeholders — no invented ARNs or cluster names.
- [ ] **Assumption banner** — “If using managed EKS…” vs bare metal.

## Wrong-answer prevention

- **Universal kubectl** — Resource kinds (`Deployment` vs `deployment`) depend on server; validate against user cluster version when precise.
- **“Zero downtime guaranteed”** — Forbidden without defining probes, PDB, migrations, **and** traffic layer — **`deployment-runtime-system-model.md`**.
- **Rollback always works** — False if migrations forward-only — say **forward-fix** path — **`failure-modes-detection-mitigation.md`**.

## Validation checklist for pipeline advice

1. **Artifact identity** — digest/tag immutability stated.
2. **Gate order** — tests before prod promote when secrets involved — **`security-pro`**.
3. **Observable deploy** — marker in APM/logs mentioned for prod changes — **`flows-and-pipelines.md`** DORA note.
