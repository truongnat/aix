# Skill: speculative-decoding
Schema: antigrav.skill@v1

```json
{
  "description": "Accelerate LLM inference using speculative decoding, Medusa multiple heads, and lookahead decoding techniques. Use when optimizing inference speed (1.5-3.6× speedup), reducing latency for real-time ap",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155490,
  "model": "qwen3:8b",
  "name": "speculative-decoding",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "19-emerging-techniques/speculative-decoding/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "draft models",
    "emerging techniques",
    "fast inference",
    "inference optimization",
    "latency reduction",
    "lookahead decoding",
    "medusa",
    "parallel generation",
    "speculative decoding",
    "tree attention"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Accelerate LLM inference using speculative decoding, Medusa multiple heads, and lookahead decoding techniques. Use when optimizing inference speed (1.5-3.6× speedup), reducing latency for real-time applications, or deploying models with limited compute. Covers draft models, tree-based attention, Jacobi iteration, parallel token generation, and production deployment strategies.

## When to Use
- **Speed up inference** by 1.5-3.6× without quality loss
- **Reduce latency** for real-time applications (chatbots, code generation)
- **Optimize throughput** for high-volume serving
- **Deploy efficiently** on limited hardware
- **Generate faster** without changing model architecture

## Examples
- # Standard speculative decoding (transformers)
pip install transformers accelerate

# Medusa (multiple decoding heads)
git clone https://github.com/FasterDecoding/Medusa
cd Medusa
pip install -e .

# Lookahead Decoding
git clone https://github.com/hao-ai-lab/LookaheadDecoding
cd LookaheadDecoding
pip install -e .

# Optional: vLLM with speculative decoding
pip install vllm
- from transformers import AutoModelForCausalLM, AutoTokenizer

# Load target model (large, slow)
target_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    device_map="auto",
    torch_dtype=torch.float16
)

# Load draft model (small, fast)
draft_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    device_map="auto",
    torch_dtype=torch.float16
)

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-70b-hf")

# Generate with speculative decoding
prompt = "Explain quantum computing in simple terms:"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

# Transformers 4.36+ supports assisted generation
outputs = target_model.generate(
    **inputs,
    assistant_model=draft_model,  # Enable speculative decoding
    max_new_tokens=256,
    do_sample=True,
    temperature=0.7,
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
- from medusa.model.medusa_model import MedusaModel

# Load Medusa-enhanced model
model = MedusaModel.from_pretrained(
    "FasterDecoding/medusa-vicuna-7b-v1.3",  # Pre-trained with Medusa heads
    torch_dtype=torch.float16,
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained("FasterDecoding/medusa-vicuna-7b-v1.3")

# Generate with Medusa (2-3× speedup)
prompt = "Write a Python function to calculate fibonacci numbers:"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

outputs = model.medusa_generate(
    **inputs,
    max_new_tokens=256,
    temperature=0.7,
    posterior_threshold=0.09,  # Acceptance threshold
    posterior_alpha=0.3,       # Tree construction parameter
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `19-emerging-techniques/speculative-decoding/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Speculative Decoding: Accelerating LLM Inference ## When to Use This Skill Use Speculative Decoding when you need to: - **Speed up inference** by 1.5-3.6× without quality loss - **Reduce latency** for real-time applications (chatbots, code generation) - **Optimize throughput** for high-volume serving - **Deploy efficiently** on limited hardware - **Generate faster** without changing model architecture **Key Techniques**: Draft model speculative decoding, Medusa (multiple heads), Lookahead Decoding (Jacobi iteration) **Papers**: Medusa (arXiv 2401.10774), Lookahead Decoding (ICML 2024), Speculative Decoding Survey (ACL 2024) ## Installation ```bash # Standard speculative decoding (transformers) pip install transformers accelerate # Medusa (multiple decoding heads) git clone https://github

{{input}}
