# Skill: hqq-quantization
Schema: antigrav.skill@v1

```json
{
  "description": "Half-Quadratic Quantization for LLMs without calibration data. Use when quantizing models to 4/3/2-bit precision without needing calibration datasets, for fast quantization workflows, or when deployin",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155420,
  "model": "qwen3:8b",
  "name": "hqq-quantization",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "10-optimization/hqq/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "hqq",
    "inference",
    "memory efficiency",
    "model compression",
    "optimization",
    "quantization"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Half-Quadratic Quantization for LLMs without calibration data. Use when quantizing models to 4/3/2-bit precision without needing calibration datasets, for fast quantization workflows, or when deploying with vLLM or HuggingFace Transformers.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install hqq

# With specific backend
pip install hqq[torch]      # PyTorch backend
pip install hqq[torchao]    # TorchAO int4 backend
pip install hqq[bitblas]    # BitBlas backend
pip install hqq[marlin]     # Marlin backend
- from hqq.core.quantize import BaseQuantizeConfig, HQQLinear
import torch.nn as nn

# Configure quantization
config = BaseQuantizeConfig(
    nbits=4,           # 4-bit quantization
    group_size=64,     # Group size for quantization
    axis=1             # Quantize along output dimension
)

# Quantize a linear layer
linear = nn.Linear(4096, 4096)
hqq_linear = HQQLinear(linear, config)

# Use normally
output = hqq_linear(input_tensor)
- from transformers import AutoModelForCausalLM, HqqConfig

# Configure HQQ
quantization_config = HqqConfig(
    nbits=4,
    group_size=64,
    axis=1
)

# Load and quantize
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=quantization_config,
    device_map="auto"
)

# Model is quantized and ready to use

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `10-optimization/hqq/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# HQQ - Half-Quadratic Quantization Fast, calibration-free weight quantization supporting 8/4/3/2/1-bit precision with multiple optimized backends. ## When to use HQQ **Use HQQ when:** - Quantizing models without calibration data (no dataset needed) - Need fast quantization (minutes vs hours for GPTQ/AWQ) - Deploying with vLLM or HuggingFace Transformers - Fine-tuning quantized models with LoRA/PEFT - Experimenting with extreme quantization (2-bit, 1-bit) **Key advantages:** - **No calibration**: Quantize any model instantly without sample data - **Multiple backends**: PyTorch, ATEN, TorchAO, Marlin, BitBlas for optimized inference - **Flexible precision**: 8/4/3/2/1-bit with configurable group sizes - **Framework integration**: Native HuggingFace and vLLM support - **PEFT compatible**: Fi

{{input}}
