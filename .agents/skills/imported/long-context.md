# Skill: long-context
Schema: antigrav.skill@v1

```json
{
  "description": "Extend context windows of transformer models using RoPE, YaRN, ALiBi, and position interpolation techniques. Use when processing long documents (32k-128k+ tokens), extending pre-trained models beyond ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155480,
  "model": "qwen3:8b",
  "name": "long-context",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "19-emerging-techniques/long-context/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "alibi",
    "attention bias",
    "context extension",
    "emerging techniques",
    "extended context",
    "long context",
    "position interpolation",
    "positional encoding",
    "rope",
    "rotary embeddings",
    "yarn"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Extend context windows of transformer models using RoPE, YaRN, ALiBi, and position interpolation techniques. Use when processing long documents (32k-128k+ tokens), extending pre-trained models beyond original context limits, or implementing efficient positional encodings. Covers rotary embeddings, attention biases, interpolation methods, and extrapolation strategies for LLMs.

## When to Use
- **Process long documents** (32k, 64k, 128k+ tokens) with transformer models
- **Extend context windows** of pre-trained models (LLaMA, Mistral, etc.)
- **Implement efficient positional encodings** (RoPE, ALiBi)
- **Train models** with length extrapolation capabilities
- **Deploy models** that handle variable-length inputs efficiently
- **Fine-tune** existing models for longer contexts with minimal compute

## Examples
- # HuggingFace Transformers (includes RoPE, YaRN support)
pip install transformers torch

# For custom implementations
pip install einops  # Tensor operations
pip install rotary-embedding-torch  # Standalone RoPE

# Optional: FlashAttention for efficiency
pip install flash-attn --no-build-isolation
- import torch
import torch.nn as nn

class RotaryEmbedding(nn.Module):
    """Rotary Position Embeddings (RoPE)."""

    def __init__(self, dim, max_seq_len=8192, base=10000):
        super().__init__()
        # Compute inverse frequencies
        inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer("inv_freq", inv_freq)
        self.max_seq_len = max_seq_len

    def forward(self, seq_len, device):
        # Position indices
        t = torch.arange(seq_len, device=device).type_as(self.inv_freq)

        # Compute frequencies
        freqs = torch.outer(t, self.inv_freq)  # (seq_len, dim/2)

        # Compute sin and cos
        emb = torch.cat((freqs, freqs), dim=-1)  # (seq_len, dim)
        return emb.cos(), emb.sin()

def rotate_half(x):
    """Rotate half the hidden dimensions."""
    x1, x2 = x.chunk(2, dim=-1)
    return torch.cat((-x2, x1), dim=-1)

def apply_rotary_pos_emb(q, k, cos, sin):
    """Apply rotary embeddings to queries and keys."""
    # q, k shape: (batch, heads, seq_len, dim)
    q_embed = (q * cos) + (rotate_half(q) * sin)
    k_embed = (k * cos) + (rotate_half(k) * sin)
    return q_embed, k_embed

# Usage
rope = RotaryEmbedding(dim=64, max_seq_len=8192)
cos, sin = rope(seq_len=2048, device='cuda')

# In attention layer
q_rotated, k_rotated = apply_rotary_pos_emb(query, key, cos, sin)
- def get_alibi_slopes(num_heads):
    """Get ALiBi slope values for each attention head."""
    def get_slopes_power_of_2(n):
        start = 2 ** (-(2 ** -(math.log2(n) - 3)))
        ratio = start
        return [start * (ratio ** i) for i in range(n)]

    if math.log2(num_heads).is_integer():
        return get_slopes_power_of_2(num_heads)
    else:
        # Closest power of 2
        closest_power = 2 ** math.floor(math.log2(num_heads))
        slopes = get_slopes_power_of_2(closest_power)
        # Add extra slopes
        extra = get_slopes_power_of_2(2 * closest_power)
        slopes.extend(extra[0::2][:num_heads - closest_power])
        return slopes

def create_alibi_bias(seq_len, num_heads):
    """Create ALiBi attention bias."""
    # Distance matrix
    context_position = torch.arange(seq_len)
    memory_position = torch.arange(seq_len)
    relative_position = memory_position[None, :] - context_position[:, None]

    # Get slopes
    slopes = torch.tensor(get_alibi_slopes(num_heads))

    # Apply slopes to distances
    alibi = slopes[:, None, None] * relative_position[None, :, :]
    return alibi  # (num_heads, seq_len, seq_len)

# Usage in attention
num_heads = 8
seq_len = 2048
alibi_bias = create_alibi_bias(seq_len, num_heads).to('cuda')

# Add bias to attention scores
# attn_scores shape: (batch, num_heads, seq_len, seq_len)
attn_scores = attn_scores + alibi_bias
attn_weights = torch.softmax(attn_scores, dim=-1)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `19-emerging-techniques/long-context/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Long Context: Extending Transformer Context Windows ## When to Use This Skill Use Long Context techniques when you need to: - **Process long documents** (32k, 64k, 128k+ tokens) with transformer models - **Extend context windows** of pre-trained models (LLaMA, Mistral, etc.) - **Implement efficient positional encodings** (RoPE, ALiBi) - **Train models** with length extrapolation capabilities - **Deploy models** that handle variable-length inputs efficiently - **Fine-tune** existing models for longer contexts with minimal compute **Key Techniques**: RoPE (Rotary Position Embeddings), YaRN, ALiBi (Attention with Linear Biases), Position Interpolation **Papers**: RoFormer (arXiv 2104.09864), YaRN (arXiv 2309.00071), ALiBi (arXiv 2108.12409), Position Interpolation (arXiv 2306.15595) ## Inst

{{input}}
