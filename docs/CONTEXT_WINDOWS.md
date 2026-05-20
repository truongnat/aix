# Context Window Management Guide

Guide to managing context windows and token limits across LLM providers.

## 📊 Context Window Limits

| Provider | Model | Context Window | Notes |
|----------|-------|----------------|-------|
| **OpenAI** | gpt-4o-mini | 128K tokens | ~96K words |
| **OpenAI** | gpt-4.1-mini | 128K tokens | ~96K words |
| **Gemini** | flash | 1M tokens | ~750K words |
| **Gemini** | pro | 2M tokens | ~1.5M words |
| **Anthropic** | haiku | 200K tokens | ~150K words |
| **Anthropic** | sonnet | 200K tokens | ~150K words |
| **Azure** | gpt-4o-mini | 128K tokens | Same as OpenAI |
| **Bedrock** | claude-haiku | 200K tokens | Same as Anthropic |
| **Ollama** | varies | 2K-128K | Model dependent |

## 🔢 Token Estimation

### Quick Estimation

**Rule of Thumb:**
- 1 token ≈ 4 characters
- 1 token ≈ 0.75 words
- 100 tokens ≈ 75 words

**Examples:**
```
"Hello, world!" = ~4 tokens
"The quick brown fox jumps" = ~6 tokens
1000 characters = ~250 tokens
1000 words = ~1333 tokens
```

### Accurate Counting

For OpenAI/Azure (using tiktoken):
```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o-mini")
tokens = enc.encode("Your text here")
print(len(tokens))
```

For other providers:
```rust
// Estimate: chars / 4
let estimated_tokens = text.len() / 4;
```

## ⚠️ Context Window Warnings

### Current Behavior

The system will:
1. **Warn** at 80% of context limit
2. **Truncate** at 90% of context limit
3. **Error** at 100% of context limit

### Example

For OpenAI (128K limit):
- **102K tokens:** ⚠️ Warning logged
- **115K tokens:** ✂️ Truncated to 115K
- **128K+ tokens:** ❌ Error

## 🛠️ Managing Large Context

### Strategy 1: Split into Steps

**Bad:**
```markdown
### analyze_everything
- skill: llm_subagent
- input: |
    [100K tokens of code]
    Analyze all of this code
```

**Good:**
```markdown
### analyze_module_1
- skill: llm_subagent
- input: |
    [20K tokens]
    Analyze this module

### analyze_module_2
- skill: llm_subagent
- input: |
    [20K tokens]
    Analyze this module
    
### summarize
- skill: llm_subagent
- input: "Summarize findings from previous analyses"
- depends_on: [analyze_module_1, analyze_module_2]
```

### Strategy 2: Summarization

```markdown
### analyze_details
- skill: llm_subagent
- input: "[Large detailed analysis]"

### summarize
- skill: llm_subagent
- input: "Summarize the key points from the analysis in 200 words"
- depends_on: [analyze_details]

### next_step
- skill: llm_subagent
- input: "Based on the summary, suggest next steps"
- depends_on: [summarize]
```

### Strategy 3: Use Larger Context Model

```bash
# Switch to Gemini for large context
export AGENTIC_SDLC_LLM_PROVIDER=gemini
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash  # 1M tokens

# Or Anthropic
export AGENTIC_SDLC_LLM_PROVIDER=anthropic
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-haiku-latest  # 200K tokens
```

### Strategy 4: Selective Context

```markdown
### analyze_specific
- skill: llm_subagent
- input: |
    Focus on these specific files:
    - src/main.rs (most important)
    - src/lib.rs (core logic)
    
    Ignore:
    - tests/
    - examples/
    - docs/
```

## 📏 Token Budgeting

### Per-Step Budget

```markdown
### step1
- skill: llm_subagent
- input: "[~10K tokens input]"
# Expected output: ~5K tokens
# Total: ~15K tokens

### step2
- skill: llm_subagent
- input: "[~20K tokens input]"
# Expected output: ~10K tokens
# Total: ~30K tokens

# Total workflow: ~45K tokens (well under 128K limit)
```

### Workflow Budget

For OpenAI (128K limit):
- Reserve 20% for system prompts: 25K tokens
- Available for user: 103K tokens
- Reserve 20% for output: 20K tokens
- **Safe input limit: ~80K tokens**

## 🎯 Best Practices

### 1. Estimate Before Running

```bash
# Count tokens in your input
wc -c input.txt
# Divide by 4 for rough token count
```

### 2. Use Appropriate Model

```bash
# Small context (<10K tokens)
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini  # 128K

# Medium context (10K-100K tokens)
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-haiku-latest  # 200K

# Large context (100K-500K tokens)
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash  # 1M

# Very large context (500K+ tokens)
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-pro  # 2M
```

### 3. Monitor Token Usage

```bash
# Check token usage in output
cargo run -- --workflow feature.md 2>&1 | grep tokens

# Example output:
# tokens=1234 cost_usd=0.00123
```

### 4. Optimize Prompts

**Verbose (wasteful):**
```
Please analyze the following code and provide a detailed explanation
of what it does, including all the functions, classes, and methods,
and explain how they work together, and also mention any potential
issues or improvements that could be made.
```

**Concise (efficient):**
```
Analyze this code:
1. What does it do?
2. Potential issues?
3. Suggested improvements?
```

## 🔧 Configuration

### Set Context Limits (Future)

```bash
# Not yet implemented, but planned:
export AGENTIC_SDLC_LLM_MAX_CONTEXT_TOKENS=100000
export AGENTIC_SDLC_LLM_WARN_AT_PERCENT=80
export AGENTIC_SDLC_LLM_TRUNCATE_AT_PERCENT=90
```

### Enable Token Counting (Future)

```bash
# Not yet implemented, but planned:
export AGENTIC_SDLC_LLM_COUNT_TOKENS=true
export AGENTIC_SDLC_LLM_LOG_TOKEN_USAGE=true
```

## 📊 Context Window Comparison

### Cost per 1M Tokens

| Provider | Model | Context | Cost (Input) | Cost per Word |
|----------|-------|---------|--------------|---------------|
| Gemini | flash | 1M | $0.075 | $0.0001 |
| OpenAI | gpt-4o-mini | 128K | $0.15 | $0.0002 |
| Anthropic | haiku | 200K | $0.25 | $0.00033 |

**For large context:** Gemini is most cost-effective.

### Speed Comparison

| Provider | Model | Context | Speed |
|----------|-------|---------|-------|
| Ollama | local | varies | Fastest (local) |
| OpenAI | gpt-4o-mini | 128K | Fast |
| Gemini | flash | 1M | Fast |
| Anthropic | haiku | 200K | Medium |

**For large context:** Gemini Flash is fastest cloud option.

## 🚨 Common Issues

### Issue 1: Context Too Long

**Error:**
```
request failed (status=400): prompt is too long
```

**Solution:**
1. Split into multiple steps
2. Use summarization
3. Switch to larger context model
4. Remove unnecessary context

### Issue 2: Slow with Large Context

**Problem:** Responses taking too long

**Solution:**
1. Use Gemini Flash (optimized for large context)
2. Split into smaller chunks
3. Use local Ollama for development

### Issue 3: High Cost with Large Context

**Problem:** Expensive API bills

**Solution:**
1. Use Gemini (cheapest for large context)
2. Use replay store (free replays)
3. Optimize prompts
4. Cache results

## 📚 Examples

### Example 1: Large Codebase Analysis

```bash
# Use Gemini for 500K tokens
export AGENTIC_SDLC_LLM_PROVIDER=gemini
export AGENTIC_SDLC_LLM_MODEL=gemini-1.5-flash

cargo run -- --workflow analyze_codebase.md
```

### Example 2: Document Processing

```bash
# Process 100-page document (~200K tokens)
export AGENTIC_SDLC_LLM_PROVIDER=anthropic
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-haiku-latest

cargo run -- --workflow process_document.md
```

### Example 3: Incremental Analysis

```markdown
# Split large analysis into chunks

### chunk1
- skill: llm_subagent
- input: "[First 50K tokens]"

### chunk2
- skill: llm_subagent
- input: "[Next 50K tokens]"

### combine
- skill: llm_subagent
- input: "Combine insights from chunk1 and chunk2"
- depends_on: [chunk1, chunk2]
```

## 🔮 Future Enhancements

### Planned Features

- [ ] Automatic token counting
- [ ] Context window warnings
- [ ] Automatic truncation
- [ ] Smart chunking
- [ ] Context summarization
- [ ] Token budget enforcement

### Roadmap

**Week 4:** Token counting implementation  
**Week 5:** Context window management  
**Week 6:** Smart chunking and summarization  

## 📖 Related Documentation

- [LLM Providers Guide](LLM_PROVIDERS.md)
- [Troubleshooting](TROUBLESHOOTING_LLM.md)
- [Deterministic Mode](DETERMINISTIC_MODE.md)

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Complete
