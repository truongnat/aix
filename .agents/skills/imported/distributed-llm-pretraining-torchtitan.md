# Skill: distributed-llm-pretraining-torchtitan
Schema: antigrav.skill@v1

```json
{
  "description": "Provides PyTorch-native distributed LLM pretraining using torchtitan with 4D parallelism (FSDP2, TP, PP, CP). Use when pretraining Llama 3.1, DeepSeek V3, or custom models at scale from 8 to 512+ GPUs",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155358,
  "model": "qwen3:8b",
  "name": "distributed-llm-pretraining-torchtitan",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "01-model-architecture/torchtitan/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "context parallel",
    "distributed training",
    "float8",
    "fsdp2",
    "llama",
    "model architecture",
    "pipeline parallel",
    "pretraining",
    "tensor parallel",
    "torchtitan"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides PyTorch-native distributed LLM pretraining using torchtitan with 4D parallelism (FSDP2, TP, PP, CP). Use when pretraining Llama 3.1, DeepSeek V3, or custom models at scale from 8 to 512+ GPUs with Float8, torch.compile, and distributed checkpointing.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # From PyPI (stable)
pip install torchtitan

# From source (latest features, requires PyTorch nightly)
git clone https://github.com/pytorch/torchtitan
cd torchtitan
pip install -r requirements.txt
- # Get HF token from https://huggingface.co/settings/tokens
python scripts/download_hf_assets.py --repo_id meta-llama/Llama-3.1-8B --assets tokenizer --hf_token=...
- CONFIG_FILE="./torchtitan/models/llama3/train_configs/llama3_8b.toml" ./run_train.sh

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `01-model-architecture/torchtitan/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# TorchTitan - PyTorch Native Distributed LLM Pretraining ## Quick start TorchTitan is PyTorch's official platform for large-scale LLM pretraining with composable 4D parallelism (FSDP2, TP, PP, CP), achieving 65%+ speedups over baselines on H100 GPUs. **Installation**: ```bash # From PyPI (stable) pip install torchtitan # From source (latest features, requires PyTorch nightly) git clone https://github.com/pytorch/torchtitan cd torchtitan pip install -r requirements.txt ``` **Download tokenizer**: ```bash # Get HF token from https://huggingface.co/settings/tokens python scripts/download_hf_assets.py --repo_id meta-llama/Llama-3.1-8B --assets tokenizer --hf_token=... ``` **Start training on 8 GPUs**: ```bash CONFIG_FILE="./torchtitan/models/llama3/train_configs/llama3_8b.toml" ./run_train.sh

{{input}}
