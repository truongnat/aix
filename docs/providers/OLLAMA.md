# Ollama Setup Guide

Complete guide to using Ollama (local LLMs) with `agentic-sdlc`.

## 🎯 Overview

**Provider:** Ollama  
**Models:** Qwen, Llama, Mistral, and more  
**Context Window:** 2K-128K (varies by model)  
**Best For:** Development, testing, offline work, privacy  

## 🚀 Quick Start

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull a model
ollama pull qwen3:8b

# 3. Start Ollama (runs automatically after install)
# Check: ollama list

# 4. Configure provider (default)
export AGENTIC_SDLC_LLM_PROVIDER=ollama

# 5. Run workflow
cargo run -- --workflow feature.md
```

## 🔧 Configuration

### Basic Setup

```bash
# Provider selection (default)
export AGENTIC_SDLC_LLM_PROVIDER=ollama

# Optional: Model override
export AGENTIC_SDLC_LLM_MODEL=qwen3:8b

# Optional: Ollama host
export AGENTIC_SDLC_OLLAMA_HOST=http://localhost:11434
# or
export OLLAMA_HOST=http://localhost:11434
```

### Available Models

Popular models (pull with `ollama pull <model>`):

| Model | Size | Context | Best For |
|-------|------|---------|----------|
| `qwen3:8b` | 4.7GB | 32K | Fast, good quality (default) |
| `llama3.2:3b` | 2GB | 128K | Lightweight |
| `mistral:7b` | 4.1GB | 32K | Good balance |
| `codellama:7b` | 3.8GB | 16K | Code generation |
| `phi3:mini` | 2.3GB | 128K | Very fast |

**Default:** `qwen3:8b`

### Pull Models

```bash
# Pull default model
ollama pull qwen3:8b

# Pull other models
ollama pull llama3.2:3b
ollama pull mistral:7b
ollama pull codellama:7b

# List installed models
ollama list
```

## 💰 Pricing

**Cost:** $0 (completely free!)

**Requirements:**
- Disk space: 2-10GB per model
- RAM: 8GB+ recommended
- GPU: Optional (faster with GPU)

## 🎯 Use Cases

**Best For:**
- ✅ Development and testing
- ✅ Offline work
- ✅ Privacy (data stays local)
- ✅ Cost-free experimentation
- ✅ Learning and prototyping

**Not Ideal For:**
- ❌ Production (use cloud providers)
- ❌ Determinism (no seed support)
- ❌ Large context (limited vs cloud)

**Example:**
```bash
# Development workflow
export AGENTIC_SDLC_LLM_PROVIDER=ollama
export AGENTIC_SDLC_LLM_MODEL=qwen3:8b
cargo run -- --workflow feature.md
```

## 🔧 Installation

### macOS

```bash
# Via installer
curl -fsSL https://ollama.com/install.sh | sh

# Via Homebrew
brew install ollama

# Start service
ollama serve
```

### Linux

```bash
# Via installer
curl -fsSL https://ollama.com/install.sh | sh

# Manual start
ollama serve

# Or as systemd service (auto-starts)
systemctl start ollama
systemctl enable ollama
```

### Windows

```bash
# Download from https://ollama.com/download/windows
# Run installer
# Ollama starts automatically
```

### Docker

```bash
# Run Ollama in Docker
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull model
docker exec -it ollama ollama pull qwen3:8b

# Use from host
export AGENTIC_SDLC_OLLAMA_HOST=http://localhost:11434
```

## 🧪 Testing

### Test Ollama

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Test generation
ollama run qwen3:8b "Hello, how are you?"
```

### Test with agentic-sdlc

```bash
export AGENTIC_SDLC_LLM_PROVIDER=ollama
cargo run -- --workflow test_replay_workflow.md
```

## 🐛 Troubleshooting

### Ollama Not Running

**Error:**
```
ollama request failed: Connection refused
```

**Solution:**
```bash
# Start Ollama
ollama serve

# Or check status
ps aux | grep ollama
```

### Model Not Found

**Error:**
```
ollama error: model 'qwen3:8b' not found
```

**Solution:**
```bash
# Pull the model
ollama pull qwen3:8b

# List available models
ollama list
```

### Out of Memory

**Error:**
```
ollama error: not enough memory
```

**Solution:**
```bash
# Use smaller model
export AGENTIC_SDLC_LLM_MODEL=phi3:mini

# Or close other applications
# Or add more RAM
```

### Slow Performance

**Solution:**
```bash
# Use smaller model
export AGENTIC_SDLC_LLM_MODEL=llama3.2:3b

# Or use GPU acceleration (if available)
# Ollama automatically uses GPU if detected

# Check GPU usage
nvidia-smi  # NVIDIA
rocm-smi    # AMD
```

## ⚡ Performance

### Response Times (on M1 Mac)

| Model | Tokens/sec | Latency |
|-------|------------|---------|
| phi3:mini | ~50 | 200ms |
| qwen3:8b | ~30 | 300ms |
| llama3.2:3b | ~40 | 250ms |
| mistral:7b | ~25 | 400ms |

**Note:** Performance varies by hardware.

### Optimization

```bash
# Use smaller model for speed
export AGENTIC_SDLC_LLM_MODEL=phi3:mini

# Use quantized models (smaller, faster)
ollama pull qwen3:8b-q4_0  # 4-bit quantization

# Enable GPU (automatic if available)
# Check: ollama ps
```

## 🔒 Privacy

**Data Privacy:**
- ✅ All data stays on your machine
- ✅ No internet required (after model download)
- ✅ No API keys needed
- ✅ Complete privacy

**Best For:**
- Sensitive data
- Proprietary code
- Compliance requirements
- Offline environments

## 🎓 Advanced Usage

### Custom Models

```bash
# Create custom model
ollama create mymodel -f Modelfile

# Use custom model
export AGENTIC_SDLC_LLM_MODEL=mymodel
```

### Remote Ollama

```bash
# Run Ollama on server
ssh server "ollama serve"

# Connect from client
export AGENTIC_SDLC_OLLAMA_HOST=http://server:11434
```

### Multiple Models

```bash
# Pull multiple models
ollama pull qwen3:8b
ollama pull codellama:7b

# Switch between models
export AGENTIC_SDLC_LLM_MODEL=qwen3:8b      # General
export AGENTIC_SDLC_LLM_MODEL=codellama:7b  # Code
```

## 📚 Resources

- Website: https://ollama.com/
- Models: https://ollama.com/library
- GitHub: https://github.com/ollama/ollama
- Discord: https://discord.gg/ollama

---

**Version:** 1.0  
**Last Updated:** 2026-03-07
