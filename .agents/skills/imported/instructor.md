# Skill: instructor
Schema: antigrav.skill@v1

```json
{
  "description": "Extract structured data from LLM responses with Pydantic validation, retry failed extractions automatically, parse complex JSON with type safety, and stream partial results with Instructor - battle-te",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155459,
  "model": "qwen3:8b",
  "name": "instructor",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "16-prompt-engineering/instructor/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "anthropic",
    "data extraction",
    "instructor",
    "json parsing",
    "openai",
    "prompt engineering",
    "pydantic",
    "streaming",
    "structured output",
    "type safety",
    "validation"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Extract structured data from LLM responses with Pydantic validation, retry failed extractions automatically, parse complex JSON with type safety, and stream partial results with Instructor - battle-tested structured output library

## When to Use
- **Extract structured data** from LLM responses reliably
- **Validate outputs** against Pydantic schemas automatically
- **Retry failed extractions** with automatic error handling
- **Parse complex JSON** with type safety and validation
- **Stream partial results** for real-time processing
- **Support multiple LLM providers** with consistent API

## Examples
- # Base installation
pip install instructor

# With specific providers
pip install "instructor[anthropic]"  # Anthropic Claude
pip install "instructor[openai]"     # OpenAI
pip install "instructor[all]"        # All providers
- import instructor
from pydantic import BaseModel
from anthropic import Anthropic

# Define output structure
class User(BaseModel):
    name: str
    age: int
    email: str

# Create instructor client
client = instructor.from_anthropic(Anthropic())

# Extract structured data
user = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "John Doe is 30 years old. His email is john@example.com"
    }],
    response_model=User
)

print(user.name)   # "John Doe"
print(user.age)    # 30
print(user.email)  # "john@example.com"
- from openai import OpenAI

client = instructor.from_openai(OpenAI())

user = client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=User,
    messages=[{"role": "user", "content": "Extract: Alice, 25, alice@email.com"}]
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `16-prompt-engineering/instructor/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Instructor: Structured LLM Outputs ## When to Use This Skill Use Instructor when you need to: - **Extract structured data** from LLM responses reliably - **Validate outputs** against Pydantic schemas automatically - **Retry failed extractions** with automatic error handling - **Parse complex JSON** with type safety and validation - **Stream partial results** for real-time processing - **Support multiple LLM providers** with consistent API **GitHub Stars**: 15,000+ | **Battle-tested**: 100,000+ developers ## Installation ```bash # Base installation pip install instructor # With specific providers pip install "instructor[anthropic]" # Anthropic Claude pip install "instructor[openai]" # OpenAI pip install "instructor[all]" # All providers ``` ## Quick Start ### Basic Example: Extract User D

{{input}}
