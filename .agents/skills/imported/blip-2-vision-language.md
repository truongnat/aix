# Skill: blip-2-vision-language
Schema: antigrav.skill@v1

```json
{
  "description": "Vision-language pre-training framework bridging frozen image encoders and LLMs. Use when you need image captioning, visual question answering, image-text retrieval, or multimodal chat with state-of-th",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155467,
  "model": "qwen3:8b",
  "name": "blip-2-vision-language",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/blip-2/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "image captioning",
    "multimodal",
    "vision-language",
    "vqa",
    "zero-shot"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Vision-language pre-training framework bridging frozen image encoders and LLMs. Use when you need image captioning, visual question answering, image-text retrieval, or multimodal chat with state-of-the-art zero-shot performance.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # HuggingFace Transformers (recommended)
pip install transformers accelerate torch Pillow

# Or LAVIS library (Salesforce official)
pip install salesforce-lavis
- import torch
from PIL import Image
from transformers import Blip2Processor, Blip2ForConditionalGeneration

# Load model and processor
processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    torch_dtype=torch.float16,
    device_map="auto"
)

# Load image
image = Image.open("photo.jpg").convert("RGB")

# Generate caption
inputs = processor(images=image, return_tensors="pt").to("cuda", torch.float16)
generated_ids = model.generate(**inputs, max_new_tokens=50)
caption = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(caption)
- # Ask a question about the image
question = "What color is the car in this image?"

inputs = processor(images=image, text=question, return_tensors="pt").to("cuda", torch.float16)
generated_ids = model.generate(**inputs, max_new_tokens=50)
answer = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(answer)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/blip-2/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# BLIP-2: Vision-Language Pre-training Comprehensive guide to using Salesforce's BLIP-2 for vision-language tasks with frozen image encoders and large language models. ## When to use BLIP-2 **Use BLIP-2 when:** - Need high-quality image captioning with natural descriptions - Building visual question answering (VQA) systems - Require zero-shot image-text understanding without task-specific training - Want to leverage LLM reasoning for visual tasks - Building multimodal conversational AI - Need image-text retrieval or matching **Key features:** - **Q-Former architecture**: Lightweight query transformer bridges vision and language - **Frozen backbone efficiency**: No need to fine-tune large vision/language models - **Multiple LLM backends**: OPT (2.7B, 6.7B) and FlanT5 (XL, XXL) - **Zero-shot

{{input}}
