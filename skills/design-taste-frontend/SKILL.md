---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "frontend,ui,ux,visual-design"
  roles: "designer,frontend"
  compatible: "claude,cursor,codex,gemini"

---
# Design Taste Frontend

## Boundary

This skill owns **distinctive frontend art direction and anti-template visual choices**. It does not own **backend, data, or framework architecture**; hand off those concerns to the relevant domain skill.

## When not to use

- When the request is outside the boundary above or requires a different primary owner.
- When a shared design-system, accessibility, or framework contract already governs the decision and should lead.

## Required inputs

- Target users, product goal, platform/device constraints, and existing assets.
- Current implementation or visual references, quality criteria, and known accessibility requirements.
- Desired output type, scope of change, and verification evidence expected.

## Cross-skill handoffs

- `sk-design-system-pro` / `sk-design-system-pro` for tokens, themes, and reusable component governance.
- `sk-accessibility-compliance` for WCAG, keyboard, screen-reader, and assistive-technology requirements.
- `sk-frontend-patterns` / `sk-web-component-design` for implementation and component API decisions.
- `sk-frontend-design-pro` / `sk-ux-design-pro` for product-level visual direction and interaction design.

## Use this skill when

Use this skill for the frontend/design work described by the skill trigger and boundaries. Read the detailed reference only after confirming the task scope, audience, platform, and constraints.

## Workflow

1. Confirm the brief, target users, platform, constraints, and existing assets.
2. Select the relevant patterns and make the design/engineering trade-offs explicit.
3. Implement or review the result with responsive, accessible, and maintainable behavior.
4. Verify the result against the requested quality gates and record risks or follow-up work.

## Output

Produce a decision-ready frontend artifact containing the selected direction/pattern, implementation or file paths, responsive and accessibility behavior, verification evidence, risks, and next steps.

## Detailed reference

Read `references/design-taste-frontend-reference.md` for the full pattern library, examples, and extended quality gates.
