# Skill: verl-rl-training
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for training LLMs with reinforcement learning using verl (Volcano Engine RL). Use when implementing RLHF, GRPO, PPO, or other RL algorithms for LLM post-training at scale with flexib",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155384,
  "model": "qwen3:8b",
  "name": "verl-rl-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/verl/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "distributed training",
    "grpo",
    "post-training",
    "ppo",
    "reinforcement learning",
    "rlhf"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for training LLMs with reinforcement learning using verl (Volcano Engine RL). Use when implementing RLHF, GRPO, PPO, or other RL algorithms for LLM post-training at scale with flexible infrastructure backends.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Option 1: pip install
pip install verl[vllm]  # or verl[sglang] for SGLang backend

# Option 2: Docker (recommended for production)
docker pull verlai/verl:vllm011.latest

# Option 3: From source
git clone https://github.com/volcengine/verl.git
cd verl && pip install -e .[vllm,math]
- python3 -m verl.trainer.main_ppo \
    algorithm.adv_estimator=grpo \
    data.train_files=~/data/gsm8k/train.parquet \
    actor_rollout_ref.model.path=Qwen/Qwen2.5-7B \
    actor_rollout_ref.rollout.n=8 \
    actor_rollout_ref.actor.use_kl_loss=True \
    trainer.n_gpus_per_node=8
- ┌─────────────────────────────────────────────────────────┐
│ Single-Process Controller (Ray)                         │
│ - Orchestrates: rollout → reward → train → sync        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│ Multi-Process Workers                                   │
│ ├── ActorRolloutRefWorker (policy + generation)        │
│ ├── CriticWorker (value estimation, PPO only)          │
│ └── RewardManager (model-based or rule-based rewards)  │
└─────────────────────────────────────────────────────────┘

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/verl/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# verl: Volcano Engine Reinforcement Learning for LLMs verl is a flexible, efficient, and production-ready RL training library for large language models from ByteDance's Seed team. It implements the HybridFlow framework (EuroSys 2025) and powers models like Doubao-1.5-pro achieving O1-level performance on math benchmarks. ## When to Use verl **Choose verl when you need:** - Production-ready RL training at scale (tested up to 671B parameters) - Flexibility to swap backends (FSDP ↔ Megatron-LM ↔ vLLM ↔ SGLang) - Support for multiple RL algorithms (PPO, GRPO, RLOO, REINFORCE++, DAPO) - Multi-turn rollout with tool calling for agentic workflows - Vision-language model RL training **Consider alternatives when:** - You need Megatron-native training → use **slime** or **miles** - You want PyTorch

{{input}}
