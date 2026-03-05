# Skill: langchain
Schema: antigrav.skill@v1

```json
{
  "description": "Framework for building LLM-powered applications with agents, chains, and RAG. Supports multiple providers (OpenAI, Anthropic, Google), 500+ integrations, ReAct agents, tool calling, memory management,",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155443,
  "model": "qwen3:8b",
  "name": "langchain",
  "risk": "safe",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "14-agents/langchain/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "agents",
    "ai-research",
    "chatbots",
    "external",
    "imported",
    "langchain",
    "llm applications",
    "memory management",
    "production",
    "rag",
    "react",
    "tool calling",
    "vector stores"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Framework for building LLM-powered applications with agents, chains, and RAG. Supports multiple providers (OpenAI, Anthropic, Google), 500+ integrations, ReAct agents, tool calling, memory management, and vector store retrieval. Use for building chatbots, question-answering systems, autonomous agents, or RAG applications. Best for rapid prototyping and production deployments.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Core library (Python 3.10+)
pip install -U langchain

# With OpenAI
pip install langchain-openai

# With Anthropic
pip install langchain-anthropic

# Common extras
pip install langchain-community  # 500+ integrations
pip install langchain-chroma     # Vector store
- from langchain_anthropic import ChatAnthropic

# Initialize model
llm = ChatAnthropic(model="claude-sonnet-4-5-20250929")

# Simple completion
response = llm.invoke("Explain quantum computing in 2 sentences")
print(response.content)
- from langchain.agents import create_agent
from langchain_anthropic import ChatAnthropic

# Define tools
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"It's sunny in {city}, 72°F"

def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Search results for: {query}"

# Create agent (<10 lines!)
agent = create_agent(
    model=ChatAnthropic(model="claude-sonnet-4-5-20250929"),
    tools=[get_weather, search_web],
    system_prompt="You are a helpful assistant. Use tools when needed."
)

# Run agent
result = agent.invoke({"messages": [{"role": "user", "content": "What's the weather in Paris?"}]})
print(result["messages"][-1].content)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `14-agents/langchain/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# LangChain - Build LLM Applications with Agents & RAG The most popular framework for building LLM-powered applications. ## When to use LangChain **Use LangChain when:** - Building agents with tool calling and reasoning (ReAct pattern) - Implementing RAG (retrieval-augmented generation) pipelines - Need to swap LLM providers easily (OpenAI, Anthropic, Google) - Creating chatbots with conversation memory - Rapid prototyping of LLM applications - Production deployments with LangSmith observability **Metrics**: - **119,000+ GitHub stars** - **272,000+ repositories** use LangChain - **500+ integrations** (models, vector stores, tools) - **3,800+ contributors** **Use alternatives instead**: - **LlamaIndex**: RAG-focused, better for document Q&A - **LangGraph**: Complex stateful workflows, more

{{input}}
