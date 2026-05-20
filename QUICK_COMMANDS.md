# Quick Commands Reference

Quick reference for common commands in `agentic-sdlc`.

---

## 🔨 Build & Test

### Build
```bash
# Build project
cargo build

# Build with release optimizations
cargo build --release

# Check without building
cargo check
```

### Test
```bash
# Run all tests
cargo test

# Run specific test
cargo test resolve_temperature

# Run tests with output
cargo test -- --nocapture

# Run tests for specific module
cargo test llm_subagent

# Run live provider tests (requires API keys)
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
OPENAI_API_KEY=... \
cargo test llm_subagent_live_smoke_openai
```

### Code Quality
```bash
# Check for issues
cargo clippy

# Format code
cargo fmt

# Apply automatic fixes
cargo fix

# Check formatting
cargo fmt -- --check
```

---

## 🚀 Run Workflows

### Basic Usage
```bash
# Run workflow
cargo run -- --workflow feature.md

# Run with specific workflow ID
cargo run -- --workflow-id feature

# Run with template
cargo run -- --workflow-id feature --template feature_prompt --task "add email validation"

# Run with role override
cargo run -- --workflow-id feature --role-override "architect=planner"
```

### Deterministic Mode
```bash
# Default (deterministic)
cargo run -- --workflow feature.md

# Explicit temperature
AGENTIC_SDLC_LLM_TEMPERATURE=0.0 cargo run -- --workflow feature.md

# With specific seed
AGENTIC_SDLC_LLM_SEED=42 cargo run -- --workflow feature.md

# Creative mode
AGENTIC_SDLC_LLM_TEMPERATURE=0.7 cargo run -- --workflow feature.md
```

### Provider Selection
```bash
# Use OpenAI
AGENTIC_SDLC_LLM_PROVIDER=openai \
OPENAI_API_KEY=... \
cargo run -- --workflow feature.md

# Use Anthropic
AGENTIC_SDLC_LLM_PROVIDER=anthropic \
ANTHROPIC_API_KEY=... \
cargo run -- --workflow feature.md

# Use Gemini
AGENTIC_SDLC_LLM_PROVIDER=gemini \
GEMINI_API_KEY=... \
cargo run -- --workflow feature.md

# Use Azure OpenAI
AGENTIC_SDLC_LLM_PROVIDER=azure \
AZURE_OPENAI_KEY=... \
AZURE_OPENAI_ENDPOINT=... \
cargo run -- --workflow feature.md

# Use AWS Bedrock
AGENTIC_SDLC_LLM_PROVIDER=bedrock \
AWS_REGION=us-east-1 \
AWS_ACCESS_KEY_ID=... \
AWS_SECRET_ACCESS_KEY=... \
cargo run -- --workflow feature.md

# With fallback
AGENTIC_SDLC_LLM_PROVIDER=openai \
AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic \
cargo run -- --workflow feature.md
```

---

## 📊 Workflow Management

### List & Status
```bash
# List workflows
cargo run -- workflow list

# Check status
cargo run -- workflow status

# List threads
cargo run -- workflow threads

# Check specific instance
cargo run -- workflow status <instance_id>
```

### Resume & Trace
```bash
# Resume workflow
cargo run -- workflow resume <instance_id>

# Export trace
cargo run -- workflow trace <instance_id> --json

# Timeline view
cargo run -- workflow trace <instance_id> --timeline

# OpenTelemetry format
cargo run -- workflow trace <instance_id> --otel
```

### Approval Gates
```bash
# Approve step
cargo run -- workflow approve <instance_id> --step manual_approval_gate --by manager --note "approved"

# Reject step
cargo run -- workflow reject <instance_id> --step manual_approval_gate --by security --note "blocked"
```

---

## 🛠️ Setup & Configuration

### Bootstrap
```bash
# Check prerequisites
cargo run -- workflow doctor

# Setup project
cargo run -- workflow setup

# Bootstrap script
./scripts/bootstrap.sh

# CI gate
./scripts/ci_gate.sh
```

### Roles & Templates
```bash
# List roles
cargo run -- workflow roles

# List templates
cargo run -- workflow templates

# Scaffold workflow
cargo run -- workflow scaffold workflow feature-search --profile advanced

# Scaffold skill
cargo run -- workflow scaffold skill search_docs --profile advanced

# Scaffold domain
cargo run -- workflow scaffold-domain payments
```

---

## 📦 Skills & Bundles

### Skill Management
```bash
# Quality check
cargo run -- workflow quality-skills

# Strict validation
cargo run -- workflow quality-skills --strict

# Build catalog
cargo run -- workflow build-catalog

# List bundles
cargo run -- workflow bundles
cargo run -- workflow bundles --json
```

### Import Skills
```bash
# Import from GitHub
cargo run -- workflow import-skills https://github.com/anthropics/skills --max-skills 20

# Allow missing license
cargo run -- workflow import-skills https://github.com/anthropics/skills --allow-missing-license

# Global mode
cargo run -- workflow import-skills https://github.com/anthropics/skills --mode global

# Install skillpack
cargo run -- workflow install-skillpack https://github.com/anthropics/skills --mode local

# Sync imports
cargo run -- workflow sync-imports --overwrite

# Normalize metadata
cargo run -- workflow normalize-imported-skills

# Verify lock
cargo run -- workflow verify-lock
```

### Install Bundles
```bash
# Install core bundle
cargo run -- workflow install-bundle core

# Install to global
cargo run -- workflow install-bundle imported --mode global --overwrite
```

---

## 🔐 Security

### Security Workflows
```bash
# Run security scan
cargo run -- --workflow-id cybersecurity/security-scan

# With template
cargo run -- --workflow-id cybersecurity/security-scan --template cybersecurity/security_scan_prompt

# Package check
cargo run -- workflow check
```

### Evaluation
```bash
# Run eval
cargo run -- workflow eval .agents/evals/release_eval.json

# With pass rate
cargo run -- workflow eval .agents/evals/release_eval.json --min-pass-rate 0.9 --json
```

---

## 🌐 MCP Servers

### Register & Manage
```bash
# Register server
cargo run -- workflow mcp-register ollama-cli --transport stdio --command npx --arg -y --arg mcp-client-for-ollama

# HTTP server
cargo run -- workflow mcp-register local-supabase --transport http --url http://127.0.0.1:54321/mcp

# List servers
cargo run -- workflow mcp-list

# Ping servers
cargo run -- workflow mcp-ping

# Ping specific
cargo run -- workflow mcp-ping ollama-cli --timeout-ms 8000 --json

# Check policy
cargo run -- workflow mcp-policy local-supabase --tool query
```

---

## 🔄 Thread Workflows

### Chat Threads
```bash
# Start thread
cargo run -- workflow chat-thread feature-email --message "implement signup email validation"

# With workflow
cargo run -- workflow chat-thread review-thread --message "review current diff" --workflow-id review

# With template and role
cargo run -- workflow chat-thread review-thread --message "review" --workflow-id review --template review_prompt --role reviewer --no-merge

# Thread flow (full lifecycle)
cargo run -- workflow thread-flow my-thread --target-branch main --validate-command "cargo test"
```

---

## 🔍 Graph & Context

### Index Management
```bash
# Rebuild graph index
cargo run -- workflow index-graph

# This also refreshes SQLite context tables
```

---

## 📝 Environment Variables

### LLM Configuration
```bash
# Provider
export AGENTIC_SDLC_LLM_PROVIDER=openai

# Model
export AGENTIC_SDLC_LLM_MODEL=gpt-4o-mini

# Temperature (0.0 = deterministic)
export AGENTIC_SDLC_LLM_TEMPERATURE=0.0

# Seed (for deterministic responses)
export AGENTIC_SDLC_LLM_SEED=42

# Fallback providers
export AGENTIC_SDLC_LLM_FALLBACK=gemini,anthropic

# Fallback policy
export AGENTIC_SDLC_LLM_FALLBACK_POLICY=transient_only

# Timeout
export AGENTIC_SDLC_LLM_TIMEOUT_MS=30000

# Max retries
export AGENTIC_SDLC_LLM_MAX_RETRIES=2

# Simulation fallback
export AGENTIC_SDLC_LLM_SIMULATION_FALLBACK=true
```

### Provider API Keys
```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...

# Gemini
export GEMINI_API_KEY=...

# Azure OpenAI
export AZURE_OPENAI_KEY=...
export AZURE_OPENAI_ENDPOINT=https://....openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
export AZURE_OPENAI_API_VERSION=2024-02-15-preview

# AWS Bedrock
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

### Context Retrieval
```bash
# Mode
export AGENTIC_SDLC_CONTEXT_RETRIEVAL_MODE=vector

# Backend
export AGENTIC_SDLC_CONTEXT_BACKEND=sqlite

# Paths
export AGENTIC_SDLC_CONTEXT_INDEX_PATH=.agents/memory/vector_index.json
export AGENTIC_SDLC_CONTEXT_GRAPH_INDEX_PATH=.agents/memory/graph_index.json
export AGENTIC_SDLC_CONTEXT_DB_PATH=.agents/memory/context.db

# Limits
export AGENTIC_SDLC_CONTEXT_MAX_ITEMS=5
export AGENTIC_SDLC_CONTEXT_MAX_CHARS=300
export AGENTIC_SDLC_CONTEXT_MIN_SCORE=0.1
```

### Other
```bash
# Roles directory
export AGENTIC_SDLC_ROLES_DIR=.agents/roles

# Ollama host
export AGENTIC_SDLC_OLLAMA_HOST=http://localhost:11434

# Live LLM tests
export AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1

# Bootstrap require Ollama
export AGENTIC_SDLC_BOOTSTRAP_REQUIRE_OLLAMA=1
```

---

## 🎯 Common Workflows

### Development
```bash
# 1. Check prerequisites
cargo run -- workflow doctor

# 2. Setup project
cargo run -- workflow setup

# 3. Run workflow
cargo run -- --workflow feature.md

# 4. Check status
cargo run -- workflow status

# 5. Export trace
cargo run -- workflow trace <instance_id> --json
```

### Testing Providers
```bash
# Test OpenAI
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
OPENAI_API_KEY=... \
cargo test llm_subagent_live_smoke_openai -- --nocapture

# Test Anthropic
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
ANTHROPIC_API_KEY=... \
cargo test llm_subagent_live_smoke_anthropic -- --nocapture

# Test Gemini
AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 \
GEMINI_API_KEY=... \
cargo test llm_subagent_live_smoke_gemini -- --nocapture
```

### Deterministic Testing
```bash
# Run with deterministic mode
AGENTIC_SDLC_LLM_TEMPERATURE=0.0 \
AGENTIC_SDLC_LLM_SEED=42 \
cargo run -- --workflow test.md --snapshot-out run1.json

# Run again
AGENTIC_SDLC_LLM_TEMPERATURE=0.0 \
AGENTIC_SDLC_LLM_SEED=42 \
cargo run -- --workflow test.md --snapshot-out run2.json

# Compare
diff run1.json run2.json
```

---

## 📚 Documentation

### View Docs
```bash
# Architecture
cat docs/ARCHITECTURE.md

# Deterministic mode
cat docs/DETERMINISTIC_MODE.md

# Gap roadmap
cat docs/GAP_ROADMAP.md

# Quick start
cat docs/QUICK_START_FIXES.md

# All docs
ls -la docs/
```

---

## 🔧 Troubleshooting

### Check Diagnostics
```bash
# Check for errors
cargo check

# Run clippy
cargo clippy

# Check formatting
cargo fmt -- --check
```

### Debug Mode
```bash
# With debug logging
RUST_LOG=debug cargo run -- --workflow feature.md

# With trace logging
RUST_LOG=trace cargo run -- --workflow feature.md
```

### Clean Build
```bash
# Clean build artifacts
cargo clean

# Rebuild
cargo build
```

---

## 💡 Tips

### Use .env File
```bash
# Create .env
cat > .env << 'EOF'
AGENTIC_SDLC_LLM_PROVIDER=openai
AGENTIC_SDLC_LLM_TEMPERATURE=0.0
OPENAI_API_KEY=sk-...
EOF

# Load and run
source .env && cargo run -- --workflow feature.md
```

### Alias Commands
```bash
# Add to ~/.bashrc or ~/.zshrc
alias ag='cargo run --'
alias agt='cargo test'
alias agb='cargo build'

# Usage
ag --workflow feature.md
agt resolve_temperature
agb
```

### Watch Mode
```bash
# Install cargo-watch
cargo install cargo-watch

# Watch and test
cargo watch -x test

# Watch and run
cargo watch -x 'run -- --workflow feature.md'
```

---

**Last Updated:** 2026-03-06  
**For More:** See [Quick Start Guide](docs/QUICK_START_FIXES.md)
