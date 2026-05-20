# Skill: rag-implementation
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "RAG (Retrieval-Augmented Generation) implementation workflow covering embedding selection, vector database setup, chunking strategies, and retrieval optimization.",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154396,
  "model": "qwen3:8b",
  "name": "rag-implementation",
  "risk": "safe",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "rag-implementation/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "implementation",
    "imported",
    "rag",
    "vector-db"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
RAG (Retrieval-Augmented Generation) implementation workflow covering embedding selection, vector database setup, chunking strategies, and retrieval optimization.

## When to Use
- Use when the task matches this skill domain.

## Examples
- Use @ai-product to define RAG application requirements
- Use @embedding-strategies to select optimal embedding model
- Use @vector-database-engineer to set up vector database

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `rag-implementation/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# RAG Implementation Workflow ## Overview Specialized workflow for implementing RAG (Retrieval-Augmented Generation) systems including embedding model selection, vector database setup, chunking strategies, retrieval optimization, and evaluation. ## When to Use This Workflow Use this workflow when: - Building RAG-powered applications - Implementing semantic search - Creating knowledge-grounded AI - Setting up document Q&A systems - Optimizing retrieval quality ## Workflow Phases ### Phase 1: Requirements Analysis #### Skills to Invoke - `ai-product` - AI product design - `rag-engineer` - RAG engineering #### Actions 1. Define use case 2. Identify data sources 3. Set accuracy requirements 4. Determine latency targets 5. Plan evaluation metrics #### Copy-Paste Prompts ``` Use @ai-product to d

{{input}}
