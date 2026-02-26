# Skill: llamaindex
Schema: antigrav.skill@v1

```json
{
  "description": "Data framework for building LLM applications with RAG. Specializes in document ingestion (300+ connectors), indexing, and querying. Features vector indices, query engines, agents, and multi-modal supp",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155445,
  "model": "qwen3:8b",
  "name": "llamaindex",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "14-agents/llamaindex/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "agents",
    "ai-research",
    "connectors",
    "data framework",
    "document ingestion",
    "knowledge retrieval",
    "llamaindex",
    "multimodal",
    "private data",
    "query engines",
    "rag",
    "vector indices"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Data framework for building LLM applications with RAG. Specializes in document ingestion (300+ connectors), indexing, and querying. Features vector indices, query engines, agents, and multi-modal support. Use for document Q&A, chatbots, knowledge retrieval, or building RAG pipelines. Best for data-centric LLM applications.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Starter package (recommended)
pip install llama-index

# Or minimal core + specific integrations
pip install llama-index-core
pip install llama-index-llms-openai
pip install llama-index-embeddings-openai
- from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Load documents
documents = SimpleDirectoryReader("data").load_data()

# Create index
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)
- from llama_index.core import SimpleDirectoryReader, Document
from llama_index.readers.web import SimpleWebPageReader
from llama_index.readers.github import GithubRepositoryReader

# Directory of files
documents = SimpleDirectoryReader("./data").load_data()

# Web pages
reader = SimpleWebPageReader()
documents = reader.load_data(["https://example.com"])

# GitHub repository
reader = GithubRepositoryReader(owner="user", repo="repo")
documents = reader.load_data(branch="main")

# Manual document creation
doc = Document(
    text="This is the document content",
    metadata={"source": "manual", "date": "2025-01-01"}
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `14-agents/llamaindex/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# LlamaIndex - Data Framework for LLM Applications The leading framework for connecting LLMs with your data. ## When to use LlamaIndex **Use LlamaIndex when:** - Building RAG (retrieval-augmented generation) applications - Need document question-answering over private data - Ingesting data from multiple sources (300+ connectors) - Creating knowledge bases for LLMs - Building chatbots with enterprise data - Need structured data extraction from documents **Metrics**: - **45,100+ GitHub stars** - **23,000+ repositories** use LlamaIndex - **300+ data connectors** (LlamaHub) - **1,715+ contributors** - **v0.14.7** (stable) **Use alternatives instead**: - **LangChain**: More general-purpose, better for agents - **Haystack**: Production search pipelines - **txtai**: Lightweight semantic search -

{{input}}
