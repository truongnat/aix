# Prompt Engineering for AI Design

## Prompt anatomy

```
[Subject] + [Style] + [Composition] + [Color/Lighting] + [Format/Quality] + [Parameters]
```

**Example:**
```
"Minimalist SaaS dashboard UI, flat design, three-column grid, dark mode with blue accents,
high resolution professional quality --ar 16:9 --style raw --v 6"
```

## Subject descriptors

```
# People
"a person working on a laptop" → too vague
"a focused female developer, side profile, natural light" → specific

# Products
"a coffee cup" → too vague
"a matte black ceramic coffee mug, steam rising, marble table surface" → specific

# UI/UX
"a login page" → too vague
"a clean login form, dark mode, glassmorphism card, centered layout" → specific
```

## Style modifiers (by use case)

| Use case | Modifiers |
|----------|-----------|
| Product photography | `studio lighting, white background, product hero shot, 4K` |
| Marketing illustration | `flat design, vibrant colors, vector style, editorial illustration` |
| UI mockup | `clean UI, minimal, wireframe, Figma-style, product design` |
| Brand lifestyle | `cinematic, golden hour, lifestyle photography, editorial` |
| Technical diagram | `isometric, technical illustration, clean lines, diagram` |

## Negative prompts

Use negative prompts to exclude unwanted elements **before** rewriting the whole prompt.

```python
# DALL-E 3 — not supported natively, add to prompt
prompt = "your prompt. Avoid: blurry, watermark, text overlay, extra fingers"

# Stable Diffusion
negative_prompt = "blurry, watermark, text, extra fingers, deformed, low quality, nsfw"

# Midjourney
prompt = "your prompt --no text, watermark, logo, people"
```

## Composition keywords

```
Framing:       close-up, wide shot, medium shot, overhead, isometric, bird's-eye view
Lighting:      natural light, studio lighting, golden hour, dramatic shadow, backlit
Focus:         shallow depth of field, sharp focus, bokeh background
Perspective:   first-person, three-quarter view, frontal, side profile
```

## Brand-locking prompts

When brand consistency is critical, lock key variables:

```python
BRAND_TEMPLATE = """
{subject},
color palette: #1E40AF (primary blue) #F8FAFC (background) #1E293B (text),
typography: sans-serif, clean, modern,
style: {style},
--ar 16:9 --style raw
"""

def brand_prompt(subject, style="minimalist flat design"):
    return BRAND_TEMPLATE.format(subject=subject, style=style)
```

## Seed and reproducibility

```python
# DALL-E 3 — no seed control; use consistent prompt template
# Stable Diffusion
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
generator = torch.Generator("cuda").manual_seed(42)  # Fixed seed
image = pipe(prompt, generator=generator).images[0]

# Midjourney
"/imagine prompt: your prompt --seed 12345"
```

## Iteration strategy

```
1. Generate with minimal prompt → assess baseline
2. Identify the one biggest gap (wrong style? wrong subject? wrong mood?)
3. Add ONE modifier targeting that gap
4. Re-generate and compare
5. Repeat — change only one variable per iteration
6. Document what worked in prompts/successful.md
```

## Prompts version control

```bash
# prompts/ directory structure
prompts/
  hero-images/
    product-hero-v1.txt      # initial version
    product-hero-v2.txt      # added brand colors
    product-hero-final.txt   # approved version
  icons/
    ...
  metadata.json              # tool, seed, CFG per prompt file
```

```json
// metadata.json
{
  "product-hero-final": {
    "tool": "dall-e-3",
    "model": "dall-e-3",
    "quality": "hd",
    "size": "1024x1024",
    "approved_by": "design_team",
    "approved_date": "2025-01-15"
  }
}
```
