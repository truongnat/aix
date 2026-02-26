# Skill: implementing-llms-litgpt
Schema: antigrav.skill@v1

```json
{
  "description": "Implements and trains LLMs using Lightning AI's LitGPT with 20+ pretrained architectures (Llama, Gemma, Phi, Qwen, Mistral). Use when need clean model implementations, educational understanding of arc",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155350,
  "model": "qwen3:8b",
  "name": "implementing-llms-litgpt",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "01-model-architecture/litgpt/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "educational",
    "fine-tuning",
    "gemma",
    "lightning ai",
    "litgpt",
    "llama",
    "llm implementation",
    "lora",
    "mistral",
    "model architecture",
    "phi",
    "qlora"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Implements and trains LLMs using Lightning AI's LitGPT with 20+ pretrained architectures (Llama, Gemma, Phi, Qwen, Mistral). Use when need clean model implementations, educational understanding of architectures, or production fine-tuning with LoRA/QLoRA. Single-file implementations, no abstraction layers.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install 'litgpt[extra]'
- from litgpt import LLM

# Load pretrained model
llm = LLM.load("microsoft/phi-2")

# Generate text
result = llm.generate(
    "What is the capital of France?",
    max_new_tokens=50,
    temperature=0.7
)
print(result)
- litgpt download list

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `01-model-architecture/litgpt/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# LitGPT - Clean LLM Implementations ## Quick start LitGPT provides 20+ pretrained LLM implementations with clean, readable code and production-ready training workflows. **Installation**: ```bash pip install 'litgpt[extra]' ``` **Load and use any model**: ```python from litgpt import LLM # Load pretrained model llm = LLM.load("microsoft/phi-2") # Generate text result = llm.generate( "What is the capital of France?", max_new_tokens=50, temperature=0.7 ) print(result) ``` **List available models**: ```bash litgpt download list ``` ## Common workflows ### Workflow 1: Fine-tune on custom dataset Copy this checklist: ``` Fine-Tuning Setup: - [ ] Step 1: Download pretrained model - [ ] Step 2: Prepare dataset - [ ] Step 3: Configure training - [ ] Step 4: Run fine-tuning ``` **Step 1: Download p

{{input}}
