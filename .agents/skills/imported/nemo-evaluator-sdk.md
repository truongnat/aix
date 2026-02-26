# Skill: nemo-evaluator-sdk
Schema: antigrav.skill@v1

```json
{
  "description": "Evaluates LLMs across 100+ benchmarks from 18+ harnesses (MMLU, HumanEval, GSM8K, safety, VLM) with multi-backend execution. Use when needing scalable evaluation on local Docker, Slurm HPC, or cloud p",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155426,
  "model": "qwen3:8b",
  "name": "nemo-evaluator-sdk",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "11-evaluation/nemo-evaluator/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "benchmarking",
    "docker",
    "enterprise",
    "evaluation",
    "humaneval",
    "mmlu",
    "multi-backend",
    "nemo",
    "nvidia",
    "reproducible",
    "slurm"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Evaluates LLMs across 100+ benchmarks from 18+ harnesses (MMLU, HumanEval, GSM8K, safety, VLM) with multi-backend execution. Use when needing scalable evaluation on local Docker, Slurm HPC, or cloud platforms. NVIDIA's enterprise-grade platform with container-first architecture for reproducible benchmarking.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install nemo-evaluator-launcher
- export NGC_API_KEY=nvapi-your-key-here

# Create minimal config
cat > config.yaml << 'EOF'
defaults:
  - execution: local
  - deployment: none
  - _self_

execution:
  output_dir: ./results

target:
  api_endpoint:
    model_id: meta/llama-3.1-8b-instruct
    url: https://integrate.api.nvidia.com/v1/chat/completions
    api_key_name: NGC_API_KEY

evaluation:
  tasks:
    - name: ifeval
EOF

# Run evaluation
nemo-evaluator-launcher run --config-dir . --config-name config
- nemo-evaluator-launcher ls tasks

## Limitations
- name: gpqa_diamond

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `11-evaluation/nemo-evaluator/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# NeMo Evaluator SDK - Enterprise LLM Benchmarking ## Quick Start NeMo Evaluator SDK evaluates LLMs across 100+ benchmarks from 18+ harnesses using containerized, reproducible evaluation with multi-backend execution (local Docker, Slurm HPC, Lepton cloud). **Installation**: ```bash pip install nemo-evaluator-launcher ``` **Set API key and run evaluation**: ```bash export NGC_API_KEY=nvapi-your-key-here # Create minimal config cat > config.yaml << 'EOF' defaults: - execution: local - deployment: none - _self_ execution: output_dir: ./results target: api_endpoint: model_id: meta/llama-3.1-8b-instruct url: https://integrate.api.nvidia.com/v1/chat/completions api_key_name: NGC_API_KEY evaluation: tasks: - name: ifeval EOF # Run evaluation nemo-evaluator-launcher run --config-dir . --config-nam

{{input}}
