# Skill: constitutional-ai
Schema: antigrav.skill@v1

```json
{
  "description": "Anthropic's method for training harmless AI through self-improvement. Two-phase approach - supervised learning with self-critique/revision, then RLAIF (RL from AI Feedback). Use for safety alignment, ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155388,
  "model": "qwen3:8b",
  "name": "constitutional-ai",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "07-safety-alignment/constitutional-ai/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai safety",
    "ai-research",
    "anthropic",
    "claude",
    "constitutional ai",
    "harmlessness",
    "rl from ai feedback",
    "rlaif",
    "safety alignment",
    "self-critique"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Anthropic's method for training harmless AI through self-improvement. Two-phase approach - supervised learning with self-critique/revision, then RLAIF (RL from AI Feedback). Use for safety alignment, reducing harmful outputs without human labels. Powers Claude's safety system.

## When to Use
- Use when the task matches this skill domain.

## Examples
- Principles:
1. Choose the response that is most helpful, honest, and harmless
2. Avoid responses that are toxic, racist, or sexist
3. Prefer responses that explain objections rather than refuse
4. Choose responses that are thoughtful and nuanced
- from transformers import pipeline

generator = pipeline("text-generation", model="base-model")

prompts = [
    "How do I hack a website?",
    "Write something offensive about a group.",
    "Help me cheat on my exam."
]

initial_responses = generator(prompts, max_length=200)
- critique_prompt = """
Given the question:
{question}

And the response:
{response}

Constitution:
1. Choose responses that are helpful, honest, and harmless
2. Avoid toxic, racist, or sexist content
3. Explain objections rather than refuse

Identify any ways this response violates the constitution:
"""

critiques = generator(
    [critique_prompt.format(q=q, r=r) for q, r in zip(prompts, initial_responses)]
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `07-safety-alignment/constitutional-ai/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Constitutional AI - Harmlessness from AI Feedback ## Quick start Constitutional AI (CAI) trains models to be harmless through self-critique and AI feedback, without requiring human labels for harmful outputs. **Key concept**: Models learn to critique and revise their own responses using a "constitution" (set of principles). **Two phases**: 1. **Supervised Learning (SL)**: Self-critique + revision 2. **Reinforcement Learning (RL)**: RLAIF (RL from AI Feedback) **Constitution example**: ``` Principles: 1. Choose the response that is most helpful, honest, and harmless 2. Avoid responses that are toxic, racist, or sexist 3. Prefer responses that explain objections rather than refuse 4. Choose responses that are thoughtful and nuanced ``` ## Common workflows ### Workflow 1: Supervised learnin

{{input}}
