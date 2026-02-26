# Skill: lambda-labs-gpu-cloud
Schema: antigrav.skill@v1

```json
{
  "description": "Reserved and on-demand GPU cloud instances for ML training and inference. Use when you need dedicated GPU instances with simple SSH access, persistent filesystems, or high-performance multi-node clust",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155409,
  "model": "qwen3:8b",
  "name": "lambda-labs-gpu-cloud",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "09-infrastructure/lambda-labs/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "gpu cloud",
    "inference",
    "infrastructure",
    "lambda labs",
    "training"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Reserved and on-demand GPU cloud instances for ML training and inference. Use when you need dedicated GPU instances with simple SSH access, persistent filesystems, or high-performance multi-node clusters for large-scale training.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Get instance IP from console
ssh ubuntu@<INSTANCE-IP>

# Or with specific key
ssh -i ~/.ssh/lambda_key ubuntu@<INSTANCE-IP>
- 8x GPU: Best for distributed training (DDP, FSDP)
4x GPU: Large models, multi-GPU training
2x GPU: Medium workloads
1x GPU: Fine-tuning, inference, development
- # Included software
- Ubuntu 22.04 LTS
- NVIDIA drivers (latest)
- CUDA 12.x
- cuDNN 8.x
- NCCL (for multi-GPU)
- PyTorch (latest)
- TensorFlow (latest)
- JAX
- JupyterLab

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `09-infrastructure/lambda-labs/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Lambda Labs GPU Cloud Comprehensive guide to running ML workloads on Lambda Labs GPU cloud with on-demand instances and 1-Click Clusters. ## When to use Lambda Labs **Use Lambda Labs when:** - Need dedicated GPU instances with full SSH access - Running long training jobs (hours to days) - Want simple pricing with no egress fees - Need persistent storage across sessions - Require high-performance multi-node clusters (16-512 GPUs) - Want pre-installed ML stack (Lambda Stack with PyTorch, CUDA, NCCL) **Key features:** - **GPU variety**: B200, H100, GH200, A100, A10, A6000, V100 - **Lambda Stack**: Pre-installed PyTorch, TensorFlow, CUDA, cuDNN, NCCL - **Persistent filesystems**: Keep data across instance restarts - **1-Click Clusters**: 16-512 GPU Slurm clusters with InfiniBand - **Simple p

{{input}}
