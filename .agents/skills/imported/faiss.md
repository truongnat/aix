# Skill: faiss
Schema: antigrav.skill@v1

```json
{
  "description": "Facebook's library for efficient similarity search and clustering of dense vectors. Supports billions of vectors, GPU acceleration, and various index types (Flat, IVF, HNSW). Use for fast k-NN search,",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155447,
  "model": "qwen3:8b",
  "name": "faiss",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "15-rag/faiss/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "billion-scale",
    "facebook ai",
    "faiss",
    "gpu acceleration",
    "high performance",
    "hnsw",
    "k-nn",
    "large scale",
    "rag",
    "similarity search",
    "vector search"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Facebook's library for efficient similarity search and clustering of dense vectors. Supports billions of vectors, GPU acceleration, and various index types (Flat, IVF, HNSW). Use for fast k-NN search, large-scale vector retrieval, or when you need pure similarity search without metadata. Best for high-performance applications.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # CPU only
pip install faiss-cpu

# GPU support
pip install faiss-gpu
- import faiss
import numpy as np

# Create sample data (1000 vectors, 128 dimensions)
d = 128
nb = 1000
vectors = np.random.random((nb, d)).astype('float32')

# Create index
index = faiss.IndexFlatL2(d)  # L2 distance
index.add(vectors)             # Add vectors

# Search
k = 5  # Find 5 nearest neighbors
query = np.random.random((1, d)).astype('float32')
distances, indices = index.search(query, k)

print(f"Nearest neighbors: {indices}")
print(f"Distances: {distances}")
- # L2 (Euclidean) distance
index = faiss.IndexFlatL2(d)

# Inner product (cosine similarity if normalized)
index = faiss.IndexFlatIP(d)

# Slowest, most accurate

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `15-rag/faiss/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# FAISS - Efficient Similarity Search Facebook AI's library for billion-scale vector similarity search. ## When to use FAISS **Use FAISS when:** - Need fast similarity search on large vector datasets (millions/billions) - GPU acceleration required - Pure vector similarity (no metadata filtering needed) - High throughput, low latency critical - Offline/batch processing of embeddings **Metrics**: - **31,700+ GitHub stars** - Meta/Facebook AI Research - **Handles billions of vectors** - **C++** with Python bindings **Use alternatives instead**: - **Chroma/Pinecone**: Need metadata filtering - **Weaviate**: Need full database features - **Annoy**: Simpler, fewer features ## Quick start ### Installation ```bash # CPU only pip install faiss-cpu # GPU support pip install faiss-gpu ``` ### Basic u

{{input}}
