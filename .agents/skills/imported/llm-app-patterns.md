# Skill: llm-app-patterns
Schema: antigrav.skill@v1

```json
{
  "description": "Production-ready patterns for building LLM applications. Covers RAG pipelines, agent architectures, prompt IDEs, and LLMOps monitoring. Use when designing AI applications, implementing RAG, buildin...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154390,
  "model": "qwen3:8b",
  "name": "llm-app-patterns",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "llm-app-patterns/SKILL.md",
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
Production-ready patterns for building LLM applications. Covers RAG pipelines, agent architectures, prompt IDEs, and LLMOps monitoring. Use when designing AI applications, implementing RAG, buildin...

## When to Use
- Designing LLM-powered applications
- Implementing RAG (Retrieval-Augmented Generation)
- Building AI agents with tools
- Setting up LLMOps monitoring
- Choosing between agent architectures

## Examples
- ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Ingest    │────▶│   Retrieve  │────▶│   Generate  │
│  Documents  │     │   Context   │     │   Response  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
 ┌─────────┐       ┌───────────┐       ┌───────────┐
 │ Chunking│       │  Vector   │       │    LLM    │
 │Embedding│       │  Search   │       │  + Context│
 └─────────┘       └───────────┘       └───────────┘
- # Chunking strategies
class ChunkingStrategy:
    # Fixed-size chunks (simple but may break context)
    FIXED_SIZE = "fixed_size"  # e.g., 512 tokens

    # Semantic chunking (preserves meaning)
    SEMANTIC = "semantic"      # Split on paragraphs/sections

    # Recursive splitting (tries multiple separators)
    RECURSIVE = "recursive"    # ["\n\n", "\n", " ", ""]

    # Document-aware (respects structure)
    DOCUMENT_AWARE = "document_aware"  # Headers, lists, etc.

# Recommended settings
CHUNK_CONFIG = {
    "chunk_size": 512,       # tokens
    "chunk_overlap": 50,     # token overlap between chunks
    "separators": ["\n\n", "\n", ". ", " "],
}
- # Vector database selection
VECTOR_DB_OPTIONS = {
    "pinecone": {
        "use_case": "Production, managed service",
        "scale": "Billions of vectors",
        "features": ["Hybrid search", "Metadata filtering"]
    },
    "weaviate": {
        "use_case": "Self-hosted, multi-modal",
        "scale": "Millions of vectors",
        "features": ["GraphQL API", "Modules"]
    },
    "chromadb": {
        "use_case": "Development, prototyping",
        "scale": "Thousands of vectors",
        "features": ["Simple API", "In-memory option"]
    },
    "pgvector": {
        "use_case": "Existing Postgres infrastructure",
        "scale": "Millions of vectors",
        "features": ["SQL integration", "ACID compliance"]
    }
}

# Embedding model selection
EMBEDDING_MODELS = {
    "openai/text-embedding-3-small": {
        "dimensions": 1536,
        "cost": "$0.02/1M tokens",
        "quality": "Good for most use cases"
    },
    "openai/text-embedding-3-large": {
        "dimensions": 3072,
        "cost": "$0.13/1M tokens",
        "quality": "Best for complex queries"
    },
    "local/bge-large": {
        "dimensions": 1024,
        "cost": "Free (compute only)",
        "quality": "Comparable to OpenAI small"
    }
}

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `llm-app-patterns/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# 🤖 LLM Application Patterns > Production-ready patterns for building LLM applications, inspired by [Dify](https://github.com/langgenius/dify) and industry best practices. ## When to Use This Skill Use this skill when: - Designing LLM-powered applications - Implementing RAG (Retrieval-Augmented Generation) - Building AI agents with tools - Setting up LLMOps monitoring - Choosing between agent architectures --- ## 1. RAG Pipeline Architecture ### Overview RAG (Retrieval-Augmented Generation) grounds LLM responses in your data. ``` ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ Ingest │────▶│ Retrieve │────▶│ Generate │ │ Documents │ │ Context │ │ Response │ └─────────────┘ └─────────────┘ └─────────────┘ │ │ │ ▼ ▼ ▼ ┌─────────┐ ┌───────────┐ ┌───────────┐ │ Chunking│ │ Vector │ │ LLM │ │

{{input}}
