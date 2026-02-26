# Skill: pyvene-interventions
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for performing causal interventions on PyTorch models using pyvene's declarative intervention framework. Use when conducting causal tracing, activation patching, interchange interven",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155366,
  "model": "qwen3:8b",
  "name": "pyvene-interventions",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "04-mechanistic-interpretability/pyvene/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "activation patching",
    "ai-research",
    "causal intervention",
    "causal tracing",
    "interpretability",
    "pyvene"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for performing causal interventions on PyTorch models using pyvene's declarative intervention framework. Use when conducting causal tracing, activation patching, interchange intervention training, or testing causal hypotheses about model behavior.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install pyvene
- import pyvene as pv
- import pyvene as pv
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load base model
model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Define intervention configuration
config = pv.IntervenableConfig(
    representations=[
        pv.RepresentationConfig(
            layer=8,
            component="block_output",
            intervention_type=pv.VanillaIntervention,
        )
    ]
)

# Create intervenable model
intervenable = pv.IntervenableModel(config, model)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `04-mechanistic-interpretability/pyvene/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# pyvene: Causal Interventions for Neural Networks pyvene is Stanford NLP's library for performing causal interventions on PyTorch models. It provides a declarative, dict-based framework for activation patching, causal tracing, and interchange intervention training - making intervention experiments reproducible and shareable. **GitHub**: [stanfordnlp/pyvene](https://github.com/stanfordnlp/pyvene) (840+ stars) **Paper**: [pyvene: A Library for Understanding and Improving PyTorch Models via Interventions](https://aclanthology.org/2024.naacl-demo.16) (NAACL 2024) ## When to Use pyvene **Use pyvene when you need to:** - Perform causal tracing (ROME-style localization) - Run activation patching experiments - Conduct interchange intervention training (IIT) - Test causal hypotheses about model co

{{input}}
