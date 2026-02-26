# Skill: clip
Schema: antigrav.skill@v1

```json
{
  "description": "OpenAI's model connecting vision and language. Enables zero-shot image classification, image-text matching, and cross-modal retrieval. Trained on 400M image-text pairs. Use for image search, content m",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155472,
  "model": "qwen3:8b",
  "name": "clip",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/clip/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "clip",
    "content moderation",
    "cross-modal retrieval",
    "image classification",
    "image search",
    "multimodal",
    "openai",
    "vision-language",
    "zero-shot"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
OpenAI's model connecting vision and language. Enables zero-shot image classification, image-text matching, and cross-modal retrieval. Trained on 400M image-text pairs. Use for image search, content moderation, or vision-language tasks without fine-tuning. Best for general-purpose image understanding.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install git+https://github.com/openai/CLIP.git
pip install torch torchvision ftfy regex tqdm
- import torch
import clip
from PIL import Image

# Load model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Load image
image = preprocess(Image.open("photo.jpg")).unsqueeze(0).to(device)

# Define possible labels
text = clip.tokenize(["a dog", "a cat", "a bird", "a car"]).to(device)

# Compute similarity
with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)

    # Cosine similarity
    logits_per_image, logits_per_text = model(image, text)
    probs = logits_per_image.softmax(dim=-1).cpu().numpy()

# Print results
labels = ["a dog", "a cat", "a bird", "a car"]
for label, prob in zip(labels, probs[0]):
    print(f"{label}: {prob:.2%}")
- # Models (sorted by size)
models = [
    "RN50",           # ResNet-50
    "RN101",          # ResNet-101
    "ViT-B/32",       # Vision Transformer (recommended)
    "ViT-B/16",       # Better quality, slower
    "ViT-L/14",       # Best quality, slowest
]

model, preprocess = clip.load("ViT-B/32")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/clip/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# CLIP - Contrastive Language-Image Pre-Training OpenAI's model that understands images from natural language. ## When to use CLIP **Use when:** - Zero-shot image classification (no training data needed) - Image-text similarity/matching - Semantic image search - Content moderation (detect NSFW, violence) - Visual question answering - Cross-modal retrieval (image→text, text→image) **Metrics**: - **25,300+ GitHub stars** - Trained on 400M image-text pairs - Matches ResNet-50 on ImageNet (zero-shot) - MIT License **Use alternatives instead**: - **BLIP-2**: Better captioning - **LLaVA**: Vision-language chat - **Segment Anything**: Image segmentation ## Quick start ### Installation ```bash pip install git+https://github.com/openai/CLIP.git pip install torch torchvision ftfy regex tqdm ``` ###

{{input}}
