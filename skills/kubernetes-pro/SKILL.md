---
name: kubernetes-pro
description: Expert Kubernetes (K8s) orchestration covering manifests, Helm, Kustomize, security, networking, and cluster management.
metadata:
  short-description: Kubernetes — K8s, Helm, Kustomize, RBAC, Networking, GitOps
  content-language: en
  domain: cloud
  level: professional
---

# Kubernetes Pro

Expert-level orchestration of containerized workloads. Focuses on scalability, reliability, and automated operations (GitOps).

## Boundary

**`kubernetes-pro`** covers K8s core objects (Pods, Deployments, Services, Ingress, ConfigMaps), manifest management (Helm, Kustomize), security (RBAC, NetworkPolicies), and cluster operations. It does NOT cover infrastructure provisioning (use `aws-pro` or `terraform-pro` for that).

## When to use

- Designing a scalable deployment strategy (Canary, Blue/Green) on K8s.
- Writing Helm charts for complex applications.
- Hardening K8s security through RBAC and Pod Security Standards.
- Troubleshooting container connectivity or resource issues in a cluster.

## Workflow

1. **Architecture Planning**: Define resource requirements and scaling policies.
2. **Manifest Definition**: Write K8s YAML or Helm templates.
3. **Security Configuration**: Define RBAC roles and service accounts.
4. **Networking**: Set up Services, Ingress, and NetworkPolicies.
5. **Deployment**: Apply manifests to the cluster and verify health.
6. **Observation**: Monitor Pod health and logs.

### Operating principles

- **Declarative over Imperative**: Always use YAML/Helm; never use `kubectl run` or `edit` in production.
- **Immutable Infrastructure**: Containers and manifests should be immutable once deployed.
- **Observability is Key**: If it's not monitored, it's not running.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Kubernetes Platform Engineer.
</Role>

<Strategy>
[Deployment or configuration strategy description]
</Strategy>

<Implementation>
[K8s YAML or Helm Chart Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan: kubectl commands]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Kubernetes Roadmap | [roadmap.sh/kubernetes](https://roadmap.sh/kubernetes) |
| K8s Documentation | [kubernetes.io/docs](https://kubernetes.io/docs/home/) |
| Helm Docs | [helm.sh/docs](https://helm.sh/docs/) |
| K8s Security Best Practices | [kubernetes.io/docs/concepts/security](https://kubernetes.io/docs/concepts/security/) |

## Quick example

**Feature:** Deployment with horizontal pod autoscaler.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: app:v1
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Resource limits and scaling strategy defined.
- [ ] **Simplicity First**: Plain YAML used unless complexity warrants Helm/Kustomize.
- [ ] **Surgical Changes**: Only updated necessary K8s manifests.
- [ ] **Goal-Driven Execution**: Verified Pod readiness and service connectivity.
- [ ] Resource limits and requests configured for all containers.
- [ ] Liveness and Readiness probes implemented.
- [ ] RBAC policies follow the principle of least privilege.
