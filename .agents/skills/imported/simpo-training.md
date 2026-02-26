# Skill: simpo-training
Schema: antigrav.skill@v1

```json
{
  "description": "Simple Preference Optimization for LLM alignment. Reference-free alternative to DPO with better performance (+6.4 points on AlpacaEval 2.0). No reference model needed, more efficient than DPO. Use for",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155379,
  "model": "qwen3:8b",
  "name": "simpo-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "06-post-training/simpo/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "alignment",
    "dpo alternative",
    "efficient training",
    "llm alignment",
    "post-training",
    "preference optimization",
    "reference-free",
    "simpo"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Simple Preference Optimization for LLM alignment. Reference-free alternative to DPO with better performance (+6.4 points on AlpacaEval 2.0). No reference model needed, more efficient than DPO. Use for preference alignment when want simpler, faster training than DPO/PPO.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Create environment
conda create -n simpo python=3.10 && conda activate simpo

# Install PyTorch 2.2.2
# Visit: https://pytorch.org/get-started/locally/

# Install alignment-handbook
git clone https://github.com/huggingface/alignment-handbook.git
cd alignment-handbook
python -m pip install .

# Install Flash Attention 2
python -m pip install flash-attn --no-build-isolation
- ACCELERATE_LOG_LEVEL=info accelerate launch \
  --config_file accelerate_configs/deepspeed_zero3.yaml \
  scripts/run_simpo.py \
  training_configs/mistral-7b-base-simpo.yaml
- # Model
model_name_or_path: mistralai/Mistral-7B-v0.1
torch_dtype: bfloat16

# Dataset
dataset_mixer:
  HuggingFaceH4/ultrafeedback_binarized: 1.0
dataset_splits:
  - train_prefs
  - test_prefs

# SimPO hyperparameters
beta: 2.0                  # Reward scaling (2.0-10.0)
gamma_beta_ratio: 0.5       # Target margin (0-1)
loss_type: sigmoid          # sigmoid or hinge
sft_weight: 0.0             # Optional SFT regularization

# Training
learning_rate: 5e-7         # Critical: 3e-7 to 1e-6
num_train_epochs: 1
per_device_train_batch_size: 1
gradient_accumulation_steps: 8

# Output
output_dir: ./outputs/mistral-7b-simpo

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `06-post-training/simpo/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# SimPO - Simple Preference Optimization ## Quick start SimPO is a reference-free preference optimization method that outperforms DPO without needing a reference model. **Installation**: ```bash # Create environment conda create -n simpo python=3.10 && conda activate simpo # Install PyTorch 2.2.2 # Visit: https://pytorch.org/get-started/locally/ # Install alignment-handbook git clone https://github.com/huggingface/alignment-handbook.git cd alignment-handbook python -m pip install . # Install Flash Attention 2 python -m pip install flash-attn --no-build-isolation ``` **Training** (Mistral 7B): ```bash ACCELERATE_LOG_LEVEL=info accelerate launch \ --config_file accelerate_configs/deepspeed_zero3.yaml \ scripts/run_simpo.py \ training_configs/mistral-7b-base-simpo.yaml ``` ## Common workflows

{{input}}
