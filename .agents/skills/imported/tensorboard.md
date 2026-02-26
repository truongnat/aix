# Skill: tensorboard
Schema: antigrav.skill@v1

```json
{
  "description": "Visualize training metrics, debug models with histograms, compare experiments, visualize model graphs, and profile performance with TensorBoard - Google's ML visualization toolkit",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155433,
  "model": "qwen3:8b",
  "name": "tensorboard",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "13-mlops/tensorboard/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "experiment tracking",
    "mlops",
    "model debugging",
    "performance profiling",
    "pytorch",
    "tensorboard",
    "tensorflow",
    "training metrics",
    "visualization"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Visualize training metrics, debug models with histograms, compare experiments, visualize model graphs, and profile performance with TensorBoard - Google's ML visualization toolkit

## When to Use
- **Visualize training metrics** like loss and accuracy over time
- **Debug models** with histograms and distributions
- **Compare experiments** across multiple runs
- **Visualize model graphs** and architecture
- **Project embeddings** to lower dimensions (t-SNE, PCA)
- **Track hyperparameter** experiments
- **Profile performance** and identify bottlenecks
- **Visualize images and text** during training

## Examples
- # Install TensorBoard
pip install tensorboard

# PyTorch integration
pip install torch torchvision tensorboard

# TensorFlow integration (TensorBoard included)
pip install tensorflow

# Launch TensorBoard
tensorboard --logdir=runs
# Access at http://localhost:6006
- from torch.utils.tensorboard import SummaryWriter

# Create writer
writer = SummaryWriter('runs/experiment_1')

# Training loop
for epoch in range(10):
    train_loss = train_epoch()
    val_acc = validate()

    # Log metrics
    writer.add_scalar('Loss/train', train_loss, epoch)
    writer.add_scalar('Accuracy/val', val_acc, epoch)

# Close writer
writer.close()

# Launch: tensorboard --logdir=runs
- import tensorflow as tf

# Create callback
tensorboard_callback = tf.keras.callbacks.TensorBoard(
    log_dir='logs/fit',
    histogram_freq=1
)

# Train model
model.fit(
    x_train, y_train,
    epochs=10,
    validation_data=(x_val, y_val),
    callbacks=[tensorboard_callback]
)

# Launch: tensorboard --logdir=logs

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `13-mlops/tensorboard/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# TensorBoard: Visualization Toolkit for ML ## When to Use This Skill Use TensorBoard when you need to: - **Visualize training metrics** like loss and accuracy over time - **Debug models** with histograms and distributions - **Compare experiments** across multiple runs - **Visualize model graphs** and architecture - **Project embeddings** to lower dimensions (t-SNE, PCA) - **Track hyperparameter** experiments - **Profile performance** and identify bottlenecks - **Visualize images and text** during training **Users**: 20M+ downloads/year | **GitHub Stars**: 27k+ | **License**: Apache 2.0 ## Installation ```bash # Install TensorBoard pip install tensorboard # PyTorch integration pip install torch torchvision tensorboard # TensorFlow integration (TensorBoard included) pip install tensorflow #

{{input}}
