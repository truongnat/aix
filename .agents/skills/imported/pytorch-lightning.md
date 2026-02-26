# Skill: pytorch-lightning
Schema: antigrav.skill@v1

```json
{
  "description": "High-level PyTorch framework with Trainer class, automatic distributed training (DDP/FSDP/DeepSpeed), callbacks system, and minimal boilerplate. Scales from laptop to supercomputer with same code. Use",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155406,
  "model": "qwen3:8b",
  "name": "pytorch-lightning",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "08-distributed-training/pytorch-lightning/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "best practices",
    "callbacks",
    "ddp",
    "deepspeed",
    "distributed training",
    "fsdp",
    "high-level api",
    "pytorch lightning",
    "scalable",
    "training framework"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
High-level PyTorch framework with Trainer class, automatic distributed training (DDP/FSDP/DeepSpeed), callbacks system, and minimal boilerplate. Scales from laptop to supercomputer with same code. Use when you want clean training loops with built-in best practices.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install lightning
- import lightning as L
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset

# Step 1: Define LightningModule (organize your PyTorch code)
class LitModel(L.LightningModule):
    def __init__(self, hidden_size=128):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(28 * 28, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, 10)
        )

    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self.model(x)
        loss = nn.functional.cross_entropy(y_hat, y)
        self.log('train_loss', loss)  # Auto-logged to TensorBoard
        return loss

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)

# Step 2: Create data
train_loader = DataLoader(train_dataset, batch_size=32)

# Step 3: Train with Trainer (handles everything else!)
trainer = L.Trainer(max_epochs=10, accelerator='gpu', devices=2)
model = LitModel()
trainer.fit(model, train_loader)
- model = MyModel()
optimizer = torch.optim.Adam(model.parameters())
model.to('cuda')

for epoch in range(max_epochs):
    for batch in train_loader:
        batch = batch.to('cuda')
        optimizer.zero_grad()
        loss = model(batch)
        loss.backward()
        optimizer.step()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `08-distributed-training/pytorch-lightning/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# PyTorch Lightning - High-Level Training Framework ## Quick start PyTorch Lightning organizes PyTorch code to eliminate boilerplate while maintaining flexibility. **Installation**: ```bash pip install lightning ``` **Convert PyTorch to Lightning** (3 steps): ```python import lightning as L import torch from torch import nn from torch.utils.data import DataLoader, Dataset # Step 1: Define LightningModule (organize your PyTorch code) class LitModel(L.LightningModule): def __init__(self, hidden_size=128): super().__init__() self.model = nn.Sequential( nn.Linear(28 * 28, hidden_size), nn.ReLU(), nn.Linear(hidden_size, 10) ) def training_step(self, batch, batch_idx): x, y = batch y_hat = self.model(x) loss = nn.functional.cross_entropy(y_hat, y) self.log('train_loss', loss) # Auto-logged to Te

{{input}}
