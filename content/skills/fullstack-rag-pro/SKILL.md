---
name: fullstack-rag-pro
description: >-
  Building production-grade Retrieval-Augmented Generation (RAG) pipelines with
  Vector DBs and hybrid search.
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

# Fullstack RAG Pro

## Boundary
This skill covers the end-to-end RAG architecture: document ingestion, chunking, embedding generation, vector database querying, and LLM synthesis.

## When to use
- Building an AI chat application with custom knowledge.
- Indexing documents (PDFs, markdown) into a Vector DB.
- Implementing semantic search or hybrid search (semantic + keyword).
- Optimizing RAG context windows and retrieval quality.

## Workflow
1. **Ingestion Strategy**: Determine document parsers and chunking logic (e.g., recursive character text splitter).
2. **Embedding Selection**: Choose embedding model (OpenAI `text-embedding-3-small`, local BGE, etc.).
3. **Database Choice**: Use pgvector, Pinecone, or Qdrant for vector storage.
4. **Retrieval**: Implement cosine similarity search with optional metadata filtering.
5. **Synthesis**: Format retrieved context cleanly into the LLM system prompt.

### Operating principles
- **Garbage In, Garbage Out**: Focus 80% of effort on chunking quality and clean metadata.
- **Hybrid is King**: Always combine semantic search with traditional keyword search (BM25) for best results.
- **Context Management**: Limit injected context to leave room for the LLM's reasoning and the user's prompt.
- **Karpathy Principles Apply**: Think before coding, keep it simple, make surgical changes, and define success criteria.

## Suggested response format
Your response MUST use the professional XML-style format:

```xml
<Role>
Senior AI Engineer (RAG Expert).
</Role>

<Feature>
[Brief description of the RAG module]
</Feature>

<Implementation>
[Modular code for Ingestion/Retrieval]
</Implementation>

<Verification>
[Step-by-step verification plan]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| pgvector Docs | [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) |
| OpenAI RAG Guide | [platform.openai.com/docs/guides/embeddings](https://platform.openai.com/docs/guides/embeddings) |
| Chunking Strategies | [pinecone.io/learn/chunking-strategies](https://www.pinecone.io/learn/chunking-strategies/) |

## Quick example
```typescript
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';

export async function findRelevantContent(userQuery: string) {
  // 1. Generate embedding
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: userQuery,
  });

  // 2. Vector search (pgvector example)
  const results = await db.$queryRaw`
    SELECT id, content, 1 - (embedding <=> ${embedding}::vector) as similarity
    FROM documents
    WHERE 1 - (embedding <=> ${embedding}::vector) > 0.5
    ORDER BY similarity DESC
    LIMIT 5;
  `;

  return results;
}
```

## Checklist before calling the skill done
- [ ] **Think Before Coding**: Data schema and chunking strategy defined before implementation.
- [ ] **Simplicity First**: Native implementation preferred over heavy frameworks unless justified.
- [ ] **Surgical Changes**: Only modify parts of the ingestion/retrieval pipeline that are affected.
- [ ] **Goal-Driven Execution**: Retrieval quality verified with sample queries.
- [ ] Is the chunking strategy documented and rationalized?
- [ ] Is there metadata attached to chunks for filtering?
- [ ] Is the LLM prompt protected against context overflow?
