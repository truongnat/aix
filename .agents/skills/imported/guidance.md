# Skill: guidance
Schema: antigrav.skill@v1

```json
{
  "description": "Control LLM output with regex and grammars, guarantee valid JSON/XML/code generation, enforce structured formats, and build multi-step workflows with Guidance - Microsoft Research's constrained genera",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155457,
  "model": "qwen3:8b",
  "name": "guidance",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "16-prompt-engineering/guidance/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "constrained generation",
    "format enforcement",
    "grammar",
    "guidance",
    "json validation",
    "microsoft research",
    "multi-step workflows",
    "prompt engineering",
    "structured output"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Control LLM output with regex and grammars, guarantee valid JSON/XML/code generation, enforce structured formats, and build multi-step workflows with Guidance - Microsoft Research's constrained generation framework

## When to Use
- **Control LLM output syntax** with regex or grammars
- **Guarantee valid JSON/XML/code** generation
- **Reduce latency** vs traditional prompting approaches
- **Enforce structured formats** (dates, emails, IDs, etc.)
- **Build multi-step workflows** with Pythonic control flow
- **Prevent invalid outputs** through grammatical constraints

## Examples
- # Base installation
pip install guidance

# With specific backends
pip install guidance[transformers]  # Hugging Face models
pip install guidance[llama_cpp]     # llama.cpp models
- from guidance import models, gen

# Load model (supports OpenAI, Transformers, llama.cpp)
lm = models.OpenAI("gpt-4")

# Generate with constraints
result = lm + "The capital of France is " + gen("capital", max_tokens=5)

print(result["capital"])  # "Paris"
- from guidance import models, gen, system, user, assistant

# Configure Claude
lm = models.Anthropic("claude-sonnet-4-5-20250929")

# Use context managers for chat format
with system():
    lm += "You are a helpful assistant."

with user():
    lm += "What is the capital of France?"

with assistant():
    lm += gen(max_tokens=20)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `16-prompt-engineering/guidance/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Guidance: Constrained LLM Generation ## When to Use This Skill Use Guidance when you need to: - **Control LLM output syntax** with regex or grammars - **Guarantee valid JSON/XML/code** generation - **Reduce latency** vs traditional prompting approaches - **Enforce structured formats** (dates, emails, IDs, etc.) - **Build multi-step workflows** with Pythonic control flow - **Prevent invalid outputs** through grammatical constraints **GitHub Stars**: 18,000+ | **From**: Microsoft Research ## Installation ```bash # Base installation pip install guidance # With specific backends pip install guidance[transformers] # Hugging Face models pip install guidance[llama_cpp] # llama.cpp models ``` ## Quick Start ### Basic Example: Structured Generation ```python from guidance import models, gen # Loa

{{input}}
