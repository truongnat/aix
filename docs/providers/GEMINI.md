# Google Gemini Setup Guide

Complete guide to using Google Gemini models with `agentic-sdlc`.

## 🎯 Overview

**Provider:** Google Gemini  
**Models:** Gemini 1.5 Flash, Gemini 1.5 Pro  
**Context Window:** 1M-2M tokens  
**Best For:** Cost optimization, large context  

## 🚀 Quick Start

```bash
# 1. Get API key from https://aistudio.google.com/app/apikey
export GEMINI_API_KEY=AIza...

# 2. Configure provider
export AGENTIC_SDLC_LLM_PROVIDER=gemini

# 3. Run workflow
cargo run -- --workflow feature.md
```

## 🔧 Configuration

### Basic Setup

```bash
# Required
export GEMINI_API_KEY=AIza...

# Provider selection
export AGENTIC_SDLC_LLM_PROVIDER=gemini

# Optional: Model override
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash
```

### Available Models

| Model | Context | Cost (Input/Output per 1M tokens) | Best For |
|-------|---------|-----------------------------------|----------|
| `gemini-1.5-flash` | 1M | $0.075 / $0.30 | Fast, cheapest (default) |
| `gemini-1.5-pro` | 2M | $0.25 / $1.00 | Higher quality, huge context |

## 💰 Pricing

**Gemini 1.5 Flash (Cheapest Cloud Option):**
- Input: $0.075/1M tokens
- Output: $0.30/1M tokens

**Example:** 100K input + 50K output = $0.0225 (50% cheaper than OpenAI!)

## 🎯 Use Cases

**Best For:**
- ✅ Cost-sensitive workloads
- ✅ Large context (1M-2M tokens)
- ✅ Fast responses
- ✅ Good quality

**Example:**
```bash
export GEMINI_API_KEY=AIza...
export AGENTIC_SDLC_LLM_PROVIDER=gemini
cargo run -- --workflow feature.md
```

## 🧪 Testing

```bash
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
GEMINI_API_KEY=AIza... \
cargo test llm_subagent_live_smoke_gemini -- --nocapture
```

## 🐛 Troubleshooting

### API Key Not Found
```bash
export GEMINI_API_KEY=AIza...
```

### Rate Limit
```bash
export AGENTIC_SDLC_LLM_FALLBACK=openai,anthropic
```

### Model Not Found
```bash
# Use full model path
export AGENTIC_SDLC_LLM_MODEL=models/gemini-1.5-flash
# or just
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash
```

## 📚 Resources

- API Studio: https://aistudio.google.com/
- API Docs: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing

---

**Version:** 1.0  
**Last Updated:** 2026-03-07
