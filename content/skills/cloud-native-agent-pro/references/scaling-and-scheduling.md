# Scaling and Scheduling

## Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: support-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: support-agent
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: request_queue_depth
      target:
        type: AverageValue
        averageValue: "10"
```

## Cluster Autoscaler

- Scales node pool based on pending pod scheduling failures.
- Essential for bursty agent workloads.

## Volcano / AgentCube

- Batch scheduling for agent workloads with gang scheduling (all-or-nothing).
- Priority and preemption for critical agent tasks.
- Queue-based scheduling for fair resource sharing.

## Resource quotas

- Namespace-level quotas for multi-tenant agent platforms.
- Prevent one tenant's agents from starving others.
