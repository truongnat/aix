# Skill: chroma
Schema: antigrav.skill@v1

```json
{
  "description": "Open-source embedding database for AI applications. Store embeddings and metadata, perform vector and full-text search, filter by metadata. Simple 4-function API. Scales from notebooks to production c",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155446,
  "model": "qwen3:8b",
  "name": "chroma",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "15-rag/chroma/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "chroma",
    "document retrieval",
    "embeddings",
    "metadata filtering",
    "open source",
    "rag",
    "self-hosted",
    "semantic search",
    "vector database"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Open-source embedding database for AI applications. Store embeddings and metadata, perform vector and full-text search, filter by metadata. Simple 4-function API. Scales from notebooks to production clusters. Use for semantic search, RAG applications, or document retrieval. Best for local development and open-source projects.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Python
pip install chromadb

# JavaScript/TypeScript
npm install chromadb @chroma-core/default-embed
- import chromadb

# Create client
client = chromadb.Client()

# Create collection
collection = client.create_collection(name="my_collection")

# Add documents
collection.add(
    documents=["This is document 1", "This is document 2"],
    metadatas=[{"source": "doc1"}, {"source": "doc2"}],
    ids=["id1", "id2"]
)

# Query
results = collection.query(
    query_texts=["document about topic"],
    n_results=2
)

print(results)
- # Simple collection
collection = client.create_collection("my_docs")

# With custom embedding function
from chromadb.utils import embedding_functions

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="your-key",
    model_name="text-embedding-3-small"
)

collection = client.create_collection(
    name="my_docs",
    embedding_function=openai_ef
)

# Get existing collection
collection = client.get_collection("my_docs")

# Delete collection
client.delete_collection("my_docs")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `15-rag/chroma/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Chroma - Open-Source Embedding Database The AI-native database for building LLM applications with memory. ## When to use Chroma **Use Chroma when:** - Building RAG (retrieval-augmented generation) applications - Need local/self-hosted vector database - Want open-source solution (Apache 2.0) - Prototyping in notebooks - Semantic search over documents - Storing embeddings with metadata **Metrics**: - **24,300+ GitHub stars** - **1,900+ forks** - **v1.3.3** (stable, weekly releases) - **Apache 2.0 license** **Use alternatives instead**: - **Pinecone**: Managed cloud, auto-scaling - **FAISS**: Pure similarity search, no metadata - **Weaviate**: Production ML-native database - **Qdrant**: High performance, Rust-based ## Quick start ### Installation ```bash # Python pip install chromadb # Java

{{input}}
