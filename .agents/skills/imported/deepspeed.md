# Skill: deepspeed
Schema: antigrav.skill@v1

```json
{
  "description": "Expert guidance for distributed training with DeepSpeed - ZeRO optimization stages, pipeline parallelism, FP16/BF16/FP8, 1-bit Adam, sparse attention",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155393,
  "model": "qwen3:8b",
  "name": "deepspeed",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "08-distributed-training/deepspeed/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "deepspeed",
    "distributed training",
    "fp16",
    "fp8",
    "large-scale training",
    "microsoft",
    "mixed precision",
    "optimization",
    "pipeline parallelism",
    "zero"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Expert guidance for distributed training with DeepSpeed - ZeRO optimization stages, pipeline parallelism, FP16/BF16/FP8, 1-bit Adam, sparse attention

## When to Use
- Working with deepspeed
- Asking about deepspeed features or APIs
- Implementing deepspeed solutions
- Debugging deepspeed code
- Learning deepspeed best practices

## Examples
- libaio
- megatron/model/
- --mos

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `08-distributed-training/deepspeed/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Deepspeed Skill Comprehensive assistance with deepspeed development, generated from official documentation. ## When to Use This Skill This skill should be triggered when: - Working with deepspeed - Asking about deepspeed features or APIs - Implementing deepspeed solutions - Debugging deepspeed code - Learning deepspeed best practices ## Quick Reference ### Common Patterns **Pattern 1:** DeepNVMe Contents Requirements Creating DeepNVMe Handles Using DeepNVMe Handles Blocking File Write Non-Blocking File Write Parallel File Write Pinned Tensors Putting it together Acknowledgements Appendix Advanced Handle Creation Performance Tuning DeepNVMe APIs General I/O APIs GDS-specific APIs Handle Settings APIs This tutorial will show how to use DeepNVMe for data transfers between persistent storage

{{input}}
