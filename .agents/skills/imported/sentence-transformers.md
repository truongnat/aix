# Skill: sentence-transformers
Schema: antigrav.skill@v1

```json
{
  "description": "Framework for state-of-the-art sentence, text, and image embeddings. Provides 5000+ pre-trained models for semantic similarity, clustering, and retrieval. Supports multilingual, domain-specific, and m",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155450,
  "model": "qwen3:8b",
  "name": "sentence-transformers",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "15-rag/sentence-transformers/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "clustering",
    "embeddings",
    "multilingual",
    "multimodal",
    "pre-trained models",
    "production",
    "rag",
    "semantic search",
    "semantic similarity",
    "sentence transformers"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Framework for state-of-the-art sentence, text, and image embeddings. Provides 5000+ pre-trained models for semantic similarity, clustering, and retrieval. Supports multilingual, domain-specific, and multimodal models. Use for generating embeddings for RAG, semantic search, or similarity tasks. Best for production embedding generation.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install sentence-transformers
- from sentence_transformers import SentenceTransformer

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings
sentences = [
    "This is an example sentence",
    "Each sentence is converted to a vector"
]

embeddings = model.encode(sentences)
print(embeddings.shape)  # (2, 384)

# Cosine similarity
from sentence_transformers.util import cos_sim
similarity = cos_sim(embeddings[0], embeddings[1])
print(f"Similarity: {similarity.item():.4f}")
- # Fast, good quality (384 dim)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Better quality (768 dim)
model = SentenceTransformer('all-mpnet-base-v2')

# Best quality (1024 dim, slower)
model = SentenceTransformer('all-roberta-large-v1')

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `15-rag/sentence-transformers/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Sentence Transformers - State-of-the-Art Embeddings Python framework for sentence and text embeddings using transformers. ## When to use Sentence Transformers **Use when:** - Need high-quality embeddings for RAG - Semantic similarity and search - Text clustering and classification - Multilingual embeddings (100+ languages) - Running embeddings locally (no API) - Cost-effective alternative to OpenAI embeddings **Metrics**: - **15,700+ GitHub stars** - **5000+ pre-trained models** - **100+ languages** supported - Based on PyTorch/Transformers **Use alternatives instead**: - **OpenAI Embeddings**: Need API-based, highest quality - **Instructor**: Task-specific instructions - **Cohere Embed**: Managed service ## Quick start ### Installation ```bash pip install sentence-transformers ``` ### B

{{input}}
