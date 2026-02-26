# Skill: rwkv-architecture
Schema: antigrav.skill@v1

```json
{
  "description": "RNN+Transformer hybrid with O(n) inference. Linear time, infinite context, no KV cache. Train like GPT (parallel), infer like RNN (sequential). Linux Foundation AI project. Production at Windows, Offi",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155356,
  "model": "qwen3:8b",
  "name": "rwkv-architecture",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "01-model-architecture/rwkv/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "alternative architecture",
    "efficient inference",
    "infinite context",
    "linear complexity",
    "linux foundation",
    "model architecture",
    "rnn",
    "rwkv",
    "transformer hybrid"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
RNN+Transformer hybrid with O(n) inference. Linear time, infinite context, no KV cache. Train like GPT (parallel), infer like RNN (sequential). Linux Foundation AI project. Production at Windows, Office, NeMo. RWKV-7 (March 2025). Models up to 14B parameters.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Install PyTorch
pip install torch --upgrade --extra-index-url https://download.pytorch.org/whl/cu121

# Install dependencies
pip install pytorch-lightning==1.9.5 deepspeed wandb ninja --upgrade

# Install RWKV
pip install rwkv
- import os
from rwkv.model import RWKV

os.environ["RWKV_JIT_ON"] = '1'
os.environ["RWKV_CUDA_ON"] = '1'  # Use CUDA kernel for speed

# Load model
model = RWKV(
    model='/path/to/RWKV-4-Pile-1B5-20220903-8040',
    strategy='cuda fp16'
)

# GPT mode (parallel processing)
out, state = model.forward([187, 510, 1563, 310, 247], None)
print(out.detach().cpu().numpy())  # Logits

# RNN mode (sequential processing, same result)
out, state = model.forward([187, 510], None)  # First 2 tokens
out, state = model.forward([1563], state)      # Next token
out, state = model.forward([310, 247], state)  # Last tokens
print(out.detach().cpu().numpy())  # Same logits as above!
- from rwkv.model import RWKV
from rwkv.utils import PIPELINE

model = RWKV(model='RWKV-4-Pile-14B-20230313-ctx8192-test1050', strategy='cuda fp16')
pipeline = PIPELINE(model, "20B_tokenizer.json")

# Initial prompt
prompt = "The future of AI is"
state = None

# Generate token by token
for token in prompt:
    out, state = pipeline.model.forward(pipeline.encode(token), state)

# Continue generation
for _ in range(100):
    out, state = pipeline.model.forward(None, state)
    token = pipeline.sample_logits(out)
    print(pipeline.decode(token), end='', flush=True)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `01-model-architecture/rwkv/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# RWKV - Receptance Weighted Key Value ## Quick start RWKV (RwaKuv) combines Transformer parallelization (training) with RNN efficiency (inference). **Installation**: ```bash # Install PyTorch pip install torch --upgrade --extra-index-url https://download.pytorch.org/whl/cu121 # Install dependencies pip install pytorch-lightning==1.9.5 deepspeed wandb ninja --upgrade # Install RWKV pip install rwkv ``` **Basic usage** (GPT mode + RNN mode): ```python import os from rwkv.model import RWKV os.environ["RWKV_JIT_ON"] = '1' os.environ["RWKV_CUDA_ON"] = '1' # Use CUDA kernel for speed # Load model model = RWKV( model='/path/to/RWKV-4-Pile-1B5-20220903-8040', strategy='cuda fp16' ) # GPT mode (parallel processing) out, state = model.forward([187, 510, 1563, 310, 247], None) print(out.detach().cpu

{{input}}
