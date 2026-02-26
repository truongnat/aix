# Skill: knowledge-distillation
Schema: antigrav.skill@v1

```json
{
  "description": "Compress large language models using knowledge distillation from teacher to student models. Use when deploying smaller models with retained performance, transferring GPT-4 capabilities to open-source ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155478,
  "model": "qwen3:8b",
  "name": "knowledge-distillation",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "19-emerging-techniques/knowledge-distillation/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "emerging techniques",
    "knowledge distillation",
    "logit distillation",
    "minillm",
    "model compression",
    "model transfer",
    "reverse kld",
    "soft targets",
    "teacher-student",
    "temperature scaling"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Compress large language models using knowledge distillation from teacher to student models. Use when deploying smaller models with retained performance, transferring GPT-4 capabilities to open-source models, or reducing inference costs. Covers temperature scaling, soft targets, reverse KLD, logit distillation, and MiniLLM training strategies.

## When to Use
- **Compress models** from 70B → 7B while retaining 90%+ performance
- **Transfer capabilities** from proprietary models (GPT-4) to open-source (LLaMA, Mistral)
- **Reduce inference costs** by deploying smaller student models
- **Create specialized models** by distilling domain-specific knowledge
- **Improve small models** using synthetic data from large teachers

## Examples
- # Standard transformers
pip install transformers datasets accelerate

# For training
pip install torch deepspeed wandb

# Optional: MiniLLM implementation
git clone https://github.com/microsoft/LMOps
cd LMOps/minillm
pip install -e .
- import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments

# 1. Load teacher (large) and student (small) models
teacher = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",  # Large teacher
    torch_dtype=torch.float16,
    device_map="auto"
)

student = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",  # Small student
    torch_dtype=torch.float16,
    device_map="cuda:0"
)

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-70b-hf")

# 2. Define distillation loss
def distillation_loss(student_logits, teacher_logits, labels, temperature=2.0, alpha=0.5):
    """
    Combine hard loss (cross-entropy) with soft loss (KL divergence).

    Args:
        temperature: Softens probability distributions (higher = softer)
        alpha: Weight for distillation loss (1-alpha for hard loss)
    """
    # Hard loss: Standard cross-entropy with true labels
    hard_loss = F.cross_entropy(student_logits.view(-1, student_logits.size(-1)), labels.view(-1))

    # Soft loss: KL divergence between student and teacher
    soft_targets = F.softmax(teacher_logits / temperature, dim=-1)
    soft_student = F.log_softmax(student_logits / temperature, dim=-1)
    soft_loss = F.kl_div(soft_student, soft_targets, reduction='batchmean') * (temperature ** 2)

    # Combined loss
    return alpha * soft_loss + (1 - alpha) * hard_loss

# 3. Training loop
for batch in dataloader:
    # Teacher forward (no grad)
    with torch.no_grad():
        teacher_outputs = teacher(**batch)
        teacher_logits = teacher_outputs.logits

    # Student forward
    student_outputs = student(**batch)
    student_logits = student_outputs.logits

    # Compute distillation loss
    loss = distillation_loss(
        student_logits,
        teacher_logits,
        batch['labels'],
        temperature=2.0,
        alpha=0.7  # 70% soft, 30% hard
    )

    # Backward and optimize
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
- def reverse_kl_loss(student_logits, teacher_logits, temperature=1.0):
    """
    Reverse KL divergence: KL(Teacher || Student)
    Better for generative models than forward KL.
    """
    # Teacher distribution (target)
    p_teacher = F.softmax(teacher_logits / temperature, dim=-1)

    # Student distribution (model)
    log_p_student = F.log_softmax(student_logits / temperature, dim=-1)

    # Reverse KL: Sum over teacher, student learns to cover teacher's modes
    reverse_kl = -(p_teacher * log_p_student).sum(dim=-1).mean()

    return reverse_kl * (temperature ** 2)

# Training with MiniLLM
for batch in dataloader:
    with torch.no_grad():
        teacher_logits = teacher(**batch).logits

    student_logits = student(**batch).logits

    # Reverse KLD (better for generation)
    loss = reverse_kl_loss(student_logits, teacher_logits, temperature=1.0)

    loss.backward()
    optimizer.step()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `19-emerging-techniques/knowledge-distillation/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Knowledge Distillation: Compressing LLMs ## When to Use This Skill Use Knowledge Distillation when you need to: - **Compress models** from 70B → 7B while retaining 90%+ performance - **Transfer capabilities** from proprietary models (GPT-4) to open-source (LLaMA, Mistral) - **Reduce inference costs** by deploying smaller student models - **Create specialized models** by distilling domain-specific knowledge - **Improve small models** using synthetic data from large teachers **Key Techniques**: Temperature scaling, soft targets, reverse KLD (MiniLLM), logit distillation, response distillation **Papers**: Hinton et al. 2015 (arXiv 1503.02531), MiniLLM (arXiv 2306.08543), KD Survey (arXiv 2402.13116) ## Installation ```bash # Standard transformers pip install transformers datasets accelerate

{{input}}
