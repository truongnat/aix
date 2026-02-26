# Skill: evaluating-code-models
Schema: antigrav.skill@v1

```json
{
  "description": "Evaluates code generation models across HumanEval, MBPP, MultiPL-E, and 15+ benchmarks with pass@k metrics. Use when benchmarking code models, comparing coding abilities, testing multi-language suppor",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155423,
  "model": "qwen3:8b",
  "name": "evaluating-code-models",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "11-evaluation/bigcode-evaluation-harness/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "benchmarking",
    "bigcode",
    "code generation",
    "code models",
    "evaluation",
    "humaneval",
    "mbpp",
    "multipl-e",
    "pass@k"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Evaluates code generation models across HumanEval, MBPP, MultiPL-E, and 15+ benchmarks with pass@k metrics. Use when benchmarking code models, comparing coding abilities, testing multi-language support, or measuring code generation quality. Industry standard from BigCode Project used by HuggingFace leaderboards.

## When to Use
- Use when the task matches this skill domain.

## Examples
- git clone https://github.com/bigcode-project/bigcode-evaluation-harness.git
cd bigcode-evaluation-harness
pip install -e .
accelerate config
- accelerate launch main.py \
  --model bigcode/starcoder2-7b \
  --tasks humaneval \
  --max_length_generation 512 \
  --temperature 0.2 \
  --n_samples 20 \
  --batch_size 10 \
  --allow_code_execution \
  --save_generations
- python -c "from bigcode_eval.tasks import ALL_TASKS; print(ALL_TASKS)"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `11-evaluation/bigcode-evaluation-harness/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# BigCode Evaluation Harness - Code Model Benchmarking ## Quick Start BigCode Evaluation Harness evaluates code generation models across 15+ benchmarks including HumanEval, MBPP, and MultiPL-E (18 languages). **Installation**: ```bash git clone https://github.com/bigcode-project/bigcode-evaluation-harness.git cd bigcode-evaluation-harness pip install -e . accelerate config ``` **Evaluate on HumanEval**: ```bash accelerate launch main.py \ --model bigcode/starcoder2-7b \ --tasks humaneval \ --max_length_generation 512 \ --temperature 0.2 \ --n_samples 20 \ --batch_size 10 \ --allow_code_execution \ --save_generations ``` **View available tasks**: ```bash python -c "from bigcode_eval.tasks import ALL_TASKS; print(ALL_TASKS)" ``` ## Common Workflows ### Workflow 1: Standard Code Benchmark Eva

{{input}}
