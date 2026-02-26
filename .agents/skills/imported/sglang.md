# Skill: sglang
Schema: antigrav.skill@v1

```json
{
  "description": "Fast structured generation and serving for LLMs with RadixAttention prefix caching. Use for JSON/regex outputs, constrained decoding, agentic workflows with tool calls, or when you need 5× faster infe",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155428,
  "model": "qwen3:8b",
  "name": "sglang",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "12-inference-serving/sglang/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "agents",
    "ai-research",
    "constrained decoding",
    "fast inference",
    "inference serving",
    "json output",
    "prefix caching",
    "production scale",
    "radixattention",
    "sglang",
    "structured generation"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Fast structured generation and serving for LLMs with RadixAttention prefix caching. Use for JSON/regex outputs, constrained decoding, agentic workflows with tool calls, or when you need 5× faster inference than vLLM with prefix sharing. Powers 300,000+ GPUs at xAI, AMD, NVIDIA, and LinkedIn.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # pip install (recommended)
pip install "sglang[all]"

# With FlashInfer (faster, CUDA 11.8/12.1)
pip install sglang[all] flashinfer -i https://flashinfer.ai/whl/cu121/torch2.4/

# From source
git clone https://github.com/sgl-project/sglang.git
cd sglang
pip install -e "python[all]"
- # Basic server (Llama 3-8B)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-8B-Instruct \
    --port 30000

# With RadixAttention (automatic prefix caching)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-8B-Instruct \
    --port 30000 \
    --enable-radix-cache  # Default: enabled

# Multi-GPU (tensor parallelism)
python -m sglang.launch_server \
    --model-path meta-llama/Meta-Llama-3-70B-Instruct \
    --tp 4 \
    --port 30000
- import sglang as sgl

# Set backend
sgl.set_default_backend(sgl.OpenAI("http://localhost:30000/v1"))

# Simple generation
@sgl.function
def simple_gen(s, question):
    s += "Q: " + question + "\n"
    s += "A:" + sgl.gen("answer", max_tokens=100)

# Run
state = simple_gen.run(question="What is the capital of France?")
print(state["answer"])
# Output: "The capital of France is Paris."

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `12-inference-serving/sglang/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# SGLang High-performance serving framework for LLMs and VLMs with RadixAttention for automatic prefix caching. ## When to use SGLang **Use SGLang when:** - Need structured outputs (JSON, regex, grammar) - Building agents with repeated prefixes (system prompts, tools) - Agentic workflows with function calling - Multi-turn conversations with shared context - Need faster JSON decoding (3× vs standard) **Use vLLM instead when:** - Simple text generation without structure - Don't need prefix caching - Want mature, widely-tested production system **Use TensorRT-LLM instead when:** - Maximum single-request latency (no batching needed) - NVIDIA-only deployment - Need FP8/INT4 quantization on H100 ## Quick start ### Installation ```bash # pip install (recommended) pip install "sglang[all]" # With

{{input}}
