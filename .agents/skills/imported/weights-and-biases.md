# Skill: weights-and-biases
Schema: antigrav.skill@v1

```json
{
  "description": "Track ML experiments with automatic logging, visualize training in real-time, optimize hyperparameters with sweeps, and manage model registry with W&B - collaborative MLOps platform",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155439,
  "model": "qwen3:8b",
  "name": "weights-and-biases",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "13-mlops/weights-and-biases/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "collaboration",
    "experiment tracking",
    "huggingface",
    "hyperparameter tuning",
    "mlops",
    "model registry",
    "pytorch",
    "real-time visualization",
    "tensorflow",
    "wandb",
    "weights and biases"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Track ML experiments with automatic logging, visualize training in real-time, optimize hyperparameters with sweeps, and manage model registry with W&B - collaborative MLOps platform

## When to Use
- **Track ML experiments** with automatic metric logging
- **Visualize training** in real-time dashboards
- **Compare runs** across hyperparameters and configurations
- **Optimize hyperparameters** with automated sweeps
- **Manage model registry** with versioning and lineage
- **Collaborate on ML projects** with team workspaces
- **Track artifacts** (datasets, models, code) with lineage

## Examples
- # Install W&B
pip install wandb

# Login (creates API key)
wandb login

# Or set API key programmatically
export WANDB_API_KEY=your_api_key_here
- import wandb

# Initialize a run
run = wandb.init(
    project="my-project",
    config={
        "learning_rate": 0.001,
        "epochs": 10,
        "batch_size": 32,
        "architecture": "ResNet50"
    }
)

# Training loop
for epoch in range(run.config.epochs):
    # Your training code
    train_loss = train_epoch()
    val_loss = validate()

    # Log metrics
    wandb.log({
        "epoch": epoch,
        "train/loss": train_loss,
        "val/loss": val_loss,
        "train/accuracy": train_acc,
        "val/accuracy": val_acc
    })

# Finish the run
wandb.finish()
- import torch
import wandb

# Initialize
wandb.init(project="pytorch-demo", config={
    "lr": 0.001,
    "epochs": 10
})

# Access config
config = wandb.config

# Training loop
for epoch in range(config.epochs):
    for batch_idx, (data, target) in enumerate(train_loader):
        # Forward pass
        output = model(data)
        loss = criterion(output, target)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Log every 100 batches
        if batch_idx % 100 == 0:
            wandb.log({
                "loss": loss.item(),
                "epoch": epoch,
                "batch": batch_idx
            })

# Save model
torch.save(model.state_dict(), "model.pth")
wandb.save("model.pth")  # Upload to W&B

wandb.finish()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `13-mlops/weights-and-biases/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Weights & Biases: ML Experiment Tracking & MLOps ## When to Use This Skill Use Weights & Biases (W&B) when you need to: - **Track ML experiments** with automatic metric logging - **Visualize training** in real-time dashboards - **Compare runs** across hyperparameters and configurations - **Optimize hyperparameters** with automated sweeps - **Manage model registry** with versioning and lineage - **Collaborate on ML projects** with team workspaces - **Track artifacts** (datasets, models, code) with lineage **Users**: 200,000+ ML practitioners | **GitHub Stars**: 10.5k+ | **Integrations**: 100+ ## Installation ```bash # Install W&B pip install wandb # Login (creates API key) wandb login # Or set API key programmatically export WANDB_API_KEY=your_api_key_here ``` ## Quick Start ### Basic Exp

{{input}}
