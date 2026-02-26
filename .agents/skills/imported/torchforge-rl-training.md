# Skill: torchforge-rl-training
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for PyTorch-native agentic RL using torchforge, Meta's library separating infra from algorithms. Use when you want clean RL abstractions, easy algorithm experimentation, or scalable ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155382,
  "model": "qwen3:8b",
  "name": "torchforge-rl-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/torchforge/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "grpo",
    "meta",
    "monarch",
    "pytorch",
    "reinforcement learning",
    "sft",
    "torchtitan"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for PyTorch-native agentic RL using torchforge, Meta's library separating infra from algorithms. Use when you want clean RL abstractions, easy algorithm experimentation, or scalable training with Monarch and TorchTitan.

## When to Use
- Use when the task matches this skill domain.

## Examples
- ┌─────────────────────────────────────────────────────────┐
│ Application Layer (Your Code)                           │
│ - Define reward models, loss functions, sampling        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│ Forge API Layer                                         │
│ - Episode, Group dataclasses                           │
│ - Service interfaces (async/await)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│ Distributed Services (Monarch)                          │
│ ├── Trainer (TorchTitan FSDP)                          │
│ ├── Generator (vLLM inference)                          │
│ ├── Reference Model (frozen KL baseline)               │
│ └── Reward Actors (compute rewards)                    │
└─────────────────────────────────────────────────────────┘
- # Create environment
conda create -n forge python=3.12
conda activate forge

# Install (handles PyTorch nightly + dependencies)
./scripts/install.sh

# Verify
python -c "import torch, forge, vllm; print('OK')"
- ./scripts/install_rocm.sh

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/torchforge/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# torchforge: PyTorch-Native Agentic RL Library torchforge is Meta's PyTorch-native RL library that separates infrastructure concerns from algorithm concerns. It enables rapid RL research by letting you focus on algorithms while handling distributed training, inference, and weight sync automatically. ## When to Use torchforge **Choose torchforge when you need:** - Clean separation between RL algorithms and infrastructure - PyTorch-native abstractions (no Ray dependency) - Easy algorithm experimentation (GRPO, DAPO, SAPO in ~100 lines) - Scalable training with Monarch actor system - Integration with TorchTitan for model parallelism **Consider alternatives when:** - You need production-ready stability → use **miles** or **verl** - You want Megatron-native training → use **slime** - torchforg

{{input}}
