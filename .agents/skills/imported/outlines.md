# Skill: outlines
Schema: antigrav.skill@v1

```json
{
  "description": "Guarantee valid JSON/XML/code structure during generation, use Pydantic models for type-safe outputs, support local models (Transformers, vLLM), and maximize inference speed with Outlines - dottxt.ai'",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155461,
  "model": "qwen3:8b",
  "name": "outlines",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "16-prompt-engineering/outlines/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "grammar-based generation",
    "json schema",
    "local models",
    "outlines",
    "prompt engineering",
    "pydantic",
    "structured generation",
    "transformers",
    "type safety",
    "vllm"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Guarantee valid JSON/XML/code structure during generation, use Pydantic models for type-safe outputs, support local models (Transformers, vLLM), and maximize inference speed with Outlines - dottxt.ai's structured generation library

## When to Use
- **Guarantee valid JSON/XML/code** structure during generation
- **Use Pydantic models** for type-safe outputs
- **Support local models** (Transformers, llama.cpp, vLLM)
- **Maximize inference speed** with zero-overhead structured generation
- **Generate against JSON schemas** automatically
- **Control token sampling** at the grammar level

## Examples
- # Base installation
pip install outlines

# With specific backends
pip install outlines transformers  # Hugging Face models
pip install outlines llama-cpp-python  # llama.cpp
pip install outlines vllm  # vLLM for high-throughput
- import outlines
from typing import Literal

# Load model
model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")

# Generate with type constraint
prompt = "Sentiment of 'This product is amazing!': "
generator = outlines.generate.choice(model, ["positive", "negative", "neutral"])
sentiment = generator(prompt)

print(sentiment)  # "positive" (guaranteed one of these)
- from pydantic import BaseModel
import outlines

class User(BaseModel):
    name: str
    age: int
    email: str

model = outlines.models.transformers("microsoft/Phi-3-mini-4k-instruct")

# Generate structured output
prompt = "Extract user: John Doe, 30 years old, john@example.com"
generator = outlines.generate.json(model, User)
user = generator(prompt)

print(user.name)   # "John Doe"
print(user.age)    # 30
print(user.email)  # "john@example.com"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `16-prompt-engineering/outlines/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Outlines: Structured Text Generation ## When to Use This Skill Use Outlines when you need to: - **Guarantee valid JSON/XML/code** structure during generation - **Use Pydantic models** for type-safe outputs - **Support local models** (Transformers, llama.cpp, vLLM) - **Maximize inference speed** with zero-overhead structured generation - **Generate against JSON schemas** automatically - **Control token sampling** at the grammar level **GitHub Stars**: 8,000+ | **From**: dottxt.ai (formerly .txt) ## Installation ```bash # Base installation pip install outlines # With specific backends pip install outlines transformers # Hugging Face models pip install outlines llama-cpp-python # llama.cpp pip install outlines vllm # vLLM for high-throughput ``` ## Quick Start ### Basic Example: Classificat

{{input}}
