# Skill: deployment-procedures
Schema: antigrav.skill@v1

```json
{
  "description": "Production deployment principles and decision-making. Safe deployment workflows, rollback strategies, and verification. Teaches thinking, not scripts.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154373,
  "model": "qwen3:8b",
  "name": "deployment-procedures",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "deployment-procedures/SKILL.md",
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
Production deployment principles and decision-making. Safe deployment workflows, rollback strategies, and verification. Teaches thinking, not scripts.

## When to Use
- Use when the task matches this skill domain.

## Examples
- What are you deploying?
│
├── Static site / JAMstack
│   └── Vercel, Netlify, Cloudflare Pages
│
├── Simple web app
│   ├── Managed → Railway, Render, Fly.io
│   └── Control → VPS + PM2/Docker
│
├── Microservices
│   └── Container orchestration
│
└── Serverless
    └── Edge functions, Lambda
- 1. PREPARE
   └── Verify code, build, env vars

2. BACKUP
   └── Save current state before changing

3. DEPLOY
   └── Execute with monitoring open

4. VERIFY
   └── Health check, logs, key flows

5. CONFIRM or ROLLBACK
   └── All good? Confirm. Issues? Rollback.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `deployment-procedures/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Deployment Procedures > Deployment principles and decision-making for safe production releases. > **Learn to THINK, not memorize scripts.** --- ## ⚠️ How to Use This Skill This skill teaches **deployment principles**, not bash scripts to copy. - Every deployment is unique - Understand the WHY behind each step - Adapt procedures to your platform --- ## 1. Platform Selection ### Decision Tree ``` What are you deploying? │ ├── Static site / JAMstack │ └── Vercel, Netlify, Cloudflare Pages │ ├── Simple web app │ ├── Managed → Railway, Render, Fly.io │ └── Control → VPS + PM2/Docker │ ├── Microservices │ └── Container orchestration │ └── Serverless └── Edge functions, Lambda ``` ### Each Platform Has Different Procedures | Platform | Deployment Method | |----------|------------------| | **Ver

{{input}}
