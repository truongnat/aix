# Skill: nnsight-remote-interpretability
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for interpreting and manipulating neural network internals using nnsight with optional NDIF remote execution. Use when needing to run interpretability experiments on massive models (",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155364,
  "model": "qwen3:8b",
  "name": "nnsight-remote-interpretability",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "04-mechanistic-interpretability/nnsight/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "mechanistic interpretability",
    "model internals",
    "ndif",
    "nnsight",
    "remote execution"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for interpreting and manipulating neural network internals using nnsight with optional NDIF remote execution. Use when needing to run interpretability experiments on massive models (70B+) without local GPU resources, or when working with any PyTorch architecture.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Local execution (small model)
with model.trace("Hello world"):
    hidden = model.transformer.h[5].output[0].save()

# Remote execution (massive model) - same code!
with model.trace("Hello world", remote=True):
    hidden = model.model.layers[40].output[0].save()
- # Basic installation
pip install nnsight

# For vLLM support
pip install "nnsight[vllm]"
- from nnsight import LanguageModel

# Load model (uses HuggingFace under the hood)
model = LanguageModel("openai-community/gpt2", device_map="auto")

# For larger models
model = LanguageModel("meta-llama/Llama-3.1-8B", device_map="auto")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `04-mechanistic-interpretability/nnsight/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# nnsight: Transparent Access to Neural Network Internals nnsight (/ɛn.saɪt/) enables researchers to interpret and manipulate the internals of any PyTorch model, with the unique capability of running the same code locally on small models or remotely on massive models (70B+) via NDIF. **GitHub**: [ndif-team/nnsight](https://github.com/ndif-team/nnsight) (730+ stars) **Paper**: [NNsight and NDIF: Democratizing Access to Foundation Model Internals](https://arxiv.org/abs/2407.14561) (ICLR 2025) ## Key Value Proposition **Write once, run anywhere**: The same interpretability code works on GPT-2 locally or Llama-3.1-405B remotely. Just toggle `remote=True`. ```python # Local execution (small model) with model.trace("Hello world"): hidden = model.transformer.h[5].output[0].save() # Remote executi

{{input}}
