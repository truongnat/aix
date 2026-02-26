# Skill: embedding-strategies
Schema: antigrav.skill@v1

```json
{
  "description": "Select and optimize embedding models for semantic search and RAG applications. Use when choosing embedding models, implementing chunking strategies, or optimizing embedding quality for specific dom...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154375,
  "model": "qwen3:8b",
  "name": "embedding-strategies",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "embedding-strategies/SKILL.md",
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
Select and optimize embedding models for semantic search and RAG applications. Use when choosing embedding models, implementing chunking strategies, or optimizing embedding quality for specific dom...

## When to Use
- Choosing embedding models for RAG
- Optimizing chunking strategies
- Fine-tuning embeddings for domains
- Comparing embedding model performance
- Reducing embedding dimensions
- Handling multilingual content

## Examples
- Document → Chunking → Preprocessing → Embedding Model → Vector
                ↓
        [Overlap, Size]  [Clean, Normalize]  [API/Local]
- from openai import OpenAI
from typing import List
import numpy as np

client = OpenAI()

def get_embeddings(
    texts: List[str],
    model: str = "text-embedding-3-small",
    dimensions: int = None
) -> List[List[float]]:
    """Get embeddings from OpenAI."""
    # Handle batching for large lists
    batch_size = 100
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        kwargs = {"input": batch, "model": model}
        if dimensions:
            kwargs["dimensions"] = dimensions

        response = client.embeddings.create(**kwargs)
        embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(embeddings)

    return all_embeddings


def get_embedding(text: str, **kwargs) -> List[float]:
    """Get single embedding."""
    return get_embeddings([text], **kwargs)[0]


# Dimension reduction with OpenAI
def get_reduced_embedding(text: str, dimensions: int = 512) -> List[float]:
    """Get embedding with reduced dimensions (Matryoshka)."""
    return get_embedding(
        text,
        model="text-embedding-3-small",
        dimensions=dimensions
    )
- from sentence_transformers import SentenceTransformer
from typing import List, Optional
import numpy as np

class LocalEmbedder:
    """Local embedding with sentence-transformers."""

    def __init__(
        self,
        model_name: str = "BAAI/bge-large-en-v1.5",
        device: str = "cuda"
    ):
        self.model = SentenceTransformer(model_name, device=device)

    def embed(
        self,
        texts: List[str],
        normalize: bool = True,
        show_progress: bool = False
    ) -> np.ndarray:
        """Embed texts with optional normalization."""
        embeddings = self.model.encode(
            texts,
            normalize_embeddings=normalize,
            show_progress_bar=show_progress,
            convert_to_numpy=True
        )
        return embeddings

    def embed_query(self, query: str) -> np.ndarray:
        """Embed a query with BGE-style prefix."""
        # BGE models benefit from query prefix
        if "bge" in self.model.get_sentence_embedding_dimension():
            query = f"Represent this sentence for searching relevant passages: {query}"
        return self.embed([query])[0]

    def embed_documents(self, documents: List[str]) -> np.ndarray:
        """Embed documents for indexing."""
        return self.embed(documents)


# E5 model with instructions
class E5Embedder:
    def __init__(self, model_name: str = "intfloat/multilingual-e5-large"):
        self.model = SentenceTransformer(model_name)

    def embed_query(self, query: str) -> np.ndarray:
        return self.model.encode(f"query: {query}")

    def embed_document(self, document: str) -> np.ndarray:
        return self.model.encode(f"passage: {document}")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `embedding-strategies/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Embedding Strategies Guide to selecting and optimizing embedding models for vector search applications. ## Do not use this skill when - The task is unrelated to embedding strategies - You need a different domain or tool outside this scope ## Instructions - Clarify goals, constraints, and required inputs. - Apply relevant best practices and validate outcomes. - Provide actionable steps and verification. - If detailed examples are required, open `resources/implementation-playbook.md`. ## Use this skill when - Choosing embedding models for RAG - Optimizing chunking strategies - Fine-tuning embeddings for domains - Comparing embedding model performance - Reducing embedding dimensions - Handling multilingual content ## Core Concepts ### 1. Embedding Model Comparison | Model | Dimensions | Max

{{input}}
