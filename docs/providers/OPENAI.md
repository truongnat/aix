# OpenAI Setup Guide

Complete guide to using OpenAI GPT models with `agentic-sdlc`.

## 🎯 Overview

**Provider:** OpenAI  
**Models:** GPT-4o-mini, GPT-4.1-mini  
**Context Window:** 128K tokens  
**Best For:** Production, reliability, determinism  

## 🚀 Quick Start

```bash
# 1. Get API key from https://platform.openai.com/api-keys
export OPENAI_API_KEY=sk-proj-...

# 2. Configure provider
export ANTIGRAV_LLM_PROVIDER=openai

# 3. Run workflow
cargo run -- --workflow feature.md
```

## 🔧 Configuration

### Basic Setup

```bash
# Required
export OPENAI_API_KEY=sk-proj-...

# Provider selection
export ANTIGRAV_LLM_PROVIDER=openai

# Optional: Model override
export ANTIGRAV_LLM_MODEL=gpt-4o-mini
```

### Available Models

| Model | Context | Cost (Input/Output per 1M tokens) | Best For |
|-------|---------|-----------------------------------|----------|
| `gpt-4o-mini` | 128K | $0.15 / $0.60 | Fast, cost-effective (default) |
| `gpt-4.1-mini` | 128K | $0.40 / $1.60 | Higher quality |
| `gpt-4o` | 128K | $2.50 / $10.00 | Maximum quality |

### Deterministic Mode

OpenAI supports seed for perfect determinism:

```bash
export ANTIGRAV_LLM_TEMPERATURE=0.0
export ANTIGRAV_LLM_SEED=42
```

## 💰 Pricing

**GPT-4o-mini (Recommended):**
- Input: $0.15/1M tokens
- Output: $0.60/1M tokens

**Example:** 100K input + 50K output = $0.045

## 🎯 Use Cases

**Best For:**
- ✅ Production workloads
- ✅ Deterministic outputs (seed support)
- ✅ Fast responses
- ✅ Reliable API

**Example:**
```bash
export OPENAI_API_KEY=sk-proj-...
export ANTIGRAV_LLM_PROVIDER=openai
export ANTIGRAV_LLM_TEMPERATURE=0.0
cargo run -- --workflow feature.md
```

## 🧪 Testing

```bash
ANTIGRAV_RUN_LIVE_LLM_TESTS=1 \
OPENAI_API_KEY=sk-proj-... \
cargo test llm_subagent_live_smoke_openai -- --nocapture
```

## 🐛 Troubleshooting

### API Key Not Found
```bash
export OPENAI_API_KEY=sk-proj-...
```

### Rate Limit (429)
```bash
export ANTIGRAV_LLM_FALLBACK=gemini,anthropic
```

### Timeout
```bash
export ANTIGRAV_LLM_TIMEOUT_MS=180000
```

## 📚 Resources

- API Docs: https://platform.openai.com/docs
- API Keys: https://platform.openai.com/api-keys
- Pricing: https://openai.com/pricing
- Status: https://status.openai.com/

---

**Version:** 1.0  
**Last Updated:** 2026-03-07
