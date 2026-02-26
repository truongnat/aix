# Skill: grpo-rl-training
Schema: antigrav.skill@v1

```json
{
  "description": "Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155376,
  "model": "qwen3:8b",
  "name": "grpo-rl-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/grpo-rl-training/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "dpo",
    "grpo",
    "post-training",
    "ppo",
    "reasoning",
    "reinforcement learning",
    "reward modeling",
    "rlhf",
    "structured output",
    "trl"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training

## When to Use
- **Enforce specific output formats** (e.g., XML tags, JSON, structured reasoning)
- **Teach verifiable tasks** with objective correctness metrics (math, coding, fact-checking)
- **Improve reasoning capabilities** by rewarding chain-of-thought patterns
- **Align models to domain-specific behaviors** without labeled preference data
- **Optimize for multiple objectives** simultaneously (format + correctness + style)
- Simple supervised fine-tuning tasks (use SFT instead)
- Tasks without clear reward signals
- When you already have high-quality preference pairs (use DPO/PPO instead)

## Examples
- For each prompt p:
  1. Generate N completions: {c₁, c₂, ..., cₙ}
  2. Compute rewards: {r₁, r₂, ..., rₙ}
  3. Learn to increase probability of high-reward completions
     relative to low-reward ones in the same group
- from datasets import load_dataset, Dataset

SYSTEM_PROMPT = """
Respond in the following format:
<reasoning>
[Your step-by-step thinking]
</reasoning>
<answer>
[Final answer]
</answer>
"""

def prepare_dataset(raw_data):
    """
    Transform raw data into GRPO-compatible format.

    Returns: Dataset with columns:
    - 'prompt': List[Dict] with role/content (system + user messages)
    - 'answer': str (ground truth, optional but recommended)
    """
    return raw_data.map(lambda x: {
        'prompt': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': x['question']}
        ],
        'answer': extract_answer(x['raw_answer'])
    })
- def reward_function_name(
    prompts,        # List[List[Dict]]: Original prompts
    completions,    # List[List[Dict]]: Model generations
    answer=None,    # Optional: Ground truth from dataset
    **kwargs        # Additional dataset columns
) -> list[float]:
    """
    Evaluate completions and return rewards.

    Returns: List of floats (one per completion)
    """
    # Extract completion text
    responses = [comp[0]['content'] for comp in completions]

    # Compute rewards
    rewards = []
    for response in responses:
        score = compute_score(response)
        rewards.append(score)

    return rewards

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/grpo-rl-training/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# GRPO/RL Training with TRL Expert-level guidance for implementing Group Relative Policy Optimization (GRPO) using the Transformer Reinforcement Learning (TRL) library. This skill provides battle-tested patterns, critical insights, and production-ready workflows for fine-tuning language models with custom reward functions. ## When to Use This Skill Use GRPO training when you need to: - **Enforce specific output formats** (e.g., XML tags, JSON, structured reasoning) - **Teach verifiable tasks** with objective correctness metrics (math, coding, fact-checking) - **Improve reasoning capabilities** by rewarding chain-of-thought patterns - **Align models to domain-specific behaviors** without labeled preference data - **Optimize for multiple objectives** simultaneously (format + correctness + st

{{input}}
