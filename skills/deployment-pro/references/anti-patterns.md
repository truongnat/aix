# Deployment — anti-patterns

## Build per environment

- Drift and “works on my machine” images.
- **Fix:** Build once; inject config per stage.

## Migrate-then-deploy without compatibility

- Downtime or failed rollbacks.
- **Fix:** Backward-compatible schema; two-phase deploy.

## No rollback rehearsed

- Panic during incident.
- **Fix:** Document previous good revision; automate rollback path.

## Long-lived CI secrets

- Leak and blast radius.
- **Fix:** OIDC, short TTL — **`security-pro`**.

## Declaring victory without observability

- Deploy “green” but errors spike unnoticed.
- **Fix:** Deploy markers + golden metrics + rollback triggers — **`failure-modes-detection-mitigation.md`**.
