# Skill: awq-quantization
Schema: antigrav.skill@v1

```json
{
  "description": "Activation-aware weight quantization for 4-bit LLM compression with 3x speedup and minimal accuracy loss. Use when deploying large models (7B-70B) on limited GPU memory, when you need faster inference",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155412,
  "model": "qwen3:8b",
  "name": "awq-quantization",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "10-optimization/awq/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "4-bit",
    "activation-aware",
    "ai-research",
    "awq",
    "fast inference",
    "marlin kernels",
    "memory optimization",
    "optimization",
    "quantization",
    "vllm integration"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Activation-aware weight quantization for 4-bit LLM compression with 3x speedup and minimal accuracy loss. Use when deploying large models (7B-70B) on limited GPU memory, when you need faster inference than GPTQ with better accuracy preservation, or for instruction-tuned and multimodal models. MLSys 2024 Best Paper Award winner.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Default (Triton kernels)
pip install autoawq

# With optimized CUDA kernels + Flash Attention
pip install autoawq[kernels]

# Intel CPU/XPU optimization
pip install autoawq[cpu]
- from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_name = "TheBloke/Mistral-7B-Instruct-v0.2-AWQ"

model = AutoAWQForCausalLM.from_quantized(
    model_name,
    fuse_layers=True  # Enable fused attention for speed
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Generate
inputs = tokenizer("Explain quantum computing", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=200)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
- from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_path = "mistralai/Mistral-7B-Instruct-v0.2"

# Load model and tokenizer
model = AutoAWQForCausalLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Quantization config
quant_config = {
    "zero_point": True,      # Use zero-point quantization
    "q_group_size": 128,     # Group size (128 recommended)
    "w_bit": 4,              # 4-bit weights
    "version": "GEMM"        # GEMM for batch, GEMV for single-token
}

# Quantize (uses pileval dataset by default)
model.quantize(tokenizer, quant_config=quant_config)

# Save
model.save_quantized("mistral-7b-awq")
tokenizer.save_pretrained("mistral-7b-awq")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `10-optimization/awq/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# AWQ (Activation-aware Weight Quantization) 4-bit quantization that preserves salient weights based on activation patterns, achieving 3x speedup with minimal accuracy loss. ## When to use AWQ **Use AWQ when:** - Need 4-bit quantization with <5% accuracy loss - Deploying instruction-tuned or chat models (AWQ generalizes better) - Want ~2.5-3x inference speedup over FP16 - Using vLLM for production serving - Have Ampere+ GPUs (A100, H100, RTX 40xx) for Marlin kernel support **Use GPTQ instead when:** - Need maximum ecosystem compatibility (more tools support GPTQ) - Working with ExLlamaV2 backend specifically - Have older GPUs without Marlin support **Use bitsandbytes instead when:** - Need zero calibration overhead (quantize on-the-fly) - Want to fine-tune with QLoRA - Prefer simpler integ

{{input}}
