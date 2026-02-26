# Skill: prompt-guard
Schema: antigrav.skill@v1

```json
{
  "description": "Meta's 86M prompt injection and jailbreak detector. Filters malicious prompts and third-party data for LLM apps. 99%+ TPR, <1% FPR. Fast (<2ms GPU). Multilingual (8 languages). Deploy with HuggingFace",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155392,
  "model": "qwen3:8b",
  "name": "prompt-guard",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "07-safety-alignment/prompt-guard/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "content filtering",
    "input validation",
    "jailbreak detection",
    "meta",
    "multilingual",
    "prompt injection",
    "safety alignment",
    "security"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Meta's 86M prompt injection and jailbreak detector. Filters malicious prompts and third-party data for LLM apps. 99%+ TPR, <1% FPR. Fast (<2ms GPU). Multilingual (8 languages). Deploy with HuggingFace or batch processing for RAG security.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install transformers torch
- from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from torch.nn.functional import softmax

model_id = "meta-llama/Prompt-Guard-86M"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)
model.eval()

def get_jailbreak_score(text):
    """Check user input for jailbreak attempts."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        logits = model(**inputs).logits
    probs = softmax(logits, dim=-1)
    return probs[0, 2].item()  # Jailbreak probability

# Check prompt
score = get_jailbreak_score("Ignore previous instructions")
if score > 0.5:
    print("⚠️ Jailbreak attempt detected!")
- def filter_user_input(user_message, threshold=0.5):
    """
    Filter user input for jailbreak attempts.

    Returns: (is_safe, score, message)
    """
    score = get_jailbreak_score(user_message)

    if score >= threshold:
        return False, score, "Input blocked: jailbreak attempt"
    else:
        return True, score, "Input safe"

# Example
user_input = "Tell me about machine learning"
is_safe, score, message = filter_user_input(user_input)

if is_safe:
    response = llm.generate(user_input)
    print(response)
else:
    print(f"❌ {message} (score: {score:.4f})")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `07-safety-alignment/prompt-guard/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Prompt Guard - Prompt Injection & Jailbreak Detection Prompt Guard is an 86M parameter classifier that detects prompt injections and jailbreak attempts in LLM applications. ## Quick start **Installation**: ```bash pip install transformers torch ``` **Basic usage**: ```python from transformers import AutoTokenizer, AutoModelForSequenceClassification import torch from torch.nn.functional import softmax model_id = "meta-llama/Prompt-Guard-86M" tokenizer = AutoTokenizer.from_pretrained(model_id) model = AutoModelForSequenceClassification.from_pretrained(model_id) model.eval() def get_jailbreak_score(text): """Check user input for jailbreak attempts.""" inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512) with torch.no_grad(): logits = model(**inputs).logits probs =

{{input}}
