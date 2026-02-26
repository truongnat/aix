# Skill: go-playwright
Schema: antigrav.skill@v1

```json
{
  "description": "Expert capability for robust, stealthy, and efficient browser automation using Playwright Go.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154381,
  "model": "qwen3:8b",
  "name": "go-playwright",
  "risk": "safe",
  "source": "https://github.com/playwright-community/playwright-go",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "go-playwright/SKILL.md",
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
Expert capability for robust, stealthy, and efficient browser automation using Playwright Go.

## When to Use
- Use when the user asks to "scrape," "automate," or "test" a website using Go.
- Use when the target site has complex dynamic content (SPA, React, Vue) requiring a real browser.
- Use when the user mentions "stealth," "avoiding detection," "cloudflare," or "human-like" behavior.
- Use when debugging existing Playwright scripts.

## Examples
- This skill provides a comprehensive framework for writing high-performance, production-grade browser automation scripts using `github.com/playwright-community/playwright-go`. It enforces architectural best practices (contexts over instances), robust error handling, structured logging (Zap), and advanced human-emulation techniques to bypass anti-bot systems.

## Limitations
- **Environment Dependencies:** Requires Playwright drivers and browsers to be installed (`go run github.com/playwright-community/playwright-go/cmd/playwright@latest install --with-deps`).
- **Resource Intensity:** Launching full browser instances (even headless) consumes significant RAM/CPU. Use single-browser/multi-context architecture.
- **Bot Detection:** While this skill includes stealth techniques, extremely strict anti-bot systems (e.g., rigorous Cloudflare settings) may still detect automation.
- **CAPTCHAs:** Does not include built-in CAPTCHA solving capabilities.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `go-playwright/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Playwright Go Automation Expert ## Overview This skill provides a comprehensive framework for writing high-performance, production-grade browser automation scripts using `github.com/playwright-community/playwright-go`. It enforces architectural best practices (contexts over instances), robust error handling, structured logging (Zap), and advanced human-emulation techniques to bypass anti-bot systems. ## When to Use This Skill - Use when the user asks to "scrape," "automate," or "test" a website using Go. - Use when the target site has complex dynamic content (SPA, React, Vue) requiring a real browser. - Use when the user mentions "stealth," "avoiding detection," "cloudflare," or "human-like" behavior. - Use when debugging existing Playwright scripts. ## Safety & Risk **Risk Level: 🔵 Safe

{{input}}
