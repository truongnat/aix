---
name: ai-design-pro
description: >
  AI-enhanced design practices using generative tools, AI assistants, and
  automated workflows: image generation, rapid prototyping, AI-driven UX
  decisions, motion graphics, photorealistic visuals, and automated image
  processing.


  Use this skill when working with AI design tools (Midjourney, DALL-E, Stable
  Diffusion, Runway, Figma AI, Adobe Firefly), generating design assets from
  text prompts, automating image processing pipelines, or making data-driven
  design decisions with AI.


  Do not use for traditional design principles or manual design techniques (use
  design-system-pro), basic UI/UX layout (use ui-design-brain-pro), or
  accessibility (use a11y-design-pro).


  Triggers: "AI design", "generative design", "AI image generation", "DALL-E",
  "Midjourney", "Stable Diffusion", "Runway", "Figma AI", "Adobe Firefly", "AI
  prototyping", "AI color palette", "AI design assistant", "AI motion graphics",
  "text to image".
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# AI Design (professional)

Skill text is **English**; match the user's response language when applicable.

Use official tool documentation as authority: [OpenAI Images API](https://platform.openai.com/docs/guides/images), [Stability AI](https://stability.ai/), [Runway ML](https://runwayml.com/), [Adobe Firefly](https://firefly.adobe.com/). This skill encodes **prompt engineering**, **AI generation pipelines**, **image processing automation**, **AI-driven UX decisions**, and **brand consistency at scale**. Confirm **target tool**, **output format**, **brand constraints**, and **quality bar** before generating.

## Boundary

**`ai-design-pro`** owns **AI-generated design assets**, **prompt engineering for design**, **AI image/video generation pipelines**, **AI-driven UX decisions**, and **automated image processing**. It does **not** own traditional design principles, manual design execution, or accessibility — combine with other skills as needed.

| Skill | When to combine with **`ai-design-pro`** |
|-------|------------------------------------------|
| **`design-system-pro`** | When AI assets must match an existing design token system |
| **`a11y-design-pro`** | When AI-generated visuals must meet accessibility standards |
| **`ui-design-brain-pro`** | When AI outputs feed into UI component design decisions |
| **`motion-design-pro`** | When generating AI-assisted animations and transitions |
| **`frontend-design-pro`** | When integrating AI-generated assets into a frontend codebase |

## When to use

- Generating design assets (images, icons, illustrations) from text prompts.
- Rapid prototyping with AI wireframe generators (Galileo AI, Uizard, Figma AI).
- Automating repetitive image processing (resizing, background removal, format conversion).
- Building AI-driven mood boards and style exploration pipelines.
- Running data-driven A/B design decisions with AI analysis.
- Generating motion graphics or short video clips from text (Runway, Pika Labs).
- Trigger keywords: `AI design`, `generative design`, `DALL-E`, `Midjourney`, `Stable Diffusion`, `Runway`, `Figma AI`, `text to image`, `AI prototyping`

## When not to use

- **Traditional design execution** (typography, grid, layout) — use **`design-system-pro`**.
- **Accessibility auditing** — use **`a11y-design-pro`**.
- **3D and motion design** — use **`3d-motion-pro`**.
- **Design system tokens and components** — use **`design-system-pro`**.

## Required inputs

- **Target tool** — Midjourney, DALL-E 3, Stable Diffusion, Runway, Figma AI, Adobe Firefly.
- **Output format** — image, video, SVG, or processed asset.
- **Brand constraints** — color palette, tone, style guide, existing visual language.
- **Quality bar** — use case (prototype, marketing, production), resolution needs.
- **Volume** — one-off asset vs. automated batch pipeline.

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** target tool, output format, brand constraints, and quality bar → verify: [inputs documented].
2. **State assumptions** about brand fit, copyright risk, and iteration budget (**Think Before Coding**).
3. **Start with minimal prompt** and one generation; add complexity only when baseline fails (**Simplicity First**).
4. **Surgical changes** — iterate on the single parameter causing quality gaps, not the entire prompt (**Surgical Changes**).
5. **Define done** as: asset is brand-consistent, meets quality bar, is integrated into workflow (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note residual risks.

### Operating principles

1. **Think Before Coding** — Understand brand voice and visual language before generating. A wrong style is harder to fix than a wrong prompt.
2. **Simplicity First** — One clear subject + one style modifier beats a 200-word prompt. Add detail only when outputs miss the mark.
3. **Surgical Changes** — When iterating, change one prompt variable at a time to isolate what drives quality.
4. **Goal-Driven Execution** — Done = asset is usable in production, not just "looks good."
5. **Prompt is the spec** — Treat prompts as code: version-control them, document what works, reuse across campaigns.
6. **AI augments, not replaces** — AI handles volume and variation; human judgment owns brand and ethical review.
7. **Copyright and bias awareness** — Review AI outputs for training data artifacts, bias, and potential IP issues before publishing.

## Default recommendations by scenario

| Scenario | Default tool | Notes |
|----------|-------------|-------|
| Marketing hero images | Midjourney v6 or DALL-E 3 | High fidelity, style control |
| UI wireframes from description | Galileo AI or Uizard | Outputs Figma-compatible |
| Motion graphics from text | Runway Gen-2 or Pika Labs | Max 4–16s clips |
| Background removal batch | `rembg` (Python) | Fast, free, local |
| Color palette from brand | Adobe Firefly or Khroma | Brand-safe, royalty-free |
| Design feedback / critique | GPT-4V or Figma AI | Structured critique output |

## Decision trees

Summary: task type → tool selection → prompt strategy → iteration approach.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: over-specified prompts, skipping brand review, no version control on prompts, using AI for legally sensitive likeness, batch without human QA gate.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Prompt engineering (summary)

- Subject + style + composition + technical spec = effective prompt.
- Negative prompts remove unwanted elements; use them before rewriting the whole prompt.
- Seed/CFG control reproducibility; document successful seeds.

Details: [references/prompt-engineering.md](references/prompt-engineering.md)

### Tool comparison (summary)

- Midjourney: best aesthetics, Discord-only, no API (use unofficial wrappers).
- DALL-E 3: OpenAI API, good text rendering, easier brand prompting.
- Stable Diffusion: local, free, highly customizable with LoRA/ControlNet.
- Runway/Pika: text-to-video, image-to-video; best for motion.
- Adobe Firefly: commercially safe, Photoshop integration.

Details: [references/tool-comparison.md](references/tool-comparison.md)

## Cross-skill handoffs

- **`design-system-pro`** — when AI-generated assets need to be tokenized into a design system.
- **`a11y-design-pro`** — when AI-generated colors or images must meet WCAG contrast and alt-text requirements.
- **`motion-design-pro`** — when AI video clips need to be composed into full animations.
- **`frontend-design-pro`** — when integrating AI assets into a React/Vue/Svelte codebase.

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

1. **Task** — What AI design task is being solved and why AI is the right approach.
2. **Tool + prompt strategy** — Tool selected, prompt structure, and key parameters.
3. **Code / pipeline** — Generation script, processing pipeline, or Figma plugin config.
4. **Residual risks** — Copyright, brand drift, bias, quality gates needed.

## Resources in this skill

| Topic | File |
|-------|------|
| Prompt engineering guide | [references/prompt-engineering.md](references/prompt-engineering.md) |
| Tool comparison matrix | [references/tool-comparison.md](references/tool-comparison.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Advanced techniques | [REFERENCE.md](REFERENCE.md) |
| Scripts | [Scripts/](Scripts/) |

## Quick example

**Input:** "Generate product hero images for our e-commerce site — consistent brand style, 10 products."
- Use DALL-E 3 with a brand-locked prompt template (color, tone, lighting).
- Batch-generate via OpenAI API with `Scripts/generate-dalle-image.js`.
- Human QA gate: review each for brand fit before publishing.
- **Verify:** All images match brand palette; no obvious AI artifacts; alt-text is ready.

**Input (tricky):** "The AI keeps generating images with our competitor's logo in the background."
- Add negative prompt: `"no logos, no text, no watermarks, no brand identifiers"`.
- Switch from Midjourney to DALL-E 3 (better instruction following).
- If persists: use ControlNet inpainting to remove the logo region.
- **Verify:** 10 regenerations pass brand review without competitor artifacts.

**Input (cross-skill):** "Build an AI-generated design system for a new product — colors, typography, and components."
- **`ai-design-pro`**: Generate color palettes and mood boards from brand brief.
- **`design-system-pro`**: Tokenize accepted colors; define type scale and spacing.
- **`a11y-design-pro`**: Validate color contrast ratios; ensure WCAG AA compliance.
- **Verify:** Design system is documented, tokens are exported, all colors pass 4.5:1 contrast.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (**Think Before Coding**)
- [ ] Started with minimal prompt; added complexity only when needed (**Simplicity First**)
- [ ] Iterated on one variable at a time when fixing quality issues (**Surgical Changes**)
- [ ] Success criteria defined: brand-consistent, meets quality bar, integrated (**Goal-Driven Execution**)
- [ ] Target tool confirmed and appropriate for the use case
- [ ] Prompt is documented and version-controlled
- [ ] Brand constraints checked against generated outputs
- [ ] Copyright / IP risk reviewed before publishing
- [ ] Batch pipelines have a human QA gate
- [ ] Residual risks called out: bias, brand drift, quality variance
