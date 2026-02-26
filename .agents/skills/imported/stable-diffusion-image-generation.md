# Skill: stable-diffusion-image-generation
Schema: antigrav.skill@v1

```json
{
  "description": "State-of-the-art text-to-image generation with Stable Diffusion models via HuggingFace Diffusers. Use when generating images from text prompts, performing image-to-image translation, inpainting, or bu",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155476,
  "model": "qwen3:8b",
  "name": "stable-diffusion-image-generation",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/stable-diffusion/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "computer vision",
    "diffusers",
    "image generation",
    "multimodal",
    "stable diffusion",
    "text-to-image"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
State-of-the-art text-to-image generation with Stable Diffusion models via HuggingFace Diffusers. Use when generating images from text prompts, performing image-to-image translation, inpainting, or building custom diffusion pipelines.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install diffusers transformers accelerate torch
pip install xformers  # Optional: memory-efficient attention
- from diffusers import DiffusionPipeline
import torch

# Load pipeline (auto-detects model type)
pipe = DiffusionPipeline.from_pretrained(
    "stable-diffusion-v1-5/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)
pipe.to("cuda")

# Generate image
image = pipe(
    "A serene mountain landscape at sunset, highly detailed",
    num_inference_steps=50,
    guidance_scale=7.5
).images[0]

image.save("output.png")
- from diffusers import AutoPipelineForText2Image
import torch

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16"
)
pipe.to("cuda")

# Enable memory optimization
pipe.enable_model_cpu_offload()

image = pipe(
    prompt="A futuristic city with flying cars, cinematic lighting",
    height=1024,
    width=1024,
    num_inference_steps=30
).images[0]

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/stable-diffusion/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Stable Diffusion Image Generation Comprehensive guide to generating images with Stable Diffusion using the HuggingFace Diffusers library. ## When to use Stable Diffusion **Use Stable Diffusion when:** - Generating images from text descriptions - Performing image-to-image translation (style transfer, enhancement) - Inpainting (filling in masked regions) - Outpainting (extending images beyond boundaries) - Creating variations of existing images - Building custom image generation workflows **Key features:** - **Text-to-Image**: Generate images from natural language prompts - **Image-to-Image**: Transform existing images with text guidance - **Inpainting**: Fill masked regions with context-aware content - **ControlNet**: Add spatial conditioning (edges, poses, depth) - **LoRA Support**: Effi

{{input}}
