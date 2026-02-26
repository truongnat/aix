# Skill: ml-paper-writing
Schema: antigrav.skill@v1

```json
{
  "description": "Write publication-ready ML/AI papers for NeurIPS, ICML, ICLR, ACL, AAAI, COLM. Use when drafting papers from research repos, structuring arguments, verifying citations, or preparing camera-ready submi",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155491,
  "model": "qwen3:8b",
  "name": "ml-paper-writing",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "20-ml-paper-writing/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "aaai",
    "academic writing",
    "acl",
    "ai-research",
    "citations",
    "colm",
    "iclr",
    "icml",
    "latex",
    "neurips",
    "paper writing",
    "research"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Write publication-ready ML/AI papers for NeurIPS, ICML, ICLR, ACL, AAAI, COLM. Use when drafting papers from research repos, structuring arguments, verifying citations, or preparing camera-ready submissions. Includes LaTeX templates, reviewer guidelines, and citation verification workflows.

## When to Use
- **Starting from a research repo** to write a paper
- **Drafting or revising** specific sections
- **Finding and verifying citations** for related work
- **Formatting** for conference submission
- **Resubmitting** to a different venue (format conversion)
- **Iterating** on drafts with scientist feedback

## Examples
- % EXPLICIT PLACEHOLDER - requires human verification
\cite{PLACEHOLDER_author2024_verify_this}  % TODO: Verify this citation exists
- claude mcp add exa -- npx -y mcp-remote "https://mcp.exa.ai/mcp"
- {
  "mcpServers": {
    "exa": {
      "type": "http",
      "url": "https://mcp.exa.ai/mcp"
    }
  }
}

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `20-ml-paper-writing/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# ML Paper Writing for Top AI Conferences Expert-level guidance for writing publication-ready papers targeting **NeurIPS, ICML, ICLR, ACL, AAAI, and COLM**. This skill combines writing philosophy from top researchers (Nanda, Farquhar, Karpathy, Lipton, Steinhardt) with practical tools: LaTeX templates, citation verification APIs, and conference checklists. ## Core Philosophy: Collaborative Writing **Paper writing is collaborative, but Claude should be proactive in delivering drafts.** The typical workflow starts with a research repository containing code, results, and experimental artifacts. Claude's role is to: 1. **Understand the project** by exploring the repo, results, and existing documentation 2. **Deliver a complete first draft** when confident about the contribution 3. **Search lit

{{input}}
