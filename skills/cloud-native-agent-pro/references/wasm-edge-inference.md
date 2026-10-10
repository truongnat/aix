# Wasm Edge Inference

## Why Wasm for agents

- **Lightweight**: 100x smaller than containers.
- **Fast cold start**: milliseconds vs. seconds for containers.
- **Secure**: Capability-based sandboxing.
- **Portable**: Run on x86, ARM, and embedded devices.

## Runtimes

- **Wasmtime**: Fast, spec-compliant, good for production.
- **WasmEdge**: Cloud-native features (containerd shim, Kubernetes integration).
- **WASI-NN**: Neural network inference inside Wasm modules.

## Use cases

- Edge nodes with limited resources (128MB RAM).
- IoT devices with local inference.
- Serverless functions with fast cold starts.
- Browser-based agents (WASM in the browser).

## Limitations

- Limited standard library compared to containers.
- No direct GPU access (WASI-NN abstracts this).
- Debugging is harder than traditional containers.
