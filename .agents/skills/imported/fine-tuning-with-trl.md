# Skill: fine-tuning-with-trl
Schema: antigrav.skill@v1

```json
{
  "description": "Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward optimization, and reward model training. Use when need RLHF, align ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155383,
  "model": "qwen3:8b",
  "name": "fine-tuning-with-trl",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/trl-fine-tuning/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "dpo",
    "fine-tuning",
    "grpo",
    "huggingface",
    "post-training",
    "ppo",
    "preference alignment",
    "reinforcement learning",
    "rlhf",
    "sft",
    "trl"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Fine-tune LLMs using reinforcement learning with TRL - SFT for instruction tuning, DPO for preference alignment, PPO/GRPO for reward optimization, and reward model training. Use when need RLHF, align model with preferences, or train from human feedback. Works with HuggingFace Transformers.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install trl transformers datasets peft accelerate
- from trl import SFTTrainer

trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B",
    train_dataset=dataset,  # Prompt-completion pairs
)
trainer.train()
- from trl import DPOTrainer, DPOConfig

config = DPOConfig(output_dir="model-dpo", beta=0.1)
trainer = DPOTrainer(
    model=model,
    args=config,
    train_dataset=preference_dataset,  # chosen/rejected pairs
    processing_class=tokenizer
)
trainer.train()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/trl-fine-tuning/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# TRL - Transformer Reinforcement Learning ## Quick start TRL provides post-training methods for aligning language models with human preferences. **Installation**: ```bash pip install trl transformers datasets peft accelerate ``` **Supervised Fine-Tuning** (instruction tuning): ```python from trl import SFTTrainer trainer = SFTTrainer( model="Qwen/Qwen2.5-0.5B", train_dataset=dataset, # Prompt-completion pairs ) trainer.train() ``` **DPO** (align with preferences): ```python from trl import DPOTrainer, DPOConfig config = DPOConfig(output_dir="model-dpo", beta=0.1) trainer = DPOTrainer( model=model, args=config, train_dataset=preference_dataset, # chosen/rejected pairs processing_class=tokenizer ) trainer.train() ``` ## Common workflows ### Workflow 1: Full RLHF pipeline (SFT → Reward Model

{{input}}
