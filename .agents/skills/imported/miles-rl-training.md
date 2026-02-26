# Skill: miles-rl-training
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for enterprise-grade RL training using miles, a production-ready fork of slime. Use when training large MoE models with FP8/INT4, needing train-inference alignment, or requiring spec",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155377,
  "model": "qwen3:8b",
  "name": "miles-rl-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/miles/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "enterprise",
    "fp8",
    "int4",
    "megatron-lm",
    "moe",
    "reinforcement learning",
    "sglang"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for enterprise-grade RL training using miles, a production-ready fork of slime. Use when training large MoE models with FP8/INT4, needing train-inference alignment, or requiring speculative RL for maximum throughput.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Recommended: Docker
docker pull radixark/miles:latest
docker run --rm --gpus all --ipc=host --shm-size=16g \
  -it radixark/miles:latest /bin/bash

# From source
git clone https://github.com/radixark/miles.git
cd miles
pip install -r requirements.txt
pip install -e .
- python train.py \
    --advantage-estimator grpo \
    --model-name qwen3-30b-a3b \
    --hf-checkpoint /path/to/qwen3-30b-a3b-hf \
    --rollout-batch-size 512 \
    --n-samples-per-prompt 8
- # FP8 block scaling (recommended for stability)
export NVTE_FP8_BLOCK_SCALING_FP32_SCALES=1
export CUDA_DEVICE_MAX_CONNECTIONS=1

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/miles/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# miles: Enterprise-Grade RL for Large-Scale Model Training miles is a high-performance, enterprise-ready RL framework optimized for large-scale model post-training. Built as a production fork of slime, it addresses critical challenges in MoE training stability, low-precision training, and train-inference alignment. ## When to Use miles **Choose miles when you need:** - Training 1TB+ MoE models (DeepSeek V3, Qwen3-MoE) - FP8 or INT4 quantization-aware training - Bit-wise identical train-inference alignment - Speculative RL for maximum throughput - Production stability with enterprise support **Consider alternatives when:** - You want the research-grade original → use **slime** - You need flexible backend swapping → use **verl** - You want PyTorch-native abstractions → use **torchforge** ##

{{input}}
