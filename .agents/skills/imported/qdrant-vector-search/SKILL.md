# Skill: qdrant-vector-search
Schema: antigrav.skill@v1

```json
{
  "description": "High-performance vector similarity search engine for RAG and semantic search. Use when building production RAG systems requiring fast nearest neighbor search, hybrid search with filtering, or scalable",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155449,
  "model": "qwen3:8b",
  "name": "qdrant-vector-search",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "15-rag/qdrant/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "distributed",
    "embeddings",
    "external",
    "hnsw",
    "imported",
    "production",
    "qdrant",
    "rag",
    "search",
    "semantic search",
    "similarity search",
    "vector",
    "vector search",
    "vector-db"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
High-performance vector similarity search engine for RAG and semantic search. Use when building production RAG systems requiring fast nearest neighbor search, hybrid search with filtering, or scalable vector storage with Rust-powered performance.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Python client
pip install qdrant-client

# Docker (recommended for development)
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Docker with persistent storage
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage \
    qdrant/qdrant
- from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Connect to Qdrant
client = QdrantClient(host="localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# Insert vectors with payload
client.upsert(
    collection_name="documents",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, ...],  # 384-dim vector
            payload={"title": "Doc 1", "category": "tech"}
        ),
        PointStruct(
            id=2,
            vector=[0.3, 0.4, ...],
            payload={"title": "Doc 2", "category": "science"}
        )
    ]
)

# Search with filtering
results = client.search(
    collection_name="documents",
    query_vector=[0.15, 0.25, ...],
    query_filter={
        "must": [{"key": "category", "match": {"value": "tech"}}]
    },
    limit=10
)

for point in results:
    print(f"ID: {point.id}, Score: {point.score}, Payload: {point.payload}")
- from qdrant_client.models import PointStruct

# Point = ID + Vector(s) + Payload
point = PointStruct(
    id=123,                              # Integer or UUID string
    vector=[0.1, 0.2, 0.3, ...],        # Dense vector
    payload={                            # Arbitrary JSON metadata
        "title": "Document title",
        "category": "tech",
        "timestamp": 1699900000,
        "tags": ["python", "ml"]
    }
)

# Batch upsert (recommended)
client.upsert(
    collection_name="documents",
    points=[point1, point2, point3],
    wait=True  # Wait for indexing
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `15-rag/qdrant/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Qdrant - Vector Similarity Search Engine High-performance vector database written in Rust for production RAG and semantic search. ## When to use Qdrant **Use Qdrant when:** - Building production RAG systems requiring low latency - Need hybrid search (vectors + metadata filtering) - Require horizontal scaling with sharding/replication - Want on-premise deployment with full data control - Need multi-vector storage per record (dense + sparse) - Building real-time recommendation systems **Key features:** - **Rust-powered**: Memory-safe, high performance - **Rich filtering**: Filter by any payload field during search - **Multiple vectors**: Dense, sparse, multi-dense per point - **Quantization**: Scalar, product, binary for memory efficiency - **Distributed**: Raft consensus, sharding, replic

{{input}}
