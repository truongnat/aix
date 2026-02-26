# Skill: slime-rl-training
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for LLM post-training with RL using slime, a Megatron+SGLang framework. Use when training GLM models, implementing custom data generation workflows, or needing tight Megatron-LM inte",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155381,
  "model": "qwen3:8b",
  "name": "slime-rl-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/slime/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "glm",
    "grpo",
    "megatron-lm",
    "post-training",
    "reinforcement learning",
    "sglang"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for LLM post-training with RL using slime, a Megatron+SGLang framework. Use when training GLM models, implementing custom data generation workflows, or needing tight Megatron-LM integration for RL scaling.

## When to Use
- Use when the task matches this skill domain.

## Examples
- ┌─────────────────────────────────────────────────────────┐
│                    Data Buffer                          │
│ - Prompt initialization and management                  │
│ - Custom data generation and filtering                  │
│ - Rollout sample storage                                │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
┌─────────────▼───────────┐ ┌─────────────▼───────────────┐
│ Training (Megatron-LM)  │ │ Rollout (SGLang + Router)   │
│ - Actor model training  │ │ - Response generation       │
│ - Critic (optional)     │ │ - Reward/verifier output    │
│ - Weight sync to rollout│ │ - Multi-turn support        │
└─────────────────────────┘ └─────────────────────────────┘
- # Recommended: Docker
docker pull slimerl/slime:latest
docker run --rm --gpus all --ipc=host --shm-size=16g \
  -it slimerl/slime:latest /bin/bash

# Inside container
cd /root/slime && pip install -e . --no-deps
- git clone https://github.com/THUDM/slime.git
cd slime
pip install -r requirements.txt
pip install -e .

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/slime/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# slime: LLM Post-Training Framework for RL Scaling slime is an LLM post-training framework from Tsinghua's THUDM team, powering GLM-4.5, GLM-4.6, and GLM-4.7. It connects Megatron-LM for training with SGLang for high-throughput rollout generation. ## When to Use slime **Choose slime when you need:** - Megatron-LM native training with SGLang inference - Custom data generation workflows with flexible data buffers - Training GLM, Qwen3, DeepSeek V3, or Llama 3 models - Research-grade framework with production backing (Z.ai) **Consider alternatives when:** - You need enterprise-grade stability features → use **miles** - You want flexible backend swapping → use **verl** - You need PyTorch-native abstractions → use **torchforge** ## Key Features - **Training**: Megatron-LM with full parallelism

{{input}}
