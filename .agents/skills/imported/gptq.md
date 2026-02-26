# Skill: gptq
Schema: antigrav.skill@v1

```json
{
  "description": "Post-training 4-bit quantization for LLMs with minimal accuracy loss. Use for deploying large models (70B, 405B) on consumer GPUs, when you need 4× memory reduction with <2% perplexity degradation, or",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155417,
  "model": "qwen3:8b",
  "name": "gptq",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "10-optimization/gptq/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "4-bit",
    "ai-research",
    "consumer gpus",
    "fast inference",
    "gptq",
    "group-wise quantization",
    "memory optimization",
    "optimization",
    "post-training",
    "qlora",
    "quantization"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Post-training 4-bit quantization for LLMs with minimal accuracy loss. Use for deploying large models (70B, 405B) on consumer GPUs, when you need 4× memory reduction with <2% perplexity degradation, or for faster inference (3-4× speedup) vs FP16. Integrates with transformers and PEFT for QLoRA fine-tuning.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Install AutoGPTQ
pip install auto-gptq

# With Triton (Linux only, faster)
pip install auto-gptq[triton]

# With CUDA extensions (faster)
pip install auto-gptq --no-build-isolation

# Full installation
pip install auto-gptq transformers accelerate
- from transformers import AutoTokenizer
from auto_gptq import AutoGPTQForCausalLM

# Load quantized model from HuggingFace
model_name = "TheBloke/Llama-2-7B-Chat-GPTQ"

model = AutoGPTQForCausalLM.from_quantized(
    model_name,
    device="cuda:0",
    use_triton=False  # Set True on Linux for speed
)

tokenizer = AutoTokenizer.from_pretrained(model_name)

# Generate
prompt = "Explain quantum computing"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda:0")
outputs = model.generate(**inputs, max_new_tokens=200)
print(tokenizer.decode(outputs[0]))
- from transformers import AutoTokenizer
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from datasets import load_dataset

# Load model
model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Quantization config
quantize_config = BaseQuantizeConfig(
    bits=4,              # 4-bit quantization
    group_size=128,      # Group size (recommended: 128)
    desc_act=False,      # Activation order (False for CUDA kernel)
    damp_percent=0.01    # Dampening factor
)

# Load model for quantization
model = AutoGPTQForCausalLM.from_pretrained(
    model_name,
    quantize_config=quantize_config
)

# Prepare calibration data
dataset = load_dataset("c4", split="train", streaming=True)
calibration_data = [
    tokenizer(example["text"])["input_ids"][:512]
    for example in dataset.take(128)
]

# Quantize
model.quantize(calibration_data)

# Save quantized model
model.save_quantized("llama-2-7b-gptq")
tokenizer.save_pretrained("llama-2-7b-gptq")

# Push to HuggingFace
model.push_to_hub("username/llama-2-7b-gptq")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `10-optimization/gptq/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# GPTQ (Generative Pre-trained Transformer Quantization) Post-training quantization method that compresses LLMs to 4-bit with minimal accuracy loss using group-wise quantization. ## When to use GPTQ **Use GPTQ when:** - Need to fit large models (70B+) on limited GPU memory - Want 4× memory reduction with <2% accuracy loss - Deploying on consumer GPUs (RTX 4090, 3090) - Need faster inference (3-4× speedup vs FP16) **Use AWQ instead when:** - Need slightly better accuracy (<1% loss) - Have newer GPUs (Ampere, Ada) - Want Marlin kernel support (2× faster on some GPUs) **Use bitsandbytes instead when:** - Need simple integration with transformers - Want 8-bit quantization (less compression, better quality) - Don't need pre-quantized model files ## Quick start ### Installation ```bash # Install

{{input}}
