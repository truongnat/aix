# Skill: product-manager-toolkit
Schema: antigrav.skill@v1

```json
{
  "description": "Comprehensive toolkit for product managers including RICE prioritization, customer interview analysis, PRD templates, discovery frameworks, and go-to-market strategies. Use for feature prioritizati...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154395,
  "model": "qwen3:8b",
  "name": "product-manager-toolkit",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "product-manager-toolkit/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Comprehensive toolkit for product managers including RICE prioritization, customer interview analysis, PRD templates, discovery frameworks, and go-to-market strategies. Use for feature prioritizati...

## When to Use
- Use when the task matches this skill domain.

## Examples
- python scripts/rice_prioritizer.py sample  # Create sample CSV
python scripts/rice_prioritizer.py sample_features.csv --capacity 15
- python scripts/customer_interview_analyzer.py interview_transcript.txt
- # Create CSV with: name,reach,impact,confidence,effort
   python scripts/rice_prioritizer.py features.csv

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `product-manager-toolkit/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Product Manager Toolkit Essential tools and frameworks for modern product management, from discovery to delivery. ## Quick Start ### For Feature Prioritization ```bash python scripts/rice_prioritizer.py sample # Create sample CSV python scripts/rice_prioritizer.py sample_features.csv --capacity 15 ``` ### For Interview Analysis ```bash python scripts/customer_interview_analyzer.py interview_transcript.txt ``` ### For PRD Creation 1. Choose template from `references/prd_templates.md` 2. Fill in sections based on discovery work 3. Review with stakeholders 4. Version control in your PM tool ## Core Workflows ### Feature Prioritization Process 1. **Gather Feature Requests** - Customer feedback - Sales requests - Technical debt - Strategic initiatives 2. **Score with RICE** ```bash # Create C

{{input}}
