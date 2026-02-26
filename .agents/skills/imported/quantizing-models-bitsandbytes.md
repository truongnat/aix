# Skill: quantizing-models-bitsandbytes
Schema: antigrav.skill@v1

```json
{
  "description": "Quantizes LLMs to 8-bit or 4-bit for 50-75% memory reduction with minimal accuracy loss. Use when GPU memory is limited, need to fit larger models, or want faster inference. Supports INT8, NF4, FP4 fo",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155413,
  "model": "qwen3:8b",
  "name": "quantizing-models-bitsandbytes",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "10-optimization/bitsandbytes/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "4-bit",
    "8-bit",
    "ai-research",
    "bitsandbytes",
    "efficient inference",
    "huggingface",
    "int8",
    "memory optimization",
    "nf4",
    "optimization",
    "qlora",
    "quantization"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Quantizes LLMs to 8-bit or 4-bit for 50-75% memory reduction with minimal accuracy loss. Use when GPU memory is limited, need to fit larger models, or want faster inference. Supports INT8, NF4, FP4 formats, QLoRA training, and 8-bit optimizers. Works with HuggingFace Transformers.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install bitsandbytes transformers accelerate
- from transformers import AutoModelForCausalLM, BitsAndBytesConfig

config = BitsAndBytesConfig(load_in_8bit=True)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=config,
    device_map="auto"
)

# Memory: 14GB → 7GB
- config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=config,
    device_map="auto"
)

# Memory: 14GB → 3.5GB

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `10-optimization/bitsandbytes/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# bitsandbytes - LLM Quantization ## Quick start bitsandbytes reduces LLM memory by 50% (8-bit) or 75% (4-bit) with <1% accuracy loss. **Installation**: ```bash pip install bitsandbytes transformers accelerate ``` **8-bit quantization** (50% memory reduction): ```python from transformers import AutoModelForCausalLM, BitsAndBytesConfig config = BitsAndBytesConfig(load_in_8bit=True) model = AutoModelForCausalLM.from_pretrained( "meta-llama/Llama-2-7b-hf", quantization_config=config, device_map="auto" ) # Memory: 14GB → 7GB ``` **4-bit quantization** (75% memory reduction): ```python config = BitsAndBytesConfig( load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16 ) model = AutoModelForCausalLM.from_pretrained( "meta-llama/Llama-2-7b-hf", quantization_config=config, device_map="auto" ) # M

{{input}}
