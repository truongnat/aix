# CI/CD — Deployment strategies

## Blue-Green

Two identical production environments; switch at load balancer level.

```
Traffic: 100% → Blue (current)
Deploy: new version to Green
Smoke test Green
Switch: 100% → Green
Keep Blue for rollback window (15-60 min)
```

**Pros:** Instant rollback; no downtime.
**Cons:** 2× infrastructure cost during switch.

```yaml
- name: Deploy to green
  run: |
    kubectl set image deployment/app-green app=$IMAGE
    kubectl rollout status deployment/app-green

- name: Switch traffic
  run: |
    kubectl patch service app-lb -p '{"spec":{"selector":{"slot":"green"}}}'

- name: Keep blue for rollback
  run: echo "Blue kept alive for 30 minutes"
```

## Canary

Route small % of traffic to new version; monitor; expand or rollback.

```
10% → v2 (canary)   |  90% → v1 (stable)
Wait 10 min + check error rate
25% → v2            |  75% → v1
Wait + check
100% → v2 (if healthy)
```

**Pros:** Low blast radius; real traffic testing.
**Cons:** More complex routing; need observability.

## Rolling update (Kubernetes default)

```yaml
# deployment.yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1         # 1 extra pod during rollout
      maxUnavailable: 0   # never take pods offline
```

## Feature flags (decouple deploy from release)

```ts
// LaunchDarkly / Unleash / home-grown
if (featureFlags.isEnabled('new-checkout', userId)) {
  return newCheckoutFlow();
} else {
  return legacyCheckoutFlow();
}
```

Deploy code with flag off → enable for % of users → full rollout → remove old code.

## Manual approval gate in GitHub Actions

```yaml
deploy-prod:
  needs: deploy-staging
  environment:
    name: production      # requires reviewer configured in repo settings
  runs-on: ubuntu-latest
  steps:
    - name: Deploy
      run: ./scripts/deploy.sh production
```

## Rollback strategies

| Strategy | Command | Speed |
|----------|---------|-------|
| Redeploy previous tag | `git revert + push` | Slow (full pipeline) |
| Kubernetes rollout | `kubectl rollout undo deployment/app` | Fast |
| Blue-green switch back | Flip LB selector | Instant |
| Feature flag off | Toggle flag | Instant |
