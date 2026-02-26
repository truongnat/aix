# Skill: tensorrt-llm
Schema: antigrav.skill@v1

```json
{
  "description": "Optimizes LLM inference with NVIDIA TensorRT for maximum throughput and lowest latency. Use for production deployment on NVIDIA GPUs (A100/H100), when you need 10-100x faster inference than PyTorch, o",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155429,
  "model": "qwen3:8b",
  "name": "tensorrt-llm",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "12-inference-serving/tensorrt-llm/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "fp8",
    "high throughput",
    "in-flight batching",
    "inference optimization",
    "inference serving",
    "int4",
    "low latency",
    "multi-gpu",
    "nvidia",
    "production",
    "tensorrt-llm"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Optimizes LLM inference with NVIDIA TensorRT for maximum throughput and lowest latency. Use for production deployment on NVIDIA GPUs (A100/H100), when you need 10-100x faster inference than PyTorch, or for serving models with quantization (FP8/INT4), in-flight batching, and multi-GPU scaling.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Docker (recommended)
docker pull nvidia/tensorrt_llm:latest

# pip install
pip install tensorrt_llm==1.2.0rc3

# Requires CUDA 13.0.0, TensorRT 10.13.2, Python 3.10-3.12
- from tensorrt_llm import LLM, SamplingParams

# Initialize model
llm = LLM(model="meta-llama/Meta-Llama-3-8B")

# Configure sampling
sampling_params = SamplingParams(
    max_tokens=100,
    temperature=0.7,
    top_p=0.9
)

# Generate
prompts = ["Explain quantum computing"]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.text)
- # Start server (automatic model download and compilation)
trtllm-serve meta-llama/Meta-Llama-3-8B \
    --tp_size 4 \              # Tensor parallelism (4 GPUs)
    --max_batch_size 256 \
    --max_num_tokens 4096

# Client request
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Meta-Llama-3-8B",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 100
  }'

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `12-inference-serving/tensorrt-llm/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# TensorRT-LLM NVIDIA's open-source library for optimizing LLM inference with state-of-the-art performance on NVIDIA GPUs. ## When to use TensorRT-LLM **Use TensorRT-LLM when:** - Deploying on NVIDIA GPUs (A100, H100, GB200) - Need maximum throughput (24,000+ tokens/sec on Llama 3) - Require low latency for real-time applications - Working with quantized models (FP8, INT4, FP4) - Scaling across multiple GPUs or nodes **Use vLLM instead when:** - Need simpler setup and Python-first API - Want PagedAttention without TensorRT compilation - Working with AMD GPUs or non-NVIDIA hardware **Use llama.cpp instead when:** - Deploying on CPU or Apple Silicon - Need edge deployment without NVIDIA GPUs - Want simpler GGUF quantization format ## Quick start ### Installation ```bash # Docker (recommended

{{input}}
