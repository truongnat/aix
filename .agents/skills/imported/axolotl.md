# Skill: axolotl
Schema: antigrav.skill@v1

```json
{
  "description": "Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155361,
  "model": "qwen3:8b",
  "name": "axolotl",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "03-fine-tuning/axolotl/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "axolotl",
    "deepspeed",
    "dpo",
    "fine-tuning",
    "grpo",
    "huggingface",
    "kto",
    "llm",
    "lora",
    "multimodal",
    "orpo",
    "qlora",
    "yaml"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support

## When to Use
- Working with axolotl
- Asking about axolotl features or APIs
- Implementing axolotl solutions
- Debugging axolotl code
- Learning axolotl best practices

## Examples
- ./build/all_reduce_perf -b 8 -e 128M -f 2 -g 3
- fsdp_version: 2
fsdp_config:
  offload_params: true
  state_dict_type: FULL_STATE_DICT
  auto_wrap_policy: TRANSFORMER_BASED_WRAP
  transformer_layer_cls_to_wrap: LlamaDecoderLayer
  reshard_after_forward: true
- context_parallel_size

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `03-fine-tuning/axolotl/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Axolotl Skill Comprehensive assistance with axolotl development, generated from official documentation. ## When to Use This Skill This skill should be triggered when: - Working with axolotl - Asking about axolotl features or APIs - Implementing axolotl solutions - Debugging axolotl code - Learning axolotl best practices ## Quick Reference ### Common Patterns **Pattern 1:** To validate that acceptable data transfer speeds exist for your training job, running NCCL Tests can help pinpoint bottlenecks, for example: ``` ./build/all_reduce_perf -b 8 -e 128M -f 2 -g 3 ``` **Pattern 2:** Configure your model to use FSDP in the Axolotl yaml. For example: ``` fsdp_version: 2 fsdp_config: offload_params: true state_dict_type: FULL_STATE_DICT auto_wrap_policy: TRANSFORMER_BASED_WRAP transformer_laye

{{input}}
