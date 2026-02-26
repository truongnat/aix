# Skill: model-merging
Schema: antigrav.skill@v1

```json
{
  "description": "Merge multiple fine-tuned models using mergekit to combine capabilities without retraining. Use when creating specialized models by blending domain-specific expertise (math + coding + chat), improving",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155481,
  "model": "qwen3:8b",
  "name": "model-merging",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "19-emerging-techniques/model-merging/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "arcee ai",
    "dare",
    "emerging techniques",
    "mergekit",
    "model fusion",
    "model merging",
    "multi-capability",
    "no retraining",
    "slerp",
    "task arithmetic",
    "ties"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Merge multiple fine-tuned models using mergekit to combine capabilities without retraining. Use when creating specialized models by blending domain-specific expertise (math + coding + chat), improving performance beyond single models, or experimenting rapidly with model variants. Covers SLERP, TIES-Merging, DARE, Task Arithmetic, linear merging, and production deployment strategies.

## When to Use
- **Combine capabilities** from multiple fine-tuned models without retraining
- **Create specialized models** by blending domain-specific expertise (math + coding + chat)
- **Improve performance** beyond single models (often +5-10% on benchmarks)
- **Reduce training costs** - no GPUs needed, merges run on CPU
- **Experiment rapidly** - create new model variants in minutes, not days
- **Preserve multiple skills** - merge without catastrophic forgetting

## Examples
- # Install mergekit
git clone https://github.com/arcee-ai/mergekit.git
cd mergekit
pip install -e .

# Or via pip
pip install mergekit

# Optional: Transformer library
pip install transformers torch
- # config.yml - Merge two models with equal weights
merge_method: linear
models:
  - model: mistralai/Mistral-7B-v0.1
    parameters:
      weight: 0.5
  - model: teknium/OpenHermes-2.5-Mistral-7B
    parameters:
      weight: 0.5
dtype: bfloat16
- # Run merge
mergekit-yaml config.yml ./merged-model --cuda

# Use merged model
python -m transformers.models.auto --model_name_or_path ./merged-model

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `19-emerging-techniques/model-merging/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Model Merging: Combining Pre-trained Models ## When to Use This Skill Use Model Merging when you need to: - **Combine capabilities** from multiple fine-tuned models without retraining - **Create specialized models** by blending domain-specific expertise (math + coding + chat) - **Improve performance** beyond single models (often +5-10% on benchmarks) - **Reduce training costs** - no GPUs needed, merges run on CPU - **Experiment rapidly** - create new model variants in minutes, not days - **Preserve multiple skills** - merge without catastrophic forgetting **Success Stories**: Marcoro14-7B-slerp (best on Open LLM Leaderboard 02/2024), many top HuggingFace models use merging **Tools**: mergekit (Arcee AI), LazyMergekit, Model Soup ## Installation ```bash # Install mergekit git clone https:

{{input}}
