# Skill: ray-train
Schema: antigrav.skill@v1

```json
{
  "description": "Distributed training orchestration across clusters. Scales PyTorch/TensorFlow/HuggingFace from laptop to 1000s of nodes. Built-in hyperparameter tuning with Ray Tune, fault tolerance, elastic scaling.",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155407,
  "model": "qwen3:8b",
  "name": "ray-train",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "08-distributed-training/ray-train/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "distributed training",
    "elastic scaling",
    "fault tolerance",
    "hyperparameter tuning",
    "multi-node",
    "orchestration",
    "pytorch",
    "ray",
    "ray train",
    "tensorflow"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Distributed training orchestration across clusters. Scales PyTorch/TensorFlow/HuggingFace from laptop to 1000s of nodes. Built-in hyperparameter tuning with Ray Tune, fault tolerance, elastic scaling. Use when training massive models across multiple machines or running distributed hyperparameter sweeps.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install -U "ray[train]"
- import ray
from ray import train
from ray.train import ScalingConfig
from ray.train.torch import TorchTrainer
import torch
import torch.nn as nn

# Define training function
def train_func(config):
    # Your normal PyTorch code
    model = nn.Linear(10, 1)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

    # Prepare for distributed (Ray handles device placement)
    model = train.torch.prepare_model(model)

    for epoch in range(10):
        # Your training loop
        output = model(torch.randn(32, 10))
        loss = output.sum()
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        # Report metrics (logged automatically)
        train.report({"loss": loss.item(), "epoch": epoch})

# Run distributed training
trainer = TorchTrainer(
    train_func,
    scaling_config=ScalingConfig(
        num_workers=4,  # 4 GPUs/workers
        use_gpu=True
    )
)

result = trainer.fit()
print(f"Final loss: {result.metrics['loss']}")
- model = MyModel().cuda()
optimizer = torch.optim.Adam(model.parameters())

for epoch in range(epochs):
    for batch in dataloader:
        loss = model(batch)
        loss.backward()
        optimizer.step()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `08-distributed-training/ray-train/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Ray Train - Distributed Training Orchestration ## Quick start Ray Train scales machine learning training from single GPU to multi-node clusters with minimal code changes. **Installation**: ```bash pip install -U "ray[train]" ``` **Basic PyTorch training** (single node): ```python import ray from ray import train from ray.train import ScalingConfig from ray.train.torch import TorchTrainer import torch import torch.nn as nn # Define training function def train_func(config): # Your normal PyTorch code model = nn.Linear(10, 1) optimizer = torch.optim.SGD(model.parameters(), lr=0.01) # Prepare for distributed (Ray handles device placement) model = train.torch.prepare_model(model) for epoch in range(10): # Your training loop output = model(torch.randn(32, 10)) loss = output.sum() loss.backward

{{input}}
