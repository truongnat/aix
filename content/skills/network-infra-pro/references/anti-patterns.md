# Network infra — anti-patterns

## 0.0.0.0/0 on app SG

- Lateral movement on compromise.
- **Fix:** Least privilege; break-glass documented.

## TLS only at app, not at edge

- Inconsistent termination and cert sprawl.
- **Fix:** Single termination story; HSTS where appropriate.

## DNS change without TTL plan

- Long outage or split-brain perception.
- **Fix:** Lower TTL before cutover; monitor propagation.

## No flow logs / metrics on new path

- Blind during incident.
- **Fix:** Observability per layer — **`deployment-pro`** for rollout.
