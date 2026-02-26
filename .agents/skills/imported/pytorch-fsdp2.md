# Skill: pytorch-fsdp2
Schema: antigrav.skill@v1

```json
{
  "description": "Adds PyTorch FSDP2 (fully_shard) to training scripts with correct init, sharding, mixed precision/offload config, and distributed checkpointing. Use when models exceed single-GPU memory or when you ne",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155402,
  "model": "qwen3:8b",
  "name": "pytorch-fsdp2",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "08-distributed-training/pytorch-fsdp2/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "device mesh",
    "distributed training",
    "dtensor",
    "fsdp2",
    "fully sharded data parallel",
    "mixed precision",
    "offload",
    "pytorch",
    "sharded checkpointing",
    "torch distributed"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Adds PyTorch FSDP2 (fully_shard) to training scripts with correct init, sharding, mixed precision/offload config, and distributed checkpointing. Use when models exceed single-GPU memory or when you need DTensor-based sharding with DeviceMesh.

## When to Use
- Your model **doesn’t fit** on one GPU (parameters + gradients + optimizer state).
- You want an eager-mode sharding approach that is **DTensor-based per-parameter sharding** (more inspectable, simpler sharded state dicts) than FSDP1.
- You may later compose DP with **Tensor Parallel** using **DeviceMesh**.
- You need strict backwards-compatible checkpoints across PyTorch versions (DCP warns against this).
- You’re forced onto older PyTorch versions without the FSDP2 stack.

## Examples
- This skill teaches a coding agent how to **add PyTorch FSDP2** to a training loop with correct initialization, sharding, mixed precision/offload configuration, and checkpointing.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `08-distributed-training/pytorch-fsdp2/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Skill: Use PyTorch FSDP2 (`fully_shard`) correctly in a training script This skill teaches a coding agent how to **add PyTorch FSDP2** to a training loop with correct initialization, sharding, mixed precision/offload configuration, and checkpointing. > FSDP2 in PyTorch is exposed primarily via `torch.distributed.fsdp.fully_shard` and the `FSDPModule` methods it adds in-place to modules. See: `references/pytorch_fully_shard_api.md`, `references/pytorch_fsdp2_tutorial.md`. --- ## When to use this skill Use FSDP2 when: - Your model **doesn’t fit** on one GPU (parameters + gradients + optimizer state). - You want an eager-mode sharding approach that is **DTensor-based per-parameter sharding** (more inspectable, simpler sharded state dicts) than FSDP1. - You may later compose DP with **Tensor

{{input}}
