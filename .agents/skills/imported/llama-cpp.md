# Skill: llama-cpp
Schema: antigrav.skill@v1

```json
{
  "description": "Runs LLM inference on CPU, Apple Silicon, and consumer GPUs without NVIDIA hardware. Use for edge deployment, M1/M2/M3 Macs, AMD/Intel GPUs, or when CUDA is unavailable. Supports GGUF quantization (1.",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155427,
  "model": "qwen3:8b",
  "name": "llama-cpp",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "12-inference-serving/llama-cpp/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "amd gpus",
    "apple silicon",
    "cpu inference",
    "edge deployment",
    "embedded",
    "gguf",
    "inference serving",
    "intel gpus",
    "llama.cpp",
    "non-nvidia",
    "quantization"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Runs LLM inference on CPU, Apple Silicon, and consumer GPUs without NVIDIA hardware. Use for edge deployment, M1/M2/M3 Macs, AMD/Intel GPUs, or when CUDA is unavailable. Supports GGUF quantization (1.5-8 bit) for reduced memory and 4-10× speedup vs PyTorch on CPU.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # macOS/Linux
brew install llama.cpp

# Or build from source
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# With Metal (Apple Silicon)
make LLAMA_METAL=1

# With CUDA (NVIDIA)
make LLAMA_CUDA=1

# With ROCm (AMD)
make LLAMA_HIP=1
- # Download from HuggingFace (GGUF format)
huggingface-cli download \
    TheBloke/Llama-2-7B-Chat-GGUF \
    llama-2-7b-chat.Q4_K_M.gguf \
    --local-dir models/

# Or convert from HuggingFace
python convert_hf_to_gguf.py models/llama-2-7b-chat/
- # Simple chat
./llama-cli \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    -p "Explain quantum computing" \
    -n 256  # Max tokens

# Interactive chat
./llama-cli \
    -m models/llama-2-7b-chat.Q4_K_M.gguf \
    --interactive

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `12-inference-serving/llama-cpp/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# llama.cpp Pure C/C++ LLM inference with minimal dependencies, optimized for CPUs and non-NVIDIA hardware. ## When to use llama.cpp **Use llama.cpp when:** - Running on CPU-only machines - Deploying on Apple Silicon (M1/M2/M3/M4) - Using AMD or Intel GPUs (no CUDA) - Edge deployment (Raspberry Pi, embedded systems) - Need simple deployment without Docker/Python **Use TensorRT-LLM instead when:** - Have NVIDIA GPUs (A100/H100) - Need maximum throughput (100K+ tok/s) - Running in datacenter with CUDA **Use vLLM instead when:** - Have NVIDIA GPUs - Need Python-first API - Want PagedAttention ## Quick start ### Installation ```bash # macOS/Linux brew install llama.cpp # Or build from source git clone https://github.com/ggerganov/llama.cpp cd llama.cpp make # With Metal (Apple Silicon) make LL

{{input}}
