---
name: ai-design-pro
description: Use this skill whenever the user wants to work with AI-enhanced design practices, generative design tools, AI design assistants, or AI-powered design workflows. This includes using AI for rapid prototyping, AI design assistants for feedback, motion graphics generation, photorealistic visuals, AI-driven UX decisions, automated image processing, and AI color palette generation. If the user mentions AI design, generative design, AI design tools, or AI-powered design workflows, use this skill.
license: MIT
metadata:
  short-description: "AI Design — generative design, AI assistants, motion graphics, photorealistic visuals"
---

## Boundary

This skill handles AI-enhanced design tasks including generative design, AI design assistants, AI-powered prototyping, motion graphics generation, photorealistic visuals, AI-driven UX decisions, and automated image processing. It focuses on using AI design tools (Midjourney, DALL-E, Stable Diffusion, Runway, Figma AI, Adobe Firefly) and AI design workflows. It does NOT cover traditional design principles, manual design techniques, or non-AI design tools.

## When to use

Use this skill when:
- Using AI for rapid prototyping and wireframe generation
- Working with AI design assistants for feedback and improvements
- Generating motion graphics from text prompts
- Creating photorealistic marketing imagery with AI
- Making AI-driven UX decisions and A/B testing
- Using automated image processing (resizing, background removal, color correction)
- Generating AI color palettes based on audience
- Building mood boards with AI inspiration
- Testing layouts and interactions with AI-powered tools

DO NOT use this skill for:
- Traditional graphic design principles (use design-system-pro)
- Manual design techniques (use design-system-pro)
- Non-AI design tools (use design-system-pro)
- Basic UI/UX design (use ui-design-brain-pro)

## Workflow

1. **Identify the AI design task** (prototyping, generation, feedback, automation)
2. **Select appropriate AI design tool** (Midjourney, DALL-E, Stable Diffusion, Runway, Figma AI, Adobe Firefly)
3. **Prepare prompts and inputs** (text prompts, reference images, style guidelines)
4. **Generate AI outputs** using the selected tool
5. **Review and refine** AI-generated results
6. **Iterate with AI feedback** for improvements
7. **Integrate with design workflow** (Figma, Adobe tools, etc.)
8. **Validate quality** against design requirements

### Operating principles

- **Use clear, specific prompts** for better AI outputs
- **Provide reference images** for style guidance
- **Iterate and refine** AI-generated results
- **Combine AI with human creativity** for best results
- **Test multiple variations** to find optimal results
- **Maintain brand consistency** across AI-generated assets
- **Review AI outputs** for quality and accuracy
- **Document prompt engineering** for reproducibility

## Suggested response format

```
AI Design Task: [prototyping / generation / feedback / automation]
AI Tool: [Midjourney / DALL-E / Stable Diffusion / Runway / Figma AI / Adobe Firefly]
Prompt Strategy: [prompt engineering approach]
Generated Outputs: [number and type of outputs]
Refinement Process: [iterations and improvements]
Integration: [how outputs integrate with design workflow]
Quality Validation: [validation results]
Recommendations: [next steps for AI design workflow]
```

## Resources in this skill

- **AI Design Tools**: Midjourney, DALL-E, Stable Diffusion, Runway, Figma AI, Adobe Firefly
- **AI Design APIs**: OpenAI API, Stability AI API, Runway API
- **AI Design Libraries**: OpenCV, PIL, scikit-image for image processing
- **Reference Documentation**: REFERENCE.md for advanced AI design techniques

## Quick example

**Generate AI color palette:**

```
1. Analyze target audience and brand values
2. Use AI design tool (Adobe Firefly or similar)
3. Prompt: "Generate modern color palette for tech startup targeting Gen Z, vibrant and accessible"
4. Review generated palettes for accessibility and brand fit
5. Test palettes across different contexts
6. Select optimal palette and document hex codes
```

## Checklist before calling the skill done

- [ ] AI design task is clearly defined
- [ ] Appropriate AI design tool is selected
- [ ] Prompts and inputs are prepared
- [ ] Brand guidelines are available
- [ ] Accessibility requirements are understood
- [ ] Output format is specified
- [ ] Integration workflow is defined
- [ ] Quality criteria are established

---

# AI Design Guide

## Overview

This guide covers essential AI-enhanced design techniques using AI design tools and workflows. For advanced AI design techniques and real-world examples, see REFERENCE.md.

## Quick Start

```python
import openai
from PIL import Image
import requests

# Generate AI image
response = openai.Image.create(
    prompt="Modern tech startup landing page, clean design, blue and purple gradient",
    n=1,
    size="1024x1024"
)
image_url = response['data'][0]['url']
```

## AI Design Tools

### Midjourney
```python
# Midjourney API (via Discord or third-party APIs)
def generate_midjourney_image(prompt, style=""):
    """Generate image using Midjourney"""
    # Implementation depends on API access
    pass
```

### DALL-E
```python
import openai

def generate_dalle_image(prompt, size="1024x1024"):
    """Generate image using DALL-E"""
    response = openai.Image.create(
        prompt=prompt,
        n=1,
        size=size
    )
    return response['data'][0]['url']
```

### Stable Diffusion
```python
from diffusers import StableDiffusionPipeline
import torch

def generate_stable_diffusion_image(prompt):
    """Generate image using Stable Diffusion"""
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16
    )
    pipe = pipe.to("cuda")
    image = pipe(prompt).images[0]
    return image
```

## AI Design Workflows

### Rapid Prototyping
```python
def generate_wireframe_from_prompt(prompt, style="minimal"):
    """Generate wireframe from text prompt"""
    # Use AI design tool to generate wireframe
    # Tools: Figma AI, Uizard, Galileo AI
    prompt = f"Create {style} wireframe for: {prompt}"
    # Generate and return wireframe
    pass
```

### AI Design Assistant Feedback
```python
def get_design_feedback(design_image, requirements):
    """Get AI feedback on design"""
    # Use AI design assistant to analyze design
    # Tools: Figma AI, Adobe Firefly, Khroma
    feedback = {
        'accessibility': 'Check color contrast ratios',
        'consistency': 'Review spacing and alignment',
        'brand': 'Verify brand guideline compliance'
    }
    return feedback
```

### Motion Graphics Generation
```python
def generate_motion_graphics(prompt, duration=5):
    """Generate motion graphics from text prompt"""
    # Use AI video generation tool
    # Tools: Runway, Pika Labs, Kaiber
    prompt = f"Create {duration}s animation: {prompt}"
    # Generate and return motion graphics
    pass
```

### Photorealistic Visuals
```python
def generate_photorealistic_image(prompt, style="photorealistic"):
    """Generate photorealistic marketing imagery"""
    # Use AI image generation tool
    # Tools: Midjourney, DALL-E 3, Stable Diffusion XL
    prompt = f"{style} marketing image: {prompt}"
    # Generate and return image
    pass
```

## Automated Image Processing

### Background Removal
```python
from rembg import remove
from PIL import Image

def remove_background(input_image_path, output_image_path):
    """Remove background from image"""
    input_image = Image.open(input_image_path)
    output_image = remove(input_image)
    output_image.save(output_image_path)
```

### Automated Resizing
```python
from PIL import Image
import os

def resize_image(input_path, output_path, size):
    """Resize image to specified dimensions"""
    with Image.open(input_path) as img:
        img = img.resize(size)
        img.save(output_path)
```

### Color Correction
```python
from PIL import Image, ImageEnhance

def enhance_image(input_path, output_path):
    """Enhance image brightness, contrast, and saturation"""
    with Image.open(input_path) as img:
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)
        img.save(output_path)
```

## AI Color Palette Generation

```python
import colorsys
import random

def generate_ai_color_palette(base_color, num_colors=5):
    """Generate color palette based on base color"""
    # Convert hex to RGB
    r = int(base_color[1:3], 16) / 255
    g = int(base_color[3:5], 16) / 255
    b = int(base_color[5:7], 16) / 255
    
    # Convert to HSV
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    
    # Generate variations
    palette = [base_color]
    for i in range(num_colors - 1):
        new_h = (h + (i + 1) * 0.1) % 1.0
        new_s = max(0.3, min(1.0, s + random.uniform(-0.2, 0.2)))
        new_v = max(0.3, min(1.0, v + random.uniform(-0.2, 0.2)))
        new_r, new_g, new_b = colorsys.hsv_to_rgb(new_h, new_s, new_v)
        hex_color = f"#{int(new_r*255):02x}{int(new_g*255):02x}{int(new_b*255):02x}"
        palette.append(hex_color)
    
    return palette
```

## AI-Driven UX Decisions

```python
def ab_test_layouts(layout_a, layout_b, metrics):
    """Use AI to analyze A/B test results"""
    # Use AI analytics tool
    results = {
        'layout_a_performance': metrics['layout_a'],
        'layout_b_performance': metrics['layout_b'],
        'recommendation': 'layout_a' if metrics['layout_a'] > metrics['layout_b'] else 'layout_b',
        'confidence': 0.95
    }
    return results
```

## Quick Reference

| Task | Best Tool | Key Features |
|------|-----------|-------------|
| Image Generation | Midjourney/DALL-E | High quality, style control |
| Video Generation | Runway/Pika | Motion graphics, animation |
| Design Feedback | Figma AI/Adobe Firefly | Real-time suggestions |
| Color Palettes | Khroma/Coolors | AI-generated palettes |
| Background Removal | Rembg | Automated processing |
| Image Enhancement | PIL/OpenCV | Color correction, resizing |

## Next Steps

- For advanced AI design techniques, see REFERENCE.md
- For AI design tool integration, explore API documentation
- For AI design best practices, consult design research
