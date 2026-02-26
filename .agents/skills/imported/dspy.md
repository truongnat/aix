# Skill: dspy
Schema: antigrav.skill@v1

```json
{
  "description": "Build complex AI systems with declarative programming, optimize prompts automatically, create modular RAG systems and agents with DSPy - Stanford NLP's framework for systematic LM programming",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155454,
  "model": "qwen3:8b",
  "name": "dspy",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "16-prompt-engineering/dspy/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "agents",
    "ai-research",
    "automatic optimization",
    "declarative programming",
    "dspy",
    "lm programming",
    "modular ai",
    "prompt engineering",
    "prompt optimization",
    "rag",
    "stanford nlp"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Build complex AI systems with declarative programming, optimize prompts automatically, create modular RAG systems and agents with DSPy - Stanford NLP's framework for systematic LM programming

## When to Use
- **Build complex AI systems** with multiple components and workflows
- **Program LMs declaratively** instead of manual prompt engineering
- **Optimize prompts automatically** using data-driven methods
- **Create modular AI pipelines** that are maintainable and portable
- **Improve model outputs systematically** with optimizers
- **Build RAG systems, agents, or classifiers** with better reliability

## Examples
- # Stable release
pip install dspy

# Latest development version
pip install git+https://github.com/stanfordnlp/dspy.git

# With specific LM providers
pip install dspy[openai]        # OpenAI
pip install dspy[anthropic]     # Anthropic Claude
pip install dspy[all]           # All providers
- import dspy

# Configure your language model
lm = dspy.Claude(model="claude-sonnet-4-5-20250929")
dspy.settings.configure(lm=lm)

# Define a signature (input → output)
class QA(dspy.Signature):
    """Answer questions with short factual answers."""
    question = dspy.InputField()
    answer = dspy.OutputField(desc="often between 1 and 5 words")

# Create a module
qa = dspy.Predict(QA)

# Use it
response = qa(question="What is the capital of France?")
print(response.answer)  # "Paris"
- import dspy

lm = dspy.Claude(model="claude-sonnet-4-5-20250929")
dspy.settings.configure(lm=lm)

# Use ChainOfThought for better reasoning
class MathProblem(dspy.Signature):
    """Solve math word problems."""
    problem = dspy.InputField()
    answer = dspy.OutputField(desc="numerical answer")

# ChainOfThought generates reasoning steps automatically
cot = dspy.ChainOfThought(MathProblem)

response = cot(problem="If John has 5 apples and gives 2 to Mary, how many does he have?")
print(response.rationale)  # Shows reasoning steps
print(response.answer)     # "3"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `16-prompt-engineering/dspy/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# DSPy: Declarative Language Model Programming ## When to Use This Skill Use DSPy when you need to: - **Build complex AI systems** with multiple components and workflows - **Program LMs declaratively** instead of manual prompt engineering - **Optimize prompts automatically** using data-driven methods - **Create modular AI pipelines** that are maintainable and portable - **Improve model outputs systematically** with optimizers - **Build RAG systems, agents, or classifiers** with better reliability **GitHub Stars**: 22,000+ | **Created By**: Stanford NLP ## Installation ```bash # Stable release pip install dspy # Latest development version pip install git+https://github.com/stanfordnlp/dspy.git # With specific LM providers pip install dspy[openai] # OpenAI pip install dspy[anthropic] # Anthr

{{input}}
