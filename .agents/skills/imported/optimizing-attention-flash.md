# Skill: optimizing-attention-flash
Schema: antigrav.skill@v1

```json
{
  "description": "Optimizes transformer attention with Flash Attention for 2-4x speedup and 10-20x memory reduction. Use when training/running transformers with long sequences (>512 tokens), encountering GPU memory iss",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155414,
  "model": "qwen3:8b",
  "name": "optimizing-attention-flash",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "10-optimization/flash-attention/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "attention optimization",
    "flash attention",
    "fp8",
    "h100",
    "long context",
    "memory efficiency",
    "optimization",
    "pytorch",
    "sdpa",
    "speed optimization",
    "transformers"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Optimizes transformer attention with Flash Attention for 2-4x speedup and 10-20x memory reduction. Use when training/running transformers with long sequences (>512 tokens), encountering GPU memory issues with attention, or need faster inference. Supports PyTorch native SDPA, flash-attn library, H100 FP8, and sliding window attention.

## When to Use
- Use when the task matches this skill domain.

## Examples
- import torch
import torch.nn.functional as F

q = torch.randn(2, 8, 512, 64, device='cuda', dtype=torch.float16)  # [batch, heads, seq, dim]
k = torch.randn(2, 8, 512, 64, device='cuda', dtype=torch.float16)
v = torch.randn(2, 8, 512, 64, device='cuda', dtype=torch.float16)

# Automatically uses Flash Attention if available
out = F.scaled_dot_product_attention(q, k, v)
- pip install flash-attn --no-build-isolation
- from flash_attn import flash_attn_func

# q, k, v: [batch, seqlen, nheads, headdim]
out = flash_attn_func(q, k, v, dropout_p=0.0, causal=True)

## Limitations
- <512 tokens: Minimal speedup (10-20%)
- 512-2K tokens: 2-3x speedup
- >2K tokens: 3-4x speedup

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `10-optimization/flash-attention/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Flash Attention - Fast Memory-Efficient Attention ## Quick start Flash Attention provides 2-4x speedup and 10-20x memory reduction for transformer attention through IO-aware tiling and recomputation. **PyTorch native (easiest, PyTorch 2.2+)**: ```python import torch import torch.nn.functional as F q = torch.randn(2, 8, 512, 64, device='cuda', dtype=torch.float16) # [batch, heads, seq, dim] k = torch.randn(2, 8, 512, 64, device='cuda', dtype=torch.float16) v = torch.randn(2, 8, 512, 64, device='cuda', dtype=torch.float16) # Automatically uses Flash Attention if available out = F.scaled_dot_product_attention(q, k, v) ``` **flash-attn library (more features)**: ```bash pip install flash-attn --no-build-isolation ``` ```python from flash_attn import flash_attn_func # q, k, v: [batch, seqlen,

{{input}}
