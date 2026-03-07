# Quick Start - Gap Fixes

Quick reference for implementing gap fixes in `agentic-sdlc`.

## 🚀 Quick Wins (Do Now!)

### 1. Test Existing Providers (30 minutes)

```bash
# Test Anthropic (already implemented!)
ANTIGRAV_RUN_LIVE_LLM_TESTS=1 \
ANTHROPIC_API_KEY=sk-ant-... \
cargo test llm_subagent_live_smoke_anthropic -- --nocapture

# Test Azure OpenAI (already implemented!)
ANTIGRAV_RUN_LIVE_LLM_TESTS=1 \
AZURE_OPENAI_KEY=... \
AZURE_OPENAI_ENDPOINT=https://....openai.azure.com \
cargo test

# Test AWS Bedrock (already implemented!)
ANTIGRAV_RUN_LIVE_LLM_TESTS=1 \
AWS_REGION=us-east-1 \
AWS_ACCESS_KEY_ID=... \
AWS_SECRET_ACCESS_KEY=... \
cargo test
```

### 2. Use Deterministic Mode (5 minutes)

```bash
# Default is already deterministic (temp=0.0)
cargo run -- --workflow feature.md

# Verify deterministic mode
ANTIGRAV_LLM_TEMPERATURE=0.0 cargo run -- --workflow feature.md

# Use specific seed for OpenAI
ANTIGRAV_LLM_PROVIDER=openai \
ANTIGRAV_LLM_SEED=42 \
cargo run -- --workflow feature.md
```

### 3. Document Your Providers (15 minutes)

Create `docs/PROVIDERS.md`:
```markdown
# LLM Providers

## Supported Providers

1. Ollama (local)
2. OpenAI (cloud)
3. Gemini (cloud)
4. Anthropic (cloud) ✅ NEW
5. Azure OpenAI (cloud) ✅ NEW
6. AWS Bedrock (cloud) ✅ NEW

## Configuration

[Add examples for each provider]
```

## 📅 Week-by-Week Plan

### Week 1: Foundation
- [x] Add temperature/seed functions
- [x] Update documentation
- [ ] Test all providers
- [ ] Document provider setup

### Week 2: Replay Store
- [ ] Create `src/engine/replay_store.rs`
- [ ] Add `--save-replay` flag
- [ ] Add `--replay-mode` flag
- [ ] Test determinism

### Week 3: Sandbox
- [ ] Create `src/engine/sandbox/process.rs`
- [ ] Add resource monitoring
- [ ] Test isolation
- [ ] Document usage

### Week 4: Release v1.1.0
- [ ] Integration tests
- [ ] Documentation review
- [ ] Release notes
- [ ] Publish to crates.io

## 🔧 Implementation Checklist

### Determinism (Week 1-2)
- [x] Add `resolve_temperature()` function
- [x] Add `generate_seed()` function
- [x] Add `is_deterministic_mode()` function
- [x] Update `LlmSubAgentSkill` constructor
- [x] Add seed to `OpenAiChatRequest`
- [ ] Use seed in `call_openai()`
- [ ] Use seed in `call_azure_openai()`
- [ ] Add tests for seed usage
- [ ] Create replay store
- [ ] Add CLI flags for replay

### Providers (Week 1)
- [ ] Test Anthropic with real API
- [ ] Test Azure with real API
- [ ] Test Bedrock with real API
- [ ] Document each provider
- [ ] Add provider examples
- [ ] Update README with all providers

### Sandbox (Week 3)
- [ ] Design sandbox interface
- [ ] Implement process backend
- [ ] Add resource limits
- [ ] Add monitoring
- [ ] Test with untrusted skills
- [ ] Document sandbox usage

### Security (Week 5-6)
- [ ] Integrate Semgrep
- [ ] Integrate Trivy
- [ ] Add security policies
- [ ] Test security gates
- [ ] Document security workflow

## 🧪 Testing Commands

### Run All Tests
```bash
cargo test
```

### Run Specific Test
```bash
cargo test resolve_temperature
```

### Run Live Provider Tests
```bash
# Requires API keys
ANTIGRAV_RUN_LIVE_LLM_TESTS=1 \
OPENAI_API_KEY=... \
GEMINI_API_KEY=... \
ANTHROPIC_API_KEY=... \
cargo test
```

### Check Code Quality
```bash
cargo clippy
cargo fmt --check
```

## 📝 Documentation Tasks

### High Priority
- [ ] Update README with all 6 providers
- [ ] Create PROVIDERS.md guide
- [ ] Add troubleshooting section
- [ ] Add FAQ section

### Medium Priority
- [ ] Add architecture diagrams to README
- [ ] Create video tutorial (optional)
- [ ] Add more examples
- [ ] Create migration guide

### Low Priority
- [ ] Add blog post
- [ ] Create comparison with other tools
- [ ] Add performance benchmarks

## 🐛 Known Issues

### Issue 1: Bash Execution
**Problem:** `cargo test` exits with -1
**Workaround:** Use `getDiagnostics` tool
**Fix:** TBD

### Issue 2: No Library Target
**Problem:** Can't use `cargo test --lib`
**Workaround:** Use `cargo test` without `--lib`
**Fix:** This is by design (binary crate)

## 💡 Tips & Tricks

### Tip 1: Use Environment Files
```bash
# Create .env file
cat > .env << EOF
ANTIGRAV_LLM_PROVIDER=openai
ANTIGRAV_LLM_TEMPERATURE=0.0
ANTIGRAV_LLM_SEED=42
OPENAI_API_KEY=sk-...
EOF

# Load and run
source .env && cargo run -- --workflow feature.md
```

### Tip 2: Test Determinism
```bash
# Run twice and compare
cargo run -- --workflow test.md --snapshot-out run1.json
cargo run -- --workflow test.md --snapshot-out run2.json
diff run1.json run2.json
```

### Tip 3: Debug LLM Calls
```bash
# Enable verbose logging
RUST_LOG=debug cargo run -- --workflow feature.md
```

## 📚 Resources

### Documentation
- [Gap Roadmap](GAP_ROADMAP.md) - 20-week plan
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed strategy
- [Deterministic Mode](DETERMINISTIC_MODE.md) - Determinism guide
- [Architecture](ARCHITECTURE_DIAGRAM.md) - System diagrams
- [Progress Summary](PROGRESS_SUMMARY.md) - Current status
- [Changes Summary](CHANGES_SUMMARY.md) - What changed

### External Resources
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Azure OpenAI Docs](https://learn.microsoft.com/azure/ai-services/openai/)
- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)

## 🎯 Success Criteria

### Week 1
- [ ] All 6 providers tested
- [ ] Temperature/seed working
- [ ] Documentation updated
- [ ] Tests passing

### Week 2
- [ ] Replay store implemented
- [ ] Determinism verified
- [ ] CLI flags working
- [ ] Integration tests passing

### Week 4
- [ ] v1.1.0 released
- [ ] Published to crates.io
- [ ] Documentation complete
- [ ] Community feedback positive

## 🚨 Blockers

### Current Blockers
1. **API Keys** - Need keys for testing providers
2. **CI Access** - Can't run automated tests
3. **Bash Issues** - Command execution problems

### Resolved Blockers
- ✅ Temperature hardcoded → Now configurable
- ✅ No seed support → Added for OpenAI/Azure
- ✅ Missing providers → Found 3 already implemented!

## 📞 Getting Help

### Questions?
1. Check [FAQ in DETERMINISTIC_MODE.md](DETERMINISTIC_MODE.md#faq)
2. Check [Gap Roadmap](GAP_ROADMAP.md)
3. Open GitHub issue
4. Ask in discussions

### Contributing?
1. Read [Implementation Plan](IMPLEMENTATION_PLAN.md)
2. Pick a task from checklist
3. Create branch
4. Submit PR

---

**Last Updated:** 2026-03-06
**Status:** Active Development
**Next Review:** Weekly
