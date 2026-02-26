# Skill: algorithmic-art
Schema: antigrav.skill@v1

```json
{
  "description": "Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or",
  "domain": "anthropic",
  "executor": "ollama",
  "imported_at_ms": 1772121153423,
  "model": "qwen3:8b",
  "name": "algorithmic-art",
  "risk": "unknown",
  "source": "anthropics/skills",
  "source_commit": "3d5951151859",
  "source_license": "unknown",
  "source_path": "algorithmic-art/SKILL.md",
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
Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.

## When to Use
- Use when the task matches this skill domain.

## Examples
- // ALWAYS use a seed for reproducibility
let seed = 12345; // or hash from user input
randomSeed(seed);
noiseSeed(seed);
- let params = {
  seed: 12345,  // Always include seed for reproducibility
  // colors
  // Add parameters that control YOUR algorithm:
  // - Quantities (how many?)
  // - Scales (how big? how fast?)
  // - Probabilities (how likely?)
  // - Ratios (what proportions?)
  // - Angles (what direction?)
  // - Thresholds (when does behavior change?)
};
- function setup() {
  createCanvas(1200, 1200);
  // Initialize your system
}

function draw() {
  // Your generative algorithm
  // Can be static (noLoop) or animated
}

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/anthropic-skills`; resolved source `/private/tmp/agentic-sdlc-curated/anthropic-skills`; path `algorithmic-art/SKILL.md`.
Detected source license: `unknown`.

Original excerpt:

Algorithmic philosophies are computational aesthetic movements that are then expressed through code. Output .md files (philosophy), .html files (interactive viewer), and .js files (generative algorithms). This happens in two steps: 1. Algorithmic Philosophy Creation (.md file) 2. Express by creating p5.js generative art (.html + .js files) First, undertake this task: ## ALGORITHMIC PHILOSOPHY CREATION To begin, create an ALGORITHMIC PHILOSOPHY (not static images or templates) that will be interpreted through: - Computational processes, emergent behavior, mathematical beauty - Seeded randomness, noise fields, organic systems - Particles, flows, fields, forces - Parametric variation and controlled chaos ### THE CRITICAL UNDERSTANDING - What is received: Some subtle input or instructions by t

{{input}}
