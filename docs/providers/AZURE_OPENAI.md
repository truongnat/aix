# Azure OpenAI Setup Guide

Complete guide to using Azure OpenAI with `agentic-sdlc`.

## 🎯 Overview

**Provider:** Azure OpenAI  
**Models:** Same as OpenAI (GPT-4o-mini, etc.)  
**Context Window:** 128K tokens  
**Best For:** Enterprise, compliance, Azure ecosystem  

## 🚀 Quick Start

```bash
# 1. Create Azure OpenAI resource in Azure Portal
# 2. Deploy a model (e.g., gpt-4o-mini)
# 3. Get API key and endpoint

export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# 4. Configure provider
export ANTIGRAV_LLM_PROVIDER=azure_openai

# 5. Run workflow
cargo run -- --workflow feature.md
```

## 🔧 Configuration

### Required Environment Variables

```bash
# API credentials
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

# Provider selection
export ANTIGRAV_LLM_PROVIDER=azure_openai
# or
export ANTIGRAV_LLM_PROVIDER=azure
```

### Optional Configuration

```bash
# Model override (uses deployment name)
export ANTIGRAV_LLM_MODEL=gpt-4o-mini
export ANTIGRAV_LLM_MODEL_AZURE=your-deployment-name

# API version (default: 2024-02-15-preview)
export AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Deterministic mode
export ANTIGRAV_LLM_TEMPERATURE=0.0
export ANTIGRAV_LLM_SEED=42
```

## 💰 Pricing

Similar to OpenAI, varies by region:
- Input: ~$0.15/1M tokens
- Output: ~$0.60/1M tokens

Check Azure pricing calculator for your region.

## 🎯 Use Cases

**Best For:**
- ✅ Enterprise deployments
- ✅ Compliance requirements (data residency)
- ✅ Azure ecosystem integration
- ✅ Private endpoints
- ✅ SLA guarantees

**Example:**
```bash
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
export ANTIGRAV_LLM_PROVIDER=azure_openai
cargo run -- --workflow feature.md
```

## 🔧 Azure Setup

### 1. Create Resource

```bash
# Via Azure Portal
1. Go to portal.azure.com
2. Create resource → Azure OpenAI
3. Choose region, pricing tier
4. Create

# Via Azure CLI
az cognitiveservices account create \
  --name your-openai-resource \
  --resource-group your-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

### 2. Deploy Model

```bash
# Via Portal
1. Go to your Azure OpenAI resource
2. Model deployments → Create
3. Select model (gpt-4o-mini)
4. Name deployment
5. Deploy

# Via CLI
az cognitiveservices account deployment create \
  --name your-openai-resource \
  --resource-group your-rg \
  --deployment-name gpt-4o-mini \
  --model-name gpt-4o-mini \
  --model-version "2024-07-18" \
  --model-format OpenAI \
  --sku-capacity 10 \
  --sku-name "Standard"
```

### 3. Get Credentials

```bash
# Get endpoint
az cognitiveservices account show \
  --name your-openai-resource \
  --resource-group your-rg \
  --query properties.endpoint

# Get API key
az cognitiveservices account keys list \
  --name your-openai-resource \
  --resource-group your-rg \
  --query key1
```

## 🐛 Troubleshooting

### Missing Environment Variables
```bash
export AZURE_OPENAI_API_KEY=...
export AZURE_OPENAI_ENDPOINT=https://...
export AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

### Deployment Not Found
```bash
# Check deployment name matches
az cognitiveservices account deployment list \
  --name your-openai-resource \
  --resource-group your-rg
```

### Rate Limit
```bash
# Increase quota in Azure Portal
# Or enable fallback
export ANTIGRAV_LLM_FALLBACK=openai,gemini
```

## 📚 Resources

- Azure Portal: https://portal.azure.com
- Azure OpenAI Docs: https://learn.microsoft.com/azure/ai-services/openai/
- Pricing: https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/

---

**Version:** 1.0  
**Last Updated:** 2026-03-07
