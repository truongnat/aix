# Skill: transformer-lens-interpretability
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for mechanistic interpretability research using TransformerLens to inspect and manipulate transformer internals via HookPoints and activation caching. Use when reverse-engineering mo",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155372,
  "model": "qwen3:8b",
  "name": "transformer-lens-interpretability",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "04-mechanistic-interpretability/transformer-lens/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "activation patching",
    "ai-research",
    "circuit analysis",
    "mechanistic interpretability",
    "transformerlens"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for mechanistic interpretability research using TransformerLens to inspect and manipulate transformer internals via HookPoints and activation caching. Use when reverse-engineering model algorithms, studying attention patterns, or performing activation patching experiments.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install transformer-lens
- pip install git+https://github.com/TransformerLensOrg/TransformerLens
- from transformer_lens import HookedTransformer

# Load a model
model = HookedTransformer.from_pretrained("gpt2-small")

# For gated models (LLaMA, Mistral)
import os
os.environ["HF_TOKEN"] = "your_token"
model = HookedTransformer.from_pretrained("meta-llama/Llama-2-7b-hf")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `04-mechanistic-interpretability/transformer-lens/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# TransformerLens: Mechanistic Interpretability for Transformers TransformerLens is the de facto standard library for mechanistic interpretability research on GPT-style language models. Created by Neel Nanda and maintained by Bryce Meyer, it provides clean interfaces to inspect and manipulate model internals via HookPoints on every activation. **GitHub**: [TransformerLensOrg/TransformerLens](https://github.com/TransformerLensOrg/TransformerLens) (2,900+ stars) ## When to Use TransformerLens **Use TransformerLens when you need to:** - Reverse-engineer algorithms learned during training - Perform activation patching / causal tracing experiments - Study attention patterns and information flow - Analyze circuits (e.g., induction heads, IOI circuit) - Cache and inspect intermediate activations

{{input}}
