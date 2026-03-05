# Skill: pinecone
Schema: antigrav.skill@v1

```json
{
  "description": "Managed vector database for production AI applications. Fully managed, auto-scaling, with hybrid search (dense + sparse), metadata filtering, and namespaces. Low latency (<100ms p95). Use for producti",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155448,
  "model": "qwen3:8b",
  "name": "pinecone",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "15-rag/pinecone/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "auto-scaling",
    "external",
    "hybrid search",
    "imported",
    "low latency",
    "managed service",
    "pinecone",
    "production",
    "rag",
    "recommendations",
    "serverless",
    "vector database",
    "vector-db"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Managed vector database for production AI applications. Fully managed, auto-scaling, with hybrid search (dense + sparse), metadata filtering, and namespaces. Low latency (<100ms p95). Use for production RAG, recommendation systems, or semantic search at scale. Best for serverless, managed infrastructure.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install pinecone-client
- from pinecone import Pinecone, ServerlessSpec

# Initialize
pc = Pinecone(api_key="your-api-key")

# Create index
pc.create_index(
    name="my-index",
    dimension=1536,  # Must match embedding dimension
    metric="cosine",  # or "euclidean", "dotproduct"
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)

# Connect to index
index = pc.Index("my-index")

# Upsert vectors
index.upsert(vectors=[
    {"id": "vec1", "values": [0.1, 0.2, ...], "metadata": {"category": "A"}},
    {"id": "vec2", "values": [0.3, 0.4, ...], "metadata": {"category": "B"}}
])

# Query
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=5,
    include_metadata=True
)

print(results["matches"])
- # Serverless (recommended)
pc.create_index(
    name="my-index",
    dimension=1536,
    metric="cosine",
    spec=ServerlessSpec(
        cloud="aws",         # or "gcp", "azure"
        region="us-east-1"
    )
)

# Pod-based (for consistent performance)
from pinecone import PodSpec

pc.create_index(
    name="my-index",
    dimension=1536,
    metric="cosine",
    spec=PodSpec(
        environment="us-east1-gcp",
        pod_type="p1.x1"
    )
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `15-rag/pinecone/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Pinecone - Managed Vector Database The vector database for production AI applications. ## When to use Pinecone **Use when:** - Need managed, serverless vector database - Production RAG applications - Auto-scaling required - Low latency critical (<100ms) - Don't want to manage infrastructure - Need hybrid search (dense + sparse vectors) **Metrics**: - Fully managed SaaS - Auto-scales to billions of vectors - **p95 latency <100ms** - 99.9% uptime SLA **Use alternatives instead**: - **Chroma**: Self-hosted, open-source - **FAISS**: Offline, pure similarity search - **Weaviate**: Self-hosted with more features ## Quick start ### Installation ```bash pip install pinecone-client ``` ### Basic usage ```python from pinecone import Pinecone, ServerlessSpec # Initialize pc = Pinecone(api_key="your

{{input}}
