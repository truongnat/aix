# Skill: llava
Schema: antigrav.skill@v1

```json
{
  "description": "Large Language and Vision Assistant. Enables visual instruction tuning and image-based conversations. Combines CLIP vision encoder with Vicuna/LLaMA language models. Supports multi-turn image chat, vi",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155473,
  "model": "qwen3:8b",
  "name": "llava",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/llava/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "clip",
    "conversational ai",
    "image chat",
    "instruction tuning",
    "llava",
    "multimodal",
    "vicuna",
    "vision-language",
    "visual question answering",
    "vqa"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Large Language and Vision Assistant. Enables visual instruction tuning and image-based conversations. Combines CLIP vision encoder with Vicuna/LLaMA language models. Supports multi-turn image chat, visual question answering, and instruction following. Use for vision-language chatbots or image understanding tasks. Best for conversational image analysis.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Clone repository
git clone https://github.com/haotian-liu/LLaVA
cd LLaVA

# Install
pip install -e .
- from llava.model.builder import load_pretrained_model
from llava.mm_utils import get_model_name_from_path, process_images, tokenizer_image_token
from llava.constants import IMAGE_TOKEN_INDEX, DEFAULT_IMAGE_TOKEN
from llava.conversation import conv_templates
from PIL import Image
import torch

# Load model
model_path = "liuhaotian/llava-v1.5-7b"
tokenizer, model, image_processor, context_len = load_pretrained_model(
    model_path=model_path,
    model_base=None,
    model_name=get_model_name_from_path(model_path)
)

# Load image
image = Image.open("image.jpg")
image_tensor = process_images([image], image_processor, model.config)
image_tensor = image_tensor.to(model.device, dtype=torch.float16)

# Create conversation
conv = conv_templates["llava_v1"].copy()
conv.append_message(conv.roles[0], DEFAULT_IMAGE_TOKEN + "\nWhat is in this image?")
conv.append_message(conv.roles[1], None)
prompt = conv.get_prompt()

# Generate response
input_ids = tokenizer_image_token(prompt, tokenizer, IMAGE_TOKEN_INDEX, return_tensors='pt').unsqueeze(0).to(model.device)

with torch.inference_mode():
    output_ids = model.generate(
        input_ids,
        images=image_tensor,
        do_sample=True,
        temperature=0.2,
        max_new_tokens=512
    )

response = tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
print(response)
- # Load different models
model_7b = "liuhaotian/llava-v1.5-7b"
model_13b = "liuhaotian/llava-v1.5-13b"
model_34b = "liuhaotian/llava-v1.6-34b"

# 4-bit quantization for lower VRAM
load_4bit = True  # Reduces VRAM by ~4×

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/llava/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# LLaVA - Large Language and Vision Assistant Open-source vision-language model for conversational image understanding. ## When to use LLaVA **Use when:** - Building vision-language chatbots - Visual question answering (VQA) - Image description and captioning - Multi-turn image conversations - Visual instruction following - Document understanding with images **Metrics**: - **23,000+ GitHub stars** - GPT-4V level capabilities (targeted) - Apache 2.0 License - Multiple model sizes (7B-34B params) **Use alternatives instead**: - **GPT-4V**: Highest quality, API-based - **CLIP**: Simple zero-shot classification - **BLIP-2**: Better for captioning only - **Flamingo**: Research, not open-source ## Quick start ### Installation ```bash # Clone repository git clone https://github.com/haotian-liu/LL

{{input}}
