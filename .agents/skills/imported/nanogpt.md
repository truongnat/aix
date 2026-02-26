# Skill: nanogpt
Schema: antigrav.skill@v1

```json
{
  "description": "Educational GPT implementation in ~300 lines. Reproduces GPT-2 (124M) on OpenWebText. Clean, hackable code for learning transformers. By Andrej Karpathy. Perfect for understanding GPT architecture fro",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155355,
  "model": "qwen3:8b",
  "name": "nanogpt",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "01-model-architecture/nanogpt/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "andrej karpathy",
    "educational",
    "from scratch",
    "gpt-2",
    "minimalist",
    "model architecture",
    "nanogpt",
    "training",
    "transformer"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Educational GPT implementation in ~300 lines. Reproduces GPT-2 (124M) on OpenWebText. Clean, hackable code for learning transformers. By Andrej Karpathy. Perfect for understanding GPT architecture from scratch. Train on Shakespeare (CPU) or OpenWebText (multi-GPU).

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install torch numpy transformers datasets tiktoken wandb tqdm
- # Prepare data
python data/shakespeare_char/prepare.py

# Train (5 minutes on CPU)
python train.py config/train_shakespeare_char.py

# Generate text
python sample.py --out_dir=out-shakespeare-char
- ROMEO:
What say'st thou? Shall I speak, and be a man?

JULIET:
I am afeard, and yet I'll speak; for thou art
One that hath been a man, and yet I know not
What thou art.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `01-model-architecture/nanogpt/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# nanoGPT - Minimalist GPT Training ## Quick start nanoGPT is a simplified GPT implementation designed for learning and experimentation. **Installation**: ```bash pip install torch numpy transformers datasets tiktoken wandb tqdm ``` **Train on Shakespeare** (CPU-friendly): ```bash # Prepare data python data/shakespeare_char/prepare.py # Train (5 minutes on CPU) python train.py config/train_shakespeare_char.py # Generate text python sample.py --out_dir=out-shakespeare-char ``` **Output**: ``` ROMEO: What say'st thou? Shall I speak, and be a man? JULIET: I am afeard, and yet I'll speak; for thou art One that hath been a man, and yet I know not What thou art. ``` ## Common workflows ### Workflow 1: Character-level Shakespeare **Complete training pipeline**: ```bash # Step 1: Prepare data (cre

{{input}}
