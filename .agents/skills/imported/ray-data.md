# Skill: ray-data
Schema: antigrav.skill@v1

```json
{
  "description": "Scalable data processing for ML workloads. Streaming execution across CPU/GPU, supports Parquet/CSV/JSON/images. Integrates with Ray Train, PyTorch, TensorFlow. Scales from single machine to 100s of n",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155375,
  "model": "qwen3:8b",
  "name": "ray-data",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "05-data-processing/ray-data/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "batch inference",
    "data processing",
    "distributed computing",
    "etl",
    "ml pipelines",
    "pytorch",
    "ray",
    "ray data",
    "scalable",
    "tensorflow"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Scalable data processing for ML workloads. Streaming execution across CPU/GPU, supports Parquet/CSV/JSON/images. Integrates with Ray Train, PyTorch, TensorFlow. Scales from single machine to 100s of nodes. Use for batch inference, data preprocessing, multi-modal data loading, or distributed ETL pipelines.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install -U 'ray[data]'
- import ray

# Read Parquet files
ds = ray.data.read_parquet("s3://bucket/data/*.parquet")

# Transform data (lazy execution)
ds = ds.map_batches(lambda batch: {"processed": batch["text"].str.lower()})

# Consume data
for batch in ds.iter_batches(batch_size=100):
    print(batch)
- import ray
from ray.train import ScalingConfig
from ray.train.torch import TorchTrainer

# Create dataset
train_ds = ray.data.read_parquet("s3://bucket/train/*.parquet")

def train_func(config):
    # Access dataset in training
    train_ds = ray.train.get_dataset_shard("train")

    for epoch in range(10):
        for batch in train_ds.iter_batches(batch_size=32):
            # Train on batch
            pass

# Train with Ray
trainer = TorchTrainer(
    train_func,
    datasets={"train": train_ds},
    scaling_config=ScalingConfig(num_workers=4, use_gpu=True)
)
trainer.fit()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `05-data-processing/ray-data/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Ray Data - Scalable ML Data Processing Distributed data processing library for ML and AI workloads. ## When to use Ray Data **Use Ray Data when:** - Processing large datasets (>100GB) for ML training - Need distributed data preprocessing across cluster - Building batch inference pipelines - Loading multi-modal data (images, audio, video) - Scaling data processing from laptop to cluster **Key features**: - **Streaming execution**: Process data larger than memory - **GPU support**: Accelerate transforms with GPUs - **Framework integration**: PyTorch, TensorFlow, HuggingFace - **Multi-modal**: Images, Parquet, CSV, JSON, audio, video **Use alternatives instead**: - **Pandas**: Small data (<1GB) on single machine - **Dask**: Tabular data, SQL-like operations - **Spark**: Enterprise ETL, SQL

{{input}}
