# Skill: segment-anything-model
Schema: antigrav.skill@v1

```json
{
  "description": "Foundation model for image segmentation with zero-shot transfer. Use when you need to segment any object in images using points, boxes, or masks as prompts, or automatically generate all object masks ",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155474,
  "model": "qwen3:8b",
  "name": "segment-anything-model",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/segment-anything/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "computer vision",
    "image segmentation",
    "multimodal",
    "sam",
    "zero-shot"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Foundation model for image segmentation with zero-shot transfer. Use when you need to segment any object in images using points, boxes, or masks as prompts, or automatically generate all object masks in an image.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # From GitHub
pip install git+https://github.com/facebookresearch/segment-anything.git

# Optional dependencies
pip install opencv-python pycocotools matplotlib

# Or use HuggingFace transformers
pip install transformers
- # ViT-H (largest, most accurate) - 2.4GB
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth

# ViT-L (medium) - 1.2GB
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth

# ViT-B (smallest, fastest) - 375MB
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth
- import numpy as np
from segment_anything import sam_model_registry, SamPredictor

# Load model
sam = sam_model_registry["vit_h"]\(checkpoint="sam_vit_h_4b8939.pth"\)
sam.to(device="cuda")

# Create predictor
predictor = SamPredictor(sam)

# Set image (computes embeddings once)
image = cv2.imread("image.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
predictor.set_image(image)

# Predict with point prompts
input_point = np.array([[500, 375]])  # (x, y) coordinates
input_label = np.array([1])  # 1 = foreground, 0 = background

masks, scores, logits = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    multimask_output=True  # Returns 3 mask options
)

# Select best mask
best_mask = masks[np.argmax(scores)]

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/segment-anything/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Segment Anything Model (SAM) Comprehensive guide to using Meta AI's Segment Anything Model for zero-shot image segmentation. ## When to use SAM **Use SAM when:** - Need to segment any object in images without task-specific training - Building interactive annotation tools with point/box prompts - Generating training data for other vision models - Need zero-shot transfer to new image domains - Building object detection/segmentation pipelines - Processing medical, satellite, or domain-specific images **Key features:** - **Zero-shot segmentation**: Works on any image domain without fine-tuning - **Flexible prompts**: Points, bounding boxes, or previous masks - **Automatic segmentation**: Generate all object masks automatically - **High quality**: Trained on 1.1 billion masks from 11 million

{{input}}
