# Cloud-Native Agent Decision Tree

```
What is the scale?
├── Single instance → K8s Deployment, no operator
├── Multiple instances → Deployment + HPA
└── Large fleet → Kagent / AgentCube operator

What is the workload type?
├── Long-running service → Deployment
├── Batch job → Job / CronJob
├── Node-level collector → DaemonSet
└── Stateful service → StatefulSet

What is the inference target?
├── Cloud GPU → Standard container with CUDA
├── Edge / limited resources → Wasm module
└── Mixed → Container for cloud, Wasm for edge

Observability requirements?
├── Basic → Prometheus + Grafana
├── Deep tracing → + Jaeger / Zipkin
├── Kernel-level → + eBPF (Pixie, Tetragon)
```
