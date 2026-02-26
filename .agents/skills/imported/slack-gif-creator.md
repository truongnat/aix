# Skill: slack-gif-creator
Schema: antigrav.skill@v1

```json
{
  "description": "Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like \"make me a G",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153441,
  "model": "qwen3:8b",
  "name": "slack-gif-creator",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "slack-gif-creator/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/anthropic-skills",
  "tags": [
    "anthropic",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack.

## When to Use
- Use when the task matches this skill domain.

## Examples
- from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

# 1. Create builder
builder = GIFBuilder(width=128, height=128, fps=10)

# 2. Generate frames
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)

    # Draw your animation using PIL primitives
    # (circles, polygons, lines, etc.)

    builder.add_frame(frame)

# 3. Save with optimization
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
- from PIL import Image

uploaded = Image.open('file.png')
# Use directly, or just as reference for colors/style
- from PIL import ImageDraw

draw = ImageDraw.Draw(frame)

# Circles/ovals
draw.ellipse([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

# Stars, triangles, any polygon
points = [(x1, y1), (x2, y2), (x3, y3), ...]
draw.polygon(points, fill=(r, g, b), outline=(r, g, b), width=3)

# Lines
draw.line([(x1, y1), (x2, y2)], fill=(r, g, b), width=5)

# Rectangles
draw.rectangle([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `slack-gif-creator/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

# Slack GIF Creator A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack. ## Slack Requirements **Dimensions:** - Emoji GIFs: 128x128 (recommended) - Message GIFs: 480x480 **Parameters:** - FPS: 10-30 (lower is smaller file size) - Colors: 48-128 (fewer = smaller file size) - Duration: Keep under 3 seconds for emoji GIFs ## Core Workflow ```python from core.gif_builder import GIFBuilder from PIL import Image, ImageDraw # 1. Create builder builder = GIFBuilder(width=128, height=128, fps=10) # 2. Generate frames for i in range(12): frame = Image.new('RGB', (128, 128), (240, 248, 255)) draw = ImageDraw.Draw(frame) # Draw your animation using PIL primitives # (circles, polygons, lines, etc.) builder.add_frame(frame) # 3. Save with optimization builder.save

{{input}}
