# Skill: huggingface-accelerate
Schema: antigrav.skill@v1

```json
{
  "description": "Simplest distributed training API. 4 lines to add distributed support to any PyTorch script. Unified API for DeepSpeed/FSDP/Megatron/DDP. Automatic device placement, mixed precision (FP16/BF16/FP8). I",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155393,
  "model": "qwen3:8b",
  "name": "huggingface-accelerate",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "08-distributed-training/accelerate/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "accelerate",
    "ai-research",
    "ddp",
    "deepspeed",
    "distributed training",
    "fsdp",
    "huggingface",
    "mixed precision",
    "pytorch",
    "simple",
    "unified api"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Simplest distributed training API. 4 lines to add distributed support to any PyTorch script. Unified API for DeepSpeed/FSDP/Megatron/DDP. Automatic device placement, mixed precision (FP16/BF16/FP8). Interactive config, single launch command. HuggingFace ecosystem standard.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install accelerate
- import torch
+ from accelerate import Accelerator

+ accelerator = Accelerator()

  model = torch.nn.Transformer()
  optimizer = torch.optim.Adam(model.parameters())
  dataloader = torch.utils.data.DataLoader(dataset)

+ model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader)

  for batch in dataloader:
      optimizer.zero_grad()
      loss = model(batch)
-     loss.backward()
+     accelerator.backward(loss)
      optimizer.step()
- accelerate launch train.py

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `08-distributed-training/accelerate/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# HuggingFace Accelerate - Unified Distributed Training ## Quick start Accelerate simplifies distributed training to 4 lines of code. **Installation**: ```bash pip install accelerate ``` **Convert PyTorch script** (4 lines): ```python import torch + from accelerate import Accelerator + accelerator = Accelerator() model = torch.nn.Transformer() optimizer = torch.optim.Adam(model.parameters()) dataloader = torch.utils.data.DataLoader(dataset) + model, optimizer, dataloader = accelerator.prepare(model, optimizer, dataloader) for batch in dataloader: optimizer.zero_grad() loss = model(batch) - loss.backward() + accelerator.backward(loss) optimizer.step() ``` **Run** (single command): ```bash accelerate launch train.py ``` ## Common workflows ### Workflow 1: From single GPU to multi-GPU **Origi

{{input}}
