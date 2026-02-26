# Skill: model-pruning
Schema: antigrav.skill@v1

```json
{
  "description": "Reduce LLM size and accelerate inference using pruning techniques like Wanda and SparseGPT. Use when compressing models without retraining, achieving 50% sparsity with minimal accuracy loss, or enabli",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155483,
  "model": "qwen3:8b",
  "name": "model-pruning",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "19-emerging-techniques/model-pruning/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "emerging techniques",
    "fast inference",
    "model compression",
    "model pruning",
    "n:m sparsity",
    "one-shot pruning",
    "sparsegpt",
    "sparsity",
    "structured pruning",
    "unstructured pruning",
    "wanda"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Reduce LLM size and accelerate inference using pruning techniques like Wanda and SparseGPT. Use when compressing models without retraining, achieving 50% sparsity with minimal accuracy loss, or enabling faster inference on hardware accelerators. Covers unstructured pruning, structured pruning, N:M sparsity, magnitude pruning, and one-shot methods.

## When to Use
- **Reduce model size** by 40-60% with <1% accuracy loss
- **Accelerate inference** using hardware-friendly sparsity (2-4× speedup)
- **Deploy on constrained hardware** (mobile, edge devices)
- **Compress without retraining** using one-shot methods
- **Enable efficient serving** with reduced memory footprint

## Examples
- # Wanda implementation
git clone https://github.com/locuslab/wanda
cd wanda
pip install -r requirements.txt

# Optional: SparseGPT
git clone https://github.com/IST-DASLab/sparsegpt
cd sparsegpt
pip install -e .

# Dependencies
pip install torch transformers accelerate
- import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load model
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.float16,
    device_map="cuda"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# Calibration data (small dataset for activation statistics)
calib_data = [
    "The quick brown fox jumps over the lazy dog.",
    "Machine learning is transforming the world.",
    "Artificial intelligence powers modern applications.",
]

# Wanda pruning function
def wanda_prune(model, calib_data, sparsity=0.5):
    """
    Wanda: Prune by weight magnitude × input activation.

    Args:
        sparsity: Fraction of weights to prune (0.5 = 50%)
    """
    # 1. Collect activation statistics
    activations = {}

    def hook_fn(name):
        def hook(module, input, output):
            # Store input activation norms
            activations[name] = input[0].detach().abs().mean(dim=0)
        return hook

    # Register hooks for all linear layers
    hooks = []
    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Linear):
            hooks.append(module.register_forward_hook(hook_fn(name)))

    # Run calibration data
    model.eval()
    with torch.no_grad():
        for text in calib_data:
            inputs = tokenizer(text, return_tensors="pt").to(model.device)
            model(**inputs)

    # Remove hooks
    for hook in hooks:
        hook.remove()

    # 2. Prune weights based on |weight| × activation
    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Linear) and name in activations:
            W = module.weight.data
            act = activations[name]

            # Compute importance: |weight| × activation
            importance = W.abs() * act.unsqueeze(0)

            # Flatten and find threshold
            threshold = torch.quantile(importance.flatten(), sparsity)

            # Create mask
            mask = importance >= threshold

            # Apply mask (prune)
            W *= mask.float()

    return model

# Apply Wanda pruning (50% sparsity, one-shot, no retraining)
pruned_model = wanda_prune(model, calib_data, sparsity=0.5)

# Save
pruned_model.save_pretrained("./llama-2-7b-wanda-50")
- from sparsegpt import SparseGPT

# Load model
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# Initialize SparseGPT
pruner = SparseGPT(model)

# Calibration data
calib_data = load_calibration_data()  # ~128 samples

# Prune (one-shot, layer-wise reconstruction)
pruned_model = pruner.prune(
    calib_data=calib_data,
    sparsity=0.5,           # 50% sparsity
    prunen=0,               # Unstructured (0) or N:M structured
    prunem=0,
    percdamp=0.01,          # Damping for Hessian inverse
)

# Results: Near-lossless pruning at 50% sparsity

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `19-emerging-techniques/model-pruning/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Model Pruning: Compressing LLMs ## When to Use This Skill Use Model Pruning when you need to: - **Reduce model size** by 40-60% with <1% accuracy loss - **Accelerate inference** using hardware-friendly sparsity (2-4× speedup) - **Deploy on constrained hardware** (mobile, edge devices) - **Compress without retraining** using one-shot methods - **Enable efficient serving** with reduced memory footprint **Key Techniques**: Wanda (weights × activations), SparseGPT (second-order), structured pruning, N:M sparsity **Papers**: Wanda ICLR 2024 (arXiv 2306.11695), SparseGPT (arXiv 2301.00774) ## Installation ```bash # Wanda implementation git clone https://github.com/locuslab/wanda cd wanda pip install -r requirements.txt # Optional: SparseGPT git clone https://github.com/IST-DASLab/sparsegpt cd

{{input}}
