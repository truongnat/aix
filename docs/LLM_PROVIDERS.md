# LLM Providers Guide

Complete guide to all 6 supported LLM providers in `agentic-sdlc`.

## 📊 Provider Overview

| Provider | Models | Context | Cost | Speed | Setup |
|----------|--------|---------|------|-------|-------|
| **Ollama** | Local models | 2K-128K | Free | Fast | Easy |
| **OpenAI** | GPT-4o-mini, GPT-4.1-mini | 128K | $$ | Fast | Easy |
| **Gemini** | Gemini 1.5 Flash/Pro | 1M-2M | $ | Fast | Easy |
| **Anthropic** | Claude 3.5 Haiku/Sonnet | 200K | $$$ | Medium | Easy |
| **Azure OpenAI** | Same as OpenAI | 128K | $$ | Fast | Medium |
| **AWS Bedrock** | Claude on AWS | 200K | $$$ | Medium | Hard |

## 🎯 Quick Start

### Choose Your Provider

**For Development:**
```bash
# Use Ollama (free, local)
export AGENTIC_SDLC_LLM_PROVIDER=ollama
cargo run -- --workflow feature.md
```

**For Production:**
```bash
# Use OpenAI (reliable, fast)
export AGENTIC_SDLC_LLM_PROVIDER=openai
export OPENAI_API_KEY=sk-...
cargo run -- --workflow feature.md
```

**For Cost Optimization:**
```bash
# Use Gemini (cheapest cloud option)
export AGENTIC_SDLC_LLM_PROVIDER=gemini
export GEMINI_API_KEY=...
cargo run -- --workflow feature.md
```

## 📖 Provider Details

### 1. Ollama (Local)

**Best For:** Development, testing, offline work

**Pros:**
- ✅ Free
- ✅ Fast (local)
- ✅ No API keys
- ✅ Privacy (data stays local)
- ✅ Offline capable

**Cons:**
- ❌ Requires local setup
- ❌ Limited model selection
- ❌ No seed support (less deterministic)
- ❌ Smaller context windows

**Setup:** See [Ollama Setup Guide](providers/OLLAMA.md)

**Default Model:** `qwen3:8b`

**Cost:** $0 (free)

---

### 2. OpenAI

**Best For:** Production, reliability, determinism

**Pros:**
- ✅ Reliable API
- ✅ Fast responses
- ✅ Seed support (deterministic)
- ✅ Large context (128K)
- ✅ Good documentation

**Cons:**
- ❌ Costs money
- ❌ Requires API key
- ❌ Data sent to OpenAI

**Setup:** See [OpenAI Setup Guide](providers/OPENAI.md)

**Default Model:** `gpt-4o-mini`

**Cost:** 
- Input: $0.15/1M tokens
- Output: $0.60/1M tokens

---

### 3. Google Gemini

**Best For:** Cost optimization, large context

**Pros:**
- ✅ Cheapest cloud option
- ✅ Huge context (1M-2M tokens)
- ✅ Fast responses
- ✅ Good quality

**Cons:**
- ❌ No seed support
- ❌ Requires API key
- ❌ Less deterministic

**Setup:** See [Gemini Setup Guide](providers/GEMINI.md)

**Default Model:** `gemini-1.5-flash`

**Cost:**
- Input: $0.075/1M tokens
- Output: $0.30/1M tokens

---

### 4. Anthropic Claude

**Best For:** Quality, safety, large context

**Pros:**
- ✅ High quality responses
- ✅ Safety-focused
- ✅ Large context (200K)
- ✅ Good for complex tasks

**Cons:**
- ❌ More expensive
- ❌ No seed support
- ❌ Slower than OpenAI

**Setup:** See [Anthropic Setup Guide](providers/ANTHROPIC.md)

**Default Model:** `claude-3-5-haiku-latest`

**Cost:**
- Haiku: $0.25/1M input, $1.25/1M output
- Sonnet: $3/1M input, $15/1M output

---

### 5. Azure OpenAI

**Best For:** Enterprise, compliance, Azure ecosystem

**Pros:**
- ✅ Enterprise SLA
- ✅ Data residency options
- ✅ Azure integration
- ✅ Same models as OpenAI
- ✅ Seed support

**Cons:**
- ❌ Complex setup
- ❌ Requires Azure account
- ❌ More expensive than OpenAI

**Setup:** See [Azure OpenAI Setup Guide](providers/AZURE_OPENAI.md)

**Default Model:** `gpt-4o-mini`

**Cost:** Similar to OpenAI (varies by region)

---

### 6. AWS Bedrock

**Best For:** AWS ecosystem, Claude on AWS

**Pros:**
- ✅ AWS integration
- ✅ Claude models available
- ✅ Enterprise features
- ✅ Data residency

**Cons:**
- ❌ Complex setup
- ❌ Requires AWS account
- ❌ More expensive
- ❌ Slower than direct Anthropic

**Setup:** See [AWS Bedrock Setup Guide](providers/BEDROCK.md)

**Default Model:** `anthropic.claude-3-haiku-20240307-v1:0`

**Cost:** Similar to Anthropic (varies by region)

---

## 🔄 Provider Fallback

Automatic fallback to backup providers on errors:

```bash
# Primary: OpenAI, Fallback: Gemini, Anthropic
export AGENTIC_SDLC_LLM_PROVIDER=openai
export AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic
export AGENTIC_SDLC_LLM_FALLBACK_POLICY=transient_only

cargo run -- --workflow feature.md
```

**Fallback Policies:**
- `always`: Fallback on any error
- `transient_only`: Only on rate limits, timeouts, 5xx errors (default)
- `never`: No fallback

**Fallback Triggers:**
- Rate limit (429)
- Timeout
- Server error (500-599)
- Network error

---

## 💰 Cost Comparison

### Example: 1000-token input, 500-token output

| Provider | Model | Input Cost | Output Cost | Total |
|----------|-------|------------|-------------|-------|
| Ollama | qwen3:8b | $0 | $0 | **$0** |
| Gemini | flash | $0.000075 | $0.00015 | **$0.000225** |
| OpenAI | gpt-4o-mini | $0.00015 | $0.0003 | **$0.00045** |
| Anthropic | haiku | $0.00025 | $0.000625 | **$0.000875** |
| Azure | gpt-4o-mini | $0.00015 | $0.0003 | **$0.00045** |
| Bedrock | claude-haiku | $0.00025 | $0.000625 | **$0.000875** |

**Recommendation:** Use Gemini for cost-sensitive workloads, OpenAI for production.

---

## ⚡ Performance Comparison

### Average Response Time (1000 tokens)

| Provider | Latency | Throughput |
|----------|---------|------------|
| Ollama | 200ms | Fast |
| OpenAI | 500ms | Fast |
| Gemini | 600ms | Fast |
| Anthropic | 800ms | Medium |
| Azure | 550ms | Fast |
| Bedrock | 900ms | Medium |

**Note:** Latency varies by region, model, and load.

---

## 🎯 Use Case Recommendations

### Development & Testing
**Recommended:** Ollama
- Free, fast, offline
- Good for iteration

### Production (General)
**Recommended:** OpenAI
- Reliable, fast, deterministic
- Good balance of cost/quality

### Cost-Sensitive Production
**Recommended:** Gemini
- Cheapest cloud option
- Good quality, huge context

### High-Quality Tasks
**Recommended:** Anthropic Claude
- Best quality
- Safety-focused
- Large context

### Enterprise (Azure)
**Recommended:** Azure OpenAI
- Enterprise SLA
- Compliance features
- Azure integration

### Enterprise (AWS)
**Recommended:** AWS Bedrock
- AWS integration
- Claude on AWS
- Enterprise features

---

## 🔧 Configuration

### Environment Variables

```bash
# Provider selection
export AGENTIC_SDLC_LLM_PROVIDER=openai  # ollama|openai|gemini|anthropic|azure|bedrock

# Model override (optional)
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini
export AGENTIC_SDLC_LLM_MODEL_OPENAI=gpt-4o-mini
export AGENTIC_SDLC_LLM_MODEL_GEMINI=gemini-1.5-flash
export AGENTIC_SDLC_LLM_MODEL_ANTHROPIC=claude-3-5-haiku-latest

# Fallback configuration
export AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic
export AGENTIC_SDLC_LLM_FALLBACK_POLICY=transient_only

# Timeout & retries
export AGENTIC_SDLC_LLM_TIMEOUT_MS=120000  # 2 minutes
export AGENTIC_SDLC_LLM_MAX_RETRIES=1

# Deterministic mode
export AGENTIC_SDLC_LLM_TEMPERATURE=0.0
export AGENTIC_SDLC_LLM_SEED=42  # OpenAI/Azure only
```

### Per-Provider Configuration

**OpenAI:**
```bash
export OPENAI_API_KEY=sk-...
```

**Gemini:**
```bash
export GEMINI_API_KEY=...
```

**Anthropic:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**Azure OpenAI:**
```bash
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

**AWS Bedrock:**
```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
```

**Ollama:**
```bash
export AGENTIC_SDLC_OLLAMA_HOST=http://localhost:11434
# or
export OLLAMA_HOST=http://localhost:11434
```

---

## 🧪 Testing Providers

### Test Single Provider

```bash
# Test OpenAI
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
OPENAI_API_KEY=sk-... \
cargo test llm_subagent_live_smoke_openai -- --nocapture

# Test Gemini
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
GEMINI_API_KEY=... \
cargo test llm_subagent_live_smoke_gemini -- --nocapture

# Test Anthropic
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
ANTHROPIC_API_KEY=sk-ant-... \
cargo test llm_subagent_live_smoke_anthropic -- --nocapture
```

### Test All Providers

```bash
./scripts/test_all_providers.sh
```

### Compare Providers

```bash
./scripts/compare_providers.sh "Explain quantum computing in one sentence"
```

---

## 🐛 Troubleshooting

See [LLM Troubleshooting Guide](TROUBLESHOOTING_LLM.md) for common issues and solutions.

### Quick Fixes

**API Key Not Found:**
```bash
# Check environment variable
echo $OPENAI_API_KEY

# Set it
export OPENAI_API_KEY=sk-...
```

**Rate Limit:**
```bash
# Enable fallback
export AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic
```

**Timeout:**
```bash
# Increase timeout
export AGENTIC_SDLC_LLM_TIMEOUT_MS=180000  # 3 minutes
```

**Wrong Model:**
```bash
# Override model
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini
```

---

## 📚 Related Documentation

- [Ollama Setup](providers/OLLAMA.md)
- [OpenAI Setup](providers/OPENAI.md)
- [Gemini Setup](providers/GEMINI.md)
- [Anthropic Setup](providers/ANTHROPIC.md)
- [Azure OpenAI Setup](providers/AZURE_OPENAI.md)
- [AWS Bedrock Setup](providers/BEDROCK.md)
- [Deterministic Mode](DETERMINISTIC_MODE.md)
- [Replay Store](REPLAY_STORE.md)
- [Troubleshooting](TROUBLESHOOTING_LLM.md)

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Complete
