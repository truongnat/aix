# Skill: training-llms-megatron
Schema: antigrav.skill@v1

```json
{
  "description": "Trains large language models (2B-462B parameters) using NVIDIA Megatron-Core with advanced parallelism strategies. Use when training models >1B parameters, need maximum GPU efficiency (47% MFU on H100",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155400,
  "model": "qwen3:8b",
  "name": "training-llms-megatron",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "08-distributed-training/megatron-core/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "distributed training",
    "h100",
    "large-scale training",
    "megatron-core",
    "model parallelism",
    "nvidia",
    "pipeline parallelism",
    "production",
    "tensor parallelism"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Trains large language models (2B-462B parameters) using NVIDIA Megatron-Core with advanced parallelism strategies. Use when training models >1B parameters, need maximum GPU efficiency (47% MFU on H100), or require tensor/pipeline/sequence/context/expert parallelism. Production-ready framework used for Nemotron, LLaMA, DeepSeek.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Docker (recommended)
docker run --gpus all -it --rm nvcr.io/nvidia/pytorch:25.04-py3

# Or pip
pip install megatron-core
- # Train with 2 GPUs using data parallelism
torchrun --nproc_per_node=2 examples/run_simple_mcore_train_loop.py

# Or LLaMA-3 8B training
./examples/llama/train_llama3_8b_fp8.sh
- LLaMA Training Setup:
- [ ] Step 1: Choose parallelism configuration
- [ ] Step 2: Configure training hyperparameters
- [ ] Step 3: Launch distributed training
- [ ] Step 4: Monitor performance metrics

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `08-distributed-training/megatron-core/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Megatron-Core - Large-Scale LLM Training ## Quick start Megatron-Core trains LLMs from 2B to 462B parameters with up to 47% Model FLOP Utilization on H100 GPUs through advanced parallelism strategies. **Installation**: ```bash # Docker (recommended) docker run --gpus all -it --rm nvcr.io/nvidia/pytorch:25.04-py3 # Or pip pip install megatron-core ``` **Simple distributed training**: ```bash # Train with 2 GPUs using data parallelism torchrun --nproc_per_node=2 examples/run_simple_mcore_train_loop.py # Or LLaMA-3 8B training ./examples/llama/train_llama3_8b_fp8.sh ``` ## Common workflows ### Workflow 1: Train LLaMA-style model with 3D parallelism Copy this checklist: ``` LLaMA Training Setup: - [ ] Step 1: Choose parallelism configuration - [ ] Step 2: Configure training hyperparameters -

{{input}}
