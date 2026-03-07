# Week 3 Plan - LLM Provider Completion & Testing

## 🎯 Goal

Complete and test all 6 LLM providers (Ollama, OpenAI, Gemini, Anthropic, Azure OpenAI, Bedrock) with comprehensive documentation and examples.

## 📊 Current Status

**Gap #3: LLM Provider Support** - 90% Complete

**What's Already Done:**
- ✅ All 6 providers implemented in code
- ✅ Cost estimation fixed for all providers
- ✅ AWS SDK compatibility fixed
- ✅ Fallback logic exists
- ✅ Retry/timeout mechanisms in place

**What's Missing:**
- ⏳ Live testing with real API keys
- ⏳ Provider-specific documentation
- ⏳ Setup guides for each provider
- ⏳ Example workflows
- ⏳ Troubleshooting guides

## 📅 Timeline: 4 Days (12 hours)

### Day 1: Provider Testing (3 hours)
**Goal:** Test all 6 providers with real API keys

**Tasks:**
1. Test Anthropic Claude
   - Set up API key
   - Run test workflow
   - Verify cost estimation
   - Document any issues

2. Test Azure OpenAI
   - Set up Azure credentials
   - Configure endpoint
   - Run test workflow
   - Verify compatibility

3. Test AWS Bedrock
   - Set up AWS credentials
   - Configure region
   - Run test workflow
   - Verify Claude on Bedrock

**Deliverables:**
- Test results for each provider
- Bug fixes if needed
- Performance benchmarks

---

### Day 2: Documentation (3 hours)
**Goal:** Create comprehensive provider documentation

**Tasks:**
1. Create `docs/LLM_PROVIDERS.md`
   - Overview of all 6 providers
   - Comparison table
   - When to use each
   - Cost comparison

2. Create setup guides
   - `docs/providers/ANTHROPIC.md`
   - `docs/providers/AZURE_OPENAI.md`
   - `docs/providers/BEDROCK.md`
   - `docs/providers/GEMINI.md`
   - `docs/providers/OPENAI.md`
   - `docs/providers/OLLAMA.md`

3. Update README.md
   - Add provider section
   - Link to guides

**Deliverables:**
- Complete provider documentation
- Setup guides for each provider
- Updated README

---

### Day 3: Examples & Workflows (3 hours)
**Goal:** Create example workflows for each provider

**Tasks:**
1. Create example workflows
   - `examples/anthropic_workflow.md`
   - `examples/azure_workflow.md`
   - `examples/bedrock_workflow.md`
   - Multi-provider fallback example

2. Create provider comparison script
   - `scripts/compare_providers.sh`
   - Test same prompt across all providers
   - Compare cost, speed, quality

3. Add troubleshooting guide
   - Common errors
   - API key issues
   - Rate limiting
   - Cost optimization

**Deliverables:**
- Example workflows
- Comparison script
- Troubleshooting guide

---

### Day 4: Context Window Management (3 hours)
**Goal:** Implement basic context window management

**Tasks:**
1. Add token counting
   - Implement `count_tokens()` function
   - Use tiktoken for OpenAI/Azure
   - Estimate for other providers

2. Add context window limits
   - Define limits per model
   - Warn when approaching limit
   - Truncate if needed

3. Add chunking support (basic)
   - Split large prompts
   - Summarize previous chunks
   - Maintain context

4. Documentation
   - Context window guide
   - Best practices
   - Examples

**Deliverables:**
- Token counting implementation
- Context window management
- Documentation

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] All 6 providers tested with real API keys
- [ ] Each provider has setup guide
- [ ] Example workflows for each provider
- [ ] Troubleshooting guide complete
- [ ] Context window management implemented
- [ ] All tests passing

### Quality Requirements
- [ ] Documentation comprehensive (200+ lines)
- [ ] Examples tested and working
- [ ] Error messages clear
- [ ] Performance benchmarks documented

### Performance Targets
- [ ] Provider switching < 100ms
- [ ] Fallback triggers < 5s
- [ ] Token counting < 10ms

---

## 📦 Deliverables

### Code
1. `src/skills/llm_subagent.rs` (updates)
   - Token counting
   - Context window management
   - Better error messages

2. `src/engine/llm/` (new)
   - `token_counter.rs` - Token counting
   - `context_manager.rs` - Context window management

### Documentation
1. `docs/LLM_PROVIDERS.md` - Overview
2. `docs/providers/*.md` - 6 setup guides
3. `docs/CONTEXT_WINDOWS.md` - Context management guide
4. `docs/TROUBLESHOOTING_LLM.md` - Troubleshooting

### Examples
1. `examples/anthropic_workflow.md`
2. `examples/azure_workflow.md`
3. `examples/bedrock_workflow.md`
4. `examples/multi_provider_fallback.md`

### Scripts
1. `scripts/compare_providers.sh` - Provider comparison
2. `scripts/test_all_providers.sh` - Test all providers

---

## 🔧 Technical Details

### Token Counting

```rust
pub fn count_tokens(text: &str, model: &str) -> Result<usize> {
    match model {
        m if m.contains("gpt") => {
            // Use tiktoken for OpenAI models
            tiktoken::count_tokens(text, model)
        }
        _ => {
            // Estimate: ~4 chars per token
            Ok(text.len() / 4)
        }
    }
}
```

### Context Window Limits

| Provider | Model | Context Window |
|----------|-------|----------------|
| OpenAI | gpt-4o-mini | 128K |
| OpenAI | gpt-4.1-mini | 128K |
| Anthropic | claude-3-5-haiku | 200K |
| Anthropic | claude-3-5-sonnet | 200K |
| Gemini | gemini-1.5-flash | 1M |
| Gemini | gemini-1.5-pro | 2M |
| Azure | (same as OpenAI) | 128K |
| Bedrock | (same as Anthropic) | 200K |
| Ollama | varies | 2K-128K |

### Context Management Strategy

1. **Count tokens** before sending
2. **Warn** at 80% of limit
3. **Truncate** at 90% of limit
4. **Chunk** for very large inputs
5. **Summarize** previous chunks

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Token counting accuracy
- [ ] Context window detection
- [ ] Truncation logic
- [ ] Chunking logic

### Integration Tests
- [ ] Each provider with real API
- [ ] Fallback between providers
- [ ] Cost estimation accuracy
- [ ] Error handling

### Manual Tests
- [ ] Run example workflows
- [ ] Test with large prompts
- [ ] Test rate limiting
- [ ] Test cost tracking

---

## 📊 Metrics

### Code Metrics
- **Lines Added:** ~500
- **Files Created:** ~15
- **Tests Added:** ~10

### Documentation Metrics
- **Guides:** 7 (1 overview + 6 providers)
- **Examples:** 4 workflows
- **Total Lines:** 1000+

### Time Tracking
- **Day 1:** 3h (Testing)
- **Day 2:** 3h (Documentation)
- **Day 3:** 3h (Examples)
- **Day 4:** 3h (Context Management)
- **Total:** 12h

---

## 🚀 Impact

### For Users
- **More Choices:** 6 providers to choose from
- **Better Docs:** Clear setup guides
- **Cost Savings:** Choose cheapest provider
- **Reliability:** Automatic fallback

### For Project
- **Gap Closure:** Gap #3 → 100% complete
- **Production Ready:** All providers tested
- **Better UX:** Clear error messages
- **Foundation:** Ready for advanced features

---

## 🎓 Learning Goals

### Technical Skills
- Multi-provider LLM integration
- Token counting algorithms
- Context window management
- API error handling

### Documentation Skills
- Provider comparison
- Setup guides
- Troubleshooting guides
- Example workflows

---

## 📝 Notes

### Why This Week?

1. **Quick Win:** 90% already done
2. **High Impact:** Users need provider choice
3. **Foundation:** Required for advanced features
4. **Low Risk:** No breaking changes

### Why Not Sandbox?

Sandbox (Week 3 original plan) is:
- Very complex (Docker, process isolation)
- High risk (security implications)
- Needs more design work
- Can wait until Week 4-5

Provider completion is:
- Almost done (90%)
- Low risk
- High user value
- Quick to finish

---

## 🔗 Related Documents

- [Gap Roadmap](GAP_ROADMAP.md)
- [Gap Coverage](GAP_COVERAGE.md)
- [Week 2 Summary](WEEK2_SUMMARY.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)

---

**Version:** 1.0  
**Created:** 2026-03-07  
**Status:** Ready to Start  
**Priority:** High
