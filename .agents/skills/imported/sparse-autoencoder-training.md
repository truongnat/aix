# Skill: sparse-autoencoder-training
Schema: antigrav.skill@v1

```json
{
  "description": "Provides guidance for training and analyzing Sparse Autoencoders (SAEs) using SAELens to decompose neural network activations into interpretable features. Use when discovering interpretable features, ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155367,
  "model": "qwen3:8b",
  "name": "sparse-autoencoder-training",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "04-mechanistic-interpretability/saelens/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "feature discovery",
    "mechanistic interpretability",
    "sae",
    "sparse autoencoders",
    "superposition"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Provides guidance for training and analyzing Sparse Autoencoders (SAEs) using SAELens to decompose neural network activations into interpretable features. Use when discovering interpretable features, analyzing superposition, or studying monosemantic representations in language models.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install sae-lens
- Input Activation → Encoder → Sparse Features → Decoder → Reconstructed Activation
    (d_model)       ↓        (d_sae >> d_model)    ↓         (d_model)
                 sparsity                      reconstruction
                 penalty                          loss
- from transformer_lens import HookedTransformer
from sae_lens import SAE

# 1. Load model and pre-trained SAE
model = HookedTransformer.from_pretrained("gpt2-small", device="cuda")
sae, cfg_dict, sparsity = SAE.from_pretrained(
    release="gpt2-small-res-jb",
    sae_id="blocks.8.hook_resid_pre",
    device="cuda"
)

# 2. Get model activations
tokens = model.to_tokens("The capital of France is Paris")
_, cache = model.run_with_cache(tokens)
activations = cache["resid_pre", 8]  # [batch, pos, d_model]

# 3. Encode to SAE features
sae_features = sae.encode(activations)  # [batch, pos, d_sae]
print(f"Active features: {(sae_features > 0).sum()}")

# 4. Find top features for each position
for pos in range(tokens.shape[1]):
    top_features = sae_features[0, pos].topk(5)
    token = model.to_str_tokens(tokens[0, pos:pos+1])[0]
    print(f"Token '{token}': features {top_features.indices.tolist()}")

# 5. Reconstruct activations
reconstructed = sae.decode(sae_features)
reconstruction_error = (activations - reconstructed).norm()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `04-mechanistic-interpretability/saelens/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# SAELens: Sparse Autoencoders for Mechanistic Interpretability SAELens is the primary library for training and analyzing Sparse Autoencoders (SAEs) - a technique for decomposing polysemantic neural network activations into sparse, interpretable features. Based on Anthropic's groundbreaking research on monosemanticity. **GitHub**: [jbloomAus/SAELens](https://github.com/jbloomAus/SAELens) (1,100+ stars) ## The Problem: Polysemanticity & Superposition Individual neurons in neural networks are **polysemantic** - they activate in multiple, semantically distinct contexts. This happens because models use **superposition** to represent more features than they have neurons, making interpretability difficult. **SAEs solve this** by decomposing dense activations into sparse, monosemantic features -

{{input}}
