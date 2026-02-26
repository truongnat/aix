# Skill: mlflow
Schema: antigrav.skill@v1

```json
{
  "description": "Track ML experiments, manage model registry with versioning, deploy models to production, and reproduce experiments with MLflow - framework-agnostic ML lifecycle platform",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155432,
  "model": "qwen3:8b",
  "name": "mlflow",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "13-mlops/mlflow/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "deployment",
    "experiment tracking",
    "huggingface",
    "ml lifecycle",
    "mlflow",
    "mlops",
    "model registry",
    "model versioning",
    "pytorch",
    "scikit-learn",
    "tensorflow"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Track ML experiments, manage model registry with versioning, deploy models to production, and reproduce experiments with MLflow - framework-agnostic ML lifecycle platform

## When to Use
- **Track ML experiments** with parameters, metrics, and artifacts
- **Manage model registry** with versioning and stage transitions
- **Deploy models** to various platforms (local, cloud, serving)
- **Reproduce experiments** with project configurations
- **Compare model versions** and performance metrics
- **Collaborate** on ML projects with team workflows
- **Integrate** with any ML framework (framework-agnostic)

## Examples
- # Install MLflow
pip install mlflow

# Install with extras
pip install mlflow[extras]  # Includes SQLAlchemy, boto3, etc.

# Start MLflow UI
mlflow ui

# Access at http://localhost:5000
- import mlflow

# Start a run
with mlflow.start_run():
    # Log parameters
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_param("batch_size", 32)

    # Your training code
    model = train_model()

    # Log metrics
    mlflow.log_metric("train_loss", 0.15)
    mlflow.log_metric("val_accuracy", 0.92)

    # Log model
    mlflow.sklearn.log_model(model, "model")
- import mlflow
from sklearn.ensemble import RandomForestClassifier

# Enable autologging
mlflow.autolog()

# Train (automatically logged)
model = RandomForestClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)

# Metrics, parameters, and model logged automatically!

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `13-mlops/mlflow/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# MLflow: ML Lifecycle Management Platform ## When to Use This Skill Use MLflow when you need to: - **Track ML experiments** with parameters, metrics, and artifacts - **Manage model registry** with versioning and stage transitions - **Deploy models** to various platforms (local, cloud, serving) - **Reproduce experiments** with project configurations - **Compare model versions** and performance metrics - **Collaborate** on ML projects with team workflows - **Integrate** with any ML framework (framework-agnostic) **Users**: 20,000+ organizations | **GitHub Stars**: 23k+ | **License**: Apache 2.0 ## Installation ```bash # Install MLflow pip install mlflow # Install with extras pip install mlflow[extras] # Includes SQLAlchemy, boto3, etc. # Start MLflow UI mlflow ui # Access at http://localhos

{{input}}
