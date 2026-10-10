# Cloud-Native Agent Anti-patterns

## 1. Stateful agents without external state

**Symptom**: Agent stores session in local memory; loses state on restart.
**Fix**: Use Redis, Postgres, or S3 for external state. Keep agents stateless.

## 2. No resource limits

**Symptom**: Agent pod consumes all node memory, causing OOM kills.
**Fix**: Always define `resources.requests` and `resources.limits`.

## 3. Missing health checks

**Symptom**: K8s sends traffic to crashed agent pods.
**Fix**: Implement liveness and readiness probes.

## 4. Deploying without observability

**Symptom**: Agent fails in production with no logs or metrics.
**Fix**: Deploy Prometheus, Grafana, and Jaeger before the agent.

## 5. Tight coupling to a single node

**Symptom**: Agent assumes local filesystem or GPU on specific node.
**Fix**: Use shared storage (PVC, S3) or node selectors with DaemonSet.
