# Skill: evaluating-llms-harness
Schema: antigrav.skill@v1

```json
{
  "description": "Evaluates LLMs across 60+ academic benchmarks (MMLU, HumanEval, GSM8K, TruthfulQA, HellaSwag). Use when benchmarking model quality, comparing models, reporting academic results, or tracking training p",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155424,
  "model": "qwen3:8b",
  "name": "evaluating-llms-harness",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "11-evaluation/lm-evaluation-harness/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "academic benchmarks",
    "ai-research",
    "benchmarking",
    "eleutherai",
    "evaluating",
    "evaluation",
    "external",
    "gsm8k",
    "harness",
    "humaneval",
    "imported",
    "industry standard",
    "llms",
    "lm evaluation harness",
    "mmlu",
    "model quality"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Evaluates LLMs across 60+ academic benchmarks (MMLU, HumanEval, GSM8K, TruthfulQA, HellaSwag). Use when benchmarking model quality, comparing models, reporting academic results, or tracking training progress. Industry standard used by EleutherAI, HuggingFace, and major labs. Supports HuggingFace, vLLM, APIs.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install lm-eval
- lm_eval --model hf \
  --model_args pretrained=meta-llama/Llama-2-7b-hf \
  --tasks mmlu,gsm8k,hellaswag \
  --device cuda:0 \
  --batch_size 8
- lm_eval --tasks list

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `11-evaluation/lm-evaluation-harness/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# lm-evaluation-harness - LLM Benchmarking ## Quick start lm-evaluation-harness evaluates LLMs across 60+ academic benchmarks using standardized prompts and metrics. **Installation**: ```bash pip install lm-eval ``` **Evaluate any HuggingFace model**: ```bash lm_eval --model hf \ --model_args pretrained=meta-llama/Llama-2-7b-hf \ --tasks mmlu,gsm8k,hellaswag \ --device cuda:0 \ --batch_size 8 ``` **View available tasks**: ```bash lm_eval --tasks list ``` ## Common workflows ### Workflow 1: Standard benchmark evaluation Evaluate model on core benchmarks (MMLU, GSM8K, HumanEval). Copy this checklist: ``` Benchmark Evaluation: - [ ] Step 1: Choose benchmark suite - [ ] Step 2: Configure model - [ ] Step 3: Run evaluation - [ ] Step 4: Analyze results ``` **Step 1: Choose benchmark suite** **C

{{input}}
