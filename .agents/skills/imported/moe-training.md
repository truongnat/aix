# Skill: moe-training
Schema: antigrav.skill@v1

```json
{
  "description": "Train Mixture of Experts (MoE) models using DeepSpeed or HuggingFace. Use when training large-scale models with limited compute (5× cost reduction vs dense models), implementing sparse architectures l",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155485,
  "model": "qwen3:8b",
  "name": "moe-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "19-emerging-techniques/moe-training/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "deepseek",
    "deepspeed",
    "efficient training",
    "emerging techniques",
    "expert parallelism",
    "load balancing",
    "mixtral",
    "mixture of experts",
    "moe",
    "routing",
    "sparse models"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Train Mixture of Experts (MoE) models using DeepSpeed or HuggingFace. Use when training large-scale models with limited compute (5× cost reduction vs dense models), implementing sparse architectures like Mixtral 8x7B or DeepSeek-V3, or scaling model capacity without proportional compute increase. Covers MoE architectures, routing mechanisms, load balancing, expert parallelism, and inference optimization.

## When to Use
- **Train larger models** with limited compute (5× cost reduction vs dense models)
- **Scale model capacity** without proportional compute increase
- **Achieve better performance** per compute budget than dense models
- **Specialize experts** for different domains/tasks/languages
- **Reduce inference latency** with sparse activation (only 13B/47B params active in Mixtral)
- **Implement SOTA models** like Mixtral 8x7B, DeepSeek-V3, Switch Transformers

## Examples
- # DeepSpeed with MoE support
pip install deepspeed>=0.6.0

# Megatron-DeepSpeed for large-scale training
git clone https://github.com/microsoft/Megatron-DeepSpeed
cd Megatron-DeepSpeed
pip install -r requirements.txt

# Alternative: HuggingFace Transformers
pip install transformers accelerate
- import torch
import torch.nn as nn

class MoELayer(nn.Module):
    """Sparse Mixture of Experts layer."""

    def __init__(self, hidden_size, num_experts=8, top_k=2):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k

        # Expert networks (FFN)
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(hidden_size, 4 * hidden_size),
                nn.GELU(),
                nn.Linear(4 * hidden_size, hidden_size)
            )
            for _ in range(num_experts)
        ])

        # Gating network (router)
        self.gate = nn.Linear(hidden_size, num_experts)

    def forward(self, x):
        # x shape: (batch_size, seq_len, hidden_size)
        batch_size, seq_len, hidden_size = x.shape

        # Flatten for routing
        x_flat = x.view(-1, hidden_size)  # (batch_size * seq_len, hidden_size)

        # Compute gate scores
        gate_logits = self.gate(x_flat)  # (batch_size * seq_len, num_experts)

        # Top-k routing
        gate_scores = torch.softmax(gate_logits, dim=-1)
        topk_scores, topk_indices = torch.topk(gate_scores, self.top_k, dim=-1)

        # Normalize top-k scores
        topk_scores = topk_scores / topk_scores.sum(dim=-1, keepdim=True)

        # Dispatch and combine expert outputs
        output = torch.zeros_like(x_flat)

        for i in range(self.top_k):
            expert_idx = topk_indices[:, i]
            expert_scores = topk_scores[:, i].unsqueeze(-1)

            # Route tokens to experts
            for expert_id in range(self.num_experts):
                mask = (expert_idx == expert_id)
                if mask.any():
                    expert_input = x_flat[mask]
                    expert_output = self.experts[expert_id]\(expert_input\)
                    output[mask] += expert_scores[mask] * expert_output

        # Reshape back
        return output.view(batch_size, seq_len, hidden_size)
- # Training script with MoE
deepspeed pretrain_gpt_moe.py \
  --num-layers 24 \
  --hidden-size 1024 \
  --num-attention-heads 16 \
  --seq-length 2048 \
  --max-position-embeddings 2048 \
  --micro-batch-size 4 \
  --global-batch-size 256 \
  --train-iters 500000 \
  --lr 0.0001 \
  --min-lr 0.00001 \
  --lr-decay-style cosine \
  --num-experts 128 \
  --moe-expert-parallel-size 4 \
  --moe-loss-coeff 0.01 \
  --moe-train-capacity-factor 1.25 \
  --moe-eval-capacity-factor 2.0 \
  --fp16 \
  --deepspeed_config ds_config.json

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `19-emerging-techniques/moe-training/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# MoE Training: Mixture of Experts ## When to Use This Skill Use MoE Training when you need to: - **Train larger models** with limited compute (5× cost reduction vs dense models) - **Scale model capacity** without proportional compute increase - **Achieve better performance** per compute budget than dense models - **Specialize experts** for different domains/tasks/languages - **Reduce inference latency** with sparse activation (only 13B/47B params active in Mixtral) - **Implement SOTA models** like Mixtral 8x7B, DeepSeek-V3, Switch Transformers **Notable MoE Models**: Mixtral 8x7B (Mistral AI), DeepSeek-V3, Switch Transformers (Google), GLaM (Google), NLLB-MoE (Meta) ## Installation ```bash # DeepSpeed with MoE support pip install deepspeed>=0.6.0 # Megatron-DeepSpeed for large-scale train

{{input}}
