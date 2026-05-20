# Skill: skypilot-multi-cloud-orchestration
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "Multi-cloud orchestration for ML workloads with automatic cost optimization. Use when you need to run training or batch jobs across multiple clouds, leverage spot instances with auto-recovery, or opti",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155411,
  "model": "qwen3:8b",
  "name": "skypilot-multi-cloud-orchestration",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "09-infrastructure/skypilot/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "cloud",
    "cost optimization",
    "external",
    "gpu",
    "imported",
    "infrastructure",
    "multi",
    "multi-cloud",
    "orchestration",
    "rag",
    "skypilot"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Multi-cloud orchestration for ML workloads with automatic cost optimization. Use when you need to run training or batch jobs across multiple clouds, leverage spot instances with auto-recovery, or optimize GPU costs across providers.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install "skypilot[aws,gcp,azure,kubernetes]"

# Verify cloud credentials
sky check
- resources:
  accelerators: T4:1

run: |
  nvidia-smi
  echo "Hello from SkyPilot!"
- sky launch -c hello hello.yaml

# SSH to cluster
ssh hello

# Terminate
sky down hello

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `09-infrastructure/skypilot/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# SkyPilot Multi-Cloud Orchestration Comprehensive guide to running ML workloads across clouds with automatic cost optimization using SkyPilot. ## When to use SkyPilot **Use SkyPilot when:** - Running ML workloads across multiple clouds (AWS, GCP, Azure, etc.) - Need cost optimization with automatic cloud/region selection - Running long jobs on spot instances with auto-recovery - Managing distributed multi-node training - Want unified interface for 20+ cloud providers - Need to avoid vendor lock-in **Key features:** - **Multi-cloud**: AWS, GCP, Azure, Kubernetes, Lambda, RunPod, 20+ providers - **Cost optimization**: Automatic cheapest cloud/region selection - **Spot instances**: 3-6x cost savings with automatic recovery - **Distributed training**: Multi-node jobs with gang scheduling - **

{{input}}
