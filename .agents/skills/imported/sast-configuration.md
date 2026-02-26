# Skill: sast-configuration
Schema: antigrav.skill@v1

```json
{
  "description": "Configure Static Application Security Testing (SAST) tools for automated vulnerability detection in application code. Use when setting up security scanning, implementing DevSecOps practices, or aut...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154399,
  "model": "qwen3:8b",
  "name": "sast-configuration",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "sast-configuration/SKILL.md",
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
Configure Static Application Security Testing (SAST) tools for automated vulnerability detection in application code. Use when setting up security scanning, implementing DevSecOps practices, or aut...

## When to Use
- Set up SAST scanning in CI/CD pipelines
- Create custom security rules for your codebase
- Configure quality gates and compliance policies
- Optimize scan performance and reduce false positives
- Integrate multiple SAST tools for defense-in-depth

## Examples
- # Semgrep quick start
pip install semgrep
semgrep --config=auto --error

# SonarQube with Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# CodeQL CLI setup
gh extension install github/gh-codeql
codeql database create mydb --language=python
- # GitHub Actions example
- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/owasp-top-ten
- # .pre-commit-config.yaml
- repo: https://github.com/returntocorp/semgrep
  rev: v1.45.0
  hooks:
    - id: semgrep
      args: ['--config=auto', '--error']

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `sast-configuration/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# SAST Configuration Static Application Security Testing (SAST) tool setup, configuration, and custom rule creation for comprehensive security scanning across multiple programming languages. ## Use this skill when - Set up SAST scanning in CI/CD pipelines - Create custom security rules for your codebase - Configure quality gates and compliance policies - Optimize scan performance and reduce false positives - Integrate multiple SAST tools for defense-in-depth ## Do not use this skill when - You only need DAST or manual penetration testing guidance - You cannot access source code or CI/CD pipelines - You need organizational policy decisions rather than tooling setup ## Instructions 1. Identify languages, repos, and compliance requirements. 2. Choose tools and define a baseline policy. 3. Int

{{input}}
