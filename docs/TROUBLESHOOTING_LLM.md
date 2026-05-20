# LLM Troubleshooting Guide

Common issues and solutions for LLM providers in `agentic-sdlc`.

## 🔍 Quick Diagnosis

```bash
# Check provider configuration
echo $AGENTIC_SDLC_LLM_PROVIDER

# Check API keys
echo $OPENAI_API_KEY | head -c 10
echo $GEMINI_API_KEY | head -c 10
echo $ANTHROPIC_API_KEY | head -c 10

# Test provider
cargo run -- --workflow test_replay_workflow.md
```

## 🐛 Common Issues

### 1. API Key Not Found

**Error:**
```
OPENAI_API_KEY is not set
GEMINI_API_KEY is not set
ANTHROPIC_API_KEY is not set
```

**Solution:**
```bash
# Set the appropriate API key
export OPENAI_API_KEY=sk-proj-...
export GEMINI_API_KEY=AIza...
export ANTHROPIC_API_KEY=sk-ant-...
```

**Permanent Solution:**
```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export OPENAI_API_KEY=sk-proj-...' >> ~/.bashrc
source ~/.bashrc

# Or use .env file
echo "OPENAI_API_KEY=sk-proj-..." >> .env
echo ".env" >> .gitignore
source .env
```

---

### 2. Invalid API Key

**Error:**
```
request failed (status=401): Invalid API key
request failed (status=403): Forbidden
```

**Solution:**
```bash
# Verify key is correct
echo $OPENAI_API_KEY

# Regenerate key if needed
# OpenAI: https://platform.openai.com/api-keys
# Gemini: https://aistudio.google.com/app/apikey
# Anthropic: https://console.anthropic.com/
```

---

### 3. Rate Limit Exceeded

**Error:**
```
request failed (status=429): Rate limit exceeded
```

**Solution 1: Enable Fallback**
```bash
export AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic
export AGENTIC_SDLC_LLM_FALLBACK_POLICY=transient_only
```

**Solution 2: Increase Retries**
```bash
export AGENTIC_SDLC_LLM_MAX_RETRIES=3
```

**Solution 3: Use Replay Store**
```bash
# Record once
cargo run -- --workflow feature.md --save-replay cache.json

# Replay (no API calls)
cargo run -- --workflow feature.md --replay-mode cache.json
```

---

### 4. Timeout

**Error:**
```
provider timeout after 120000ms
```

**Solution 1: Increase Timeout**
```bash
export AGENTIC_SDLC_LLM_TIMEOUT_MS=180000  # 3 minutes
```

**Solution 2: Use Faster Model**
```bash
# OpenAI
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini

# Anthropic
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-haiku-latest

# Gemini
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash
```

**Solution 3: Reduce Prompt Size**
- Remove unnecessary context
- Split into multiple steps
- Use summarization

---

### 5. Context Too Long

**Error:**
```
request failed (status=400): prompt is too long
request failed: context length exceeded
```

**Solution 1: Check Context Limits**

| Provider | Model | Limit |
|----------|-------|-------|
| OpenAI | gpt-4o-mini | 128K |
| Gemini | flash | 1M |
| Anthropic | haiku | 200K |

**Solution 2: Reduce Prompt**
```bash
# Split into multiple steps
# Use summarization
# Remove unnecessary context
```

**Solution 3: Use Larger Context Model**
```bash
# Switch to Gemini for large context
export AGENTIC_SDLC_LLM_PROVIDER=gemini
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash  # 1M tokens
```

---

### 6. Provider Not Available

**Error:**
```
ollama request failed: Connection refused
```

**Solution for Ollama:**
```bash
# Start Ollama
ollama serve

# Or check if running
ps aux | grep ollama

# Pull model if needed
ollama pull qwen3:8b
```

**Solution for Cloud Providers:**
```bash
# Check API status
# OpenAI: https://status.openai.com/
# Anthropic: https://status.anthropic.com/
# Google: https://status.cloud.google.com/

# Try fallback provider
export AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic
```

---

### 7. Model Not Found

**Error:**
```
model 'gpt-5' not found
model 'claude-4' not found
```

**Solution:**
```bash
# Use correct model name
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini  # OpenAI
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-haiku-latest  # Anthropic
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash  # Gemini

# List available models
# OpenAI: https://platform.openai.com/docs/models
# Anthropic: https://docs.anthropic.com/claude/docs/models-overview
# Gemini: https://ai.google.dev/models/gemini
```

---

### 8. Insufficient Credits

**Error:**
```
request failed (status=402): Insufficient credits
request failed (status=429): Quota exceeded
```

**Solution:**
```bash
# Add credits to account
# OpenAI: https://platform.openai.com/account/billing
# Anthropic: https://console.anthropic.com/settings/billing
# Gemini: Free tier available

# Or use free provider
export AGENTIC_SDLC_LLM_PROVIDER=ollama
```

---

### 9. Network Error

**Error:**
```
request failed: Connection timeout
request failed: DNS resolution failed
```

**Solution:**
```bash
# Check internet connection
ping google.com

# Check firewall/proxy
curl https://api.openai.com/v1/models

# Use local provider
export AGENTIC_SDLC_LLM_PROVIDER=ollama
```

---

### 10. Slow Performance

**Problem:** Responses taking too long

**Solution 1: Use Faster Provider**
```bash
# Fastest: Ollama (local)
export AGENTIC_SDLC_LLM_PROVIDER=ollama

# Fast cloud: OpenAI
export AGENTIC_SDLC_LLM_PROVIDER=openai
```

**Solution 2: Use Smaller Model**
```bash
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini  # vs gpt-4o
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-haiku-latest  # vs sonnet
```

**Solution 3: Use Replay Store**
```bash
# 10x+ faster
cargo run -- --workflow feature.md --replay-mode cache.json
```

---

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

```bash
# Set log level
export RUST_LOG=debug

# Run workflow
cargo run -- --workflow feature.md 2>&1 | tee debug.log
```

### Test Provider Directly

```bash
# OpenAI
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'

# Gemini
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-haiku-latest","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'
```

### Check Provider Status

```bash
# OpenAI
curl https://status.openai.com/api/v2/status.json

# Check rate limits
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -I | grep -i rate
```

---

## 📊 Performance Issues

### High Latency

**Diagnosis:**
```bash
# Measure latency
time cargo run -- --workflow test_replay_workflow.md
```

**Solutions:**
1. Use faster provider (OpenAI, Ollama)
2. Use smaller model
3. Reduce prompt size
4. Enable replay store

### High Cost

**Diagnosis:**
```bash
# Track costs
cargo run -- --workflow feature.md 2>&1 | grep cost_usd
```

**Solutions:**
1. Use cheaper provider (Gemini)
2. Use smaller model
3. Enable replay store (free replays)
4. Optimize prompts

---

## 🆘 Getting Help

### 1. Check Documentation
- [LLM Providers Guide](LLM_PROVIDERS.md)
- [Provider Setup Guides](providers/)
- [Deterministic Mode](DETERMINISTIC_MODE.md)
- [Replay Store](REPLAY_STORE.md)

### 2. Check Provider Status
- OpenAI: https://status.openai.com/
- Anthropic: https://status.anthropic.com/
- Google: https://status.cloud.google.com/

### 3. Check Provider Docs
- OpenAI: https://platform.openai.com/docs
- Anthropic: https://docs.anthropic.com/
- Gemini: https://ai.google.dev/docs

### 4. Community Support
- GitHub Issues: https://github.com/truongnat/agentic-sdlc/issues
- Provider Discord/Forums

---

## 📝 Reporting Issues

When reporting issues, include:

```bash
# System info
uname -a
cargo --version

# Provider config
echo $AGENTIC_SDLC_LLM_PROVIDER
echo $AGENTIC_SDLC_LLM_MODEL

# Error output
cargo run -- --workflow feature.md 2>&1 | tee error.log

# Attach error.log to issue
```

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Complete
