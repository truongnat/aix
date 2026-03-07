# Anthropic Claude Setup Guide

Complete guide to using Anthropic Claude models with `agentic-sdlc`.

## 🎯 Overview

**Provider:** Anthropic  
**Models:** Claude 3.5 Haiku, Claude 3.5 Sonnet  
**Context Window:** 200K tokens  
**Best For:** High-quality responses, safety-focused tasks  

## 📋 Prerequisites

- Anthropic API account
- API key from https://console.anthropic.com/
- Credit card for billing

## 🚀 Quick Start

### 1. Get API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new API key
5. Copy the key (starts with `sk-ant-`)

### 2. Set Environment Variable

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Configure Provider

```bash
export ANTIGRAV_LLM_PROVIDER=anthropic
```

### 4. Run Workflow

```bash
cargo run -- --workflow feature.md
```

## 🔧 Configuration

### Basic Configuration

```bash
# Required
export ANTHROPIC_API_KEY=sk-ant-api03-...

# Provider selection
export ANTIGRAV_LLM_PROVIDER=anthropic

# Optional: Model override
export ANTIGRAV_LLM_MODEL=claude-3-5-haiku-latest
# or
export ANTIGRAV_LLM_MODEL_ANTHROPIC=claude-3-5-sonnet-latest
```

### Available Models

| Model | Context | Cost (Input/Output per 1M tokens) | Best For |
|-------|---------|-----------------------------------|----------|
| `claude-3-5-haiku-latest` | 200K | $0.25 / $1.25 | Fast, cost-effective |
| `claude-3-5-sonnet-latest` | 200K | $3.00 / $15.00 | High quality, complex tasks |
| `claude-3-opus-latest` | 200K | $15.00 / $75.00 | Maximum quality |

**Default:** `claude-3-5-haiku-latest`

### Advanced Configuration

```bash
# Temperature (0.0 = deterministic, 1.0 = creative)
export ANTIGRAV_LLM_TEMPERATURE=0.0

# Timeout (milliseconds)
export ANTIGRAV_LLM_TIMEOUT_MS=120000

# Max retries on failure
export ANTIGRAV_LLM_MAX_RETRIES=1

# Fallback providers
export ANTIGRAV_LLM_FALLBACK=openai,gemini
```

## 💰 Pricing

### Cost per 1M Tokens

**Claude 3.5 Haiku:**
- Input: $0.25
- Output: $1.25
- Total (1M in + 1M out): $1.50

**Claude 3.5 Sonnet:**
- Input: $3.00
- Output: $15.00
- Total (1M in + 1M out): $18.00

### Example Costs

**Small workflow (10K input, 5K output):**
- Haiku: $0.00875
- Sonnet: $0.105

**Medium workflow (100K input, 50K output):**
- Haiku: $0.0875
- Sonnet: $1.05

**Large workflow (500K input, 250K output):**
- Haiku: $0.4375
- Sonnet: $5.25

### Cost Optimization

```bash
# Use Haiku for most tasks
export ANTIGRAV_LLM_MODEL=claude-3-5-haiku-latest

# Use Sonnet only for complex tasks
# (configure in role profile)
```

## 🎯 Use Cases

### When to Use Anthropic

✅ **Best For:**
- High-quality responses needed
- Safety-critical applications
- Complex reasoning tasks
- Large context requirements (200K)
- Ethical AI considerations

❌ **Not Ideal For:**
- Cost-sensitive workloads (use Gemini)
- Need for determinism (no seed support)
- Speed-critical applications (slower than OpenAI)

### Recommended Workflows

**Code Review:**
```bash
export ANTIGRAV_LLM_PROVIDER=anthropic
export ANTIGRAV_LLM_MODEL=claude-3-5-sonnet-latest
cargo run -- --workflow code-review.md
```

**Security Analysis:**
```bash
export ANTIGRAV_LLM_PROVIDER=anthropic
export ANTIGRAV_LLM_MODEL=claude-3-5-sonnet-latest
cargo run -- --workflow security-scan.md
```

**Documentation:**
```bash
export ANTIGRAV_LLM_PROVIDER=anthropic
export ANTIGRAV_LLM_MODEL=claude-3-5-haiku-latest
cargo run -- --workflow generate-docs.md
```

## 🧪 Testing

### Test Connection

```bash
ANTIGRAV_RUN_LIVE_LLM_TESTS=1 \
ANTHROPIC_API_KEY=sk-ant-... \
cargo test llm_subagent_live_smoke_anthropic -- --nocapture
```

### Test Workflow

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export ANTIGRAV_LLM_PROVIDER=anthropic
cargo run -- --workflow test_replay_workflow.md
```

### Expected Output

```
[completed] analyze duration_ms=1200 tokens=150 cost_usd=0.000875
[completed] summarize duration_ms=800 tokens=100 cost_usd=0.000625
Workflow completed successfully
```

## 🐛 Troubleshooting

### API Key Not Found

**Error:**
```
ANTHROPIC_API_KEY is not set
```

**Solution:**
```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Invalid API Key

**Error:**
```
anthropic request failed (status=401): Invalid API key
```

**Solution:**
1. Check key is correct
2. Verify key is active in console
3. Regenerate key if needed

### Rate Limit

**Error:**
```
anthropic request failed (status=429): Rate limit exceeded
```

**Solution:**
```bash
# Enable fallback
export ANTIGRAV_LLM_FALLBACK=openai,gemini

# Or increase retry delay
export ANTIGRAV_LLM_MAX_RETRIES=3
```

### Timeout

**Error:**
```
provider timeout after 120000ms
```

**Solution:**
```bash
# Increase timeout
export ANTIGRAV_LLM_TIMEOUT_MS=180000  # 3 minutes

# Or use faster model
export ANTIGRAV_LLM_MODEL=claude-3-5-haiku-latest
```

### Context Too Long

**Error:**
```
anthropic request failed (status=400): prompt is too long
```

**Solution:**
- Reduce prompt size
- Split into multiple steps
- Use summarization
- Claude supports 200K tokens (very large)

## 📊 Performance

### Response Times

| Model | Avg Latency | Tokens/sec |
|-------|-------------|------------|
| Haiku | 800ms | ~125 |
| Sonnet | 1200ms | ~83 |
| Opus | 2000ms | ~50 |

**Note:** Times vary by load and region.

### Optimization Tips

1. **Use Haiku for speed:**
   ```bash
   export ANTIGRAV_LLM_MODEL=claude-3-5-haiku-latest
   ```

2. **Enable caching:**
   ```bash
   cargo run -- --workflow feature.md --save-replay cache.json
   cargo run -- --workflow feature.md --replay-mode cache.json
   ```

3. **Reduce prompt size:**
   - Remove unnecessary context
   - Use concise instructions
   - Leverage role profiles

## 🔒 Security

### API Key Security

**DO:**
- ✅ Store in environment variables
- ✅ Use `.env` files (not committed)
- ✅ Rotate keys regularly
- ✅ Use separate keys for dev/prod

**DON'T:**
- ❌ Commit keys to git
- ❌ Share keys in chat/email
- ❌ Use same key across teams
- ❌ Log keys in output

### Data Privacy

- All data sent to Anthropic servers
- Anthropic does NOT train on API data
- See: https://www.anthropic.com/legal/commercial-terms

### Best Practices

```bash
# Use .env file
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
echo ".env" >> .gitignore

# Load in shell
source .env

# Or use direnv
echo "export ANTHROPIC_API_KEY=sk-ant-..." >> .envrc
direnv allow
```

## 🎓 Advanced Usage

### Role-Specific Models

Configure different models per role:

```yaml
# .agents/roles/architect.md
---
name: architect
provider: anthropic
model: claude-3-5-sonnet-latest
temperature: 0.3
---

You are a software architect...
```

### Fallback Configuration

```bash
# Primary: Anthropic, Fallback: OpenAI
export ANTIGRAV_LLM_PROVIDER=anthropic
export ANTIGRAV_LLM_FALLBACK=openai,gemini
export ANTIGRAV_LLM_FALLBACK_POLICY=transient_only
```

### Cost Tracking

```bash
# Run workflow and track cost
cargo run -- --workflow feature.md 2>&1 | grep cost_usd

# Example output:
# cost_usd=0.000875
# cost_usd=0.000625
# Total: $0.0015
```

## 📚 Resources

### Official Documentation
- API Docs: https://docs.anthropic.com/
- Console: https://console.anthropic.com/
- Pricing: https://www.anthropic.com/pricing
- Status: https://status.anthropic.com/

### Community
- Discord: https://discord.gg/anthropic
- Twitter: @AnthropicAI
- GitHub: https://github.com/anthropics

### Related Guides
- [LLM Providers Overview](../LLM_PROVIDERS.md)
- [Deterministic Mode](../DETERMINISTIC_MODE.md)
- [Replay Store](../REPLAY_STORE.md)
- [Troubleshooting](../TROUBLESHOOTING_LLM.md)

## 🆘 Support

### Getting Help

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Anthropic Docs](https://docs.anthropic.com/)
3. Check [Status Page](https://status.anthropic.com/)
4. Contact Anthropic Support

### Common Issues

See [LLM Troubleshooting Guide](../TROUBLESHOOTING_LLM.md) for more issues and solutions.

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Complete
