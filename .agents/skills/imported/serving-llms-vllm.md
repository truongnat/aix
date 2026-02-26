# Skill: serving-llms-vllm
Schema: antigrav.skill@v1

```json
{
  "description": "Serves LLMs with high throughput using vLLM's PagedAttention and continuous batching. Use when deploying production LLM APIs, optimizing inference latency/throughput, or serving models with limited GP",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155430,
  "model": "qwen3:8b",
  "name": "serving-llms-vllm",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "12-inference-serving/vllm/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "continuous batching",
    "high throughput",
    "inference serving",
    "openai api",
    "pagedattention",
    "production",
    "quantization",
    "tensor parallelism",
    "vllm"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Serves LLMs with high throughput using vLLM's PagedAttention and continuous batching. Use when deploying production LLM APIs, optimizing inference latency/throughput, or serving models with limited GPU memory. Supports OpenAI-compatible endpoints, quantization (GPTQ/AWQ/FP8), and tensor parallelism.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install vllm
- from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-3-8B-Instruct")
sampling = SamplingParams(temperature=0.7, max_tokens=256)

outputs = llm.generate(["Explain quantum computing"], sampling)
print(outputs[0].outputs[0].text)
- vllm serve meta-llama/Llama-3-8B-Instruct

# Query with OpenAI SDK
python -c "
from openai import OpenAI
client = OpenAI(base_url='http://localhost:8000/v1', api_key='EMPTY')
print(client.chat.completions.create(
    model='meta-llama/Llama-3-8B-Instruct',
    messages=[{'role': 'user', 'content': 'Hello!'}]
).choices[0].message.content)
"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `12-inference-serving/vllm/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# vLLM - High-Performance LLM Serving ## Quick start vLLM achieves 24x higher throughput than standard transformers through PagedAttention (block-based KV cache) and continuous batching (mixing prefill/decode requests). **Installation**: ```bash pip install vllm ``` **Basic offline inference**: ```python from vllm import LLM, SamplingParams llm = LLM(model="meta-llama/Llama-3-8B-Instruct") sampling = SamplingParams(temperature=0.7, max_tokens=256) outputs = llm.generate(["Explain quantum computing"], sampling) print(outputs[0].outputs[0].text) ``` **OpenAI-compatible server**: ```bash vllm serve meta-llama/Llama-3-8B-Instruct # Query with OpenAI SDK python -c " from openai import OpenAI client = OpenAI(base_url='http://localhost:8000/v1', api_key='EMPTY') print(client.chat.completions.crea

{{input}}
