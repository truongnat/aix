# AWS Bedrock Setup Guide

Complete guide to using AWS Bedrock with `agentic-sdlc`.

## 🎯 Overview

**Provider:** AWS Bedrock  
**Models:** Claude 3 Haiku, Claude 3 Sonnet (via Bedrock)  
**Context Window:** 200K tokens  
**Best For:** AWS ecosystem, Claude on AWS  

## 🚀 Quick Start

```bash
# 1. Set up AWS credentials
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

# 2. Enable Bedrock models in AWS Console
# Go to Bedrock → Model access → Request access

# 3. Configure provider
export ANTIGRAV_LLM_PROVIDER=bedrock

# 4. Run workflow
cargo run -- --workflow feature.md
```

## 🔧 Configuration

### Required Environment Variables

```bash
# AWS credentials
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

# Provider selection
export ANTIGRAV_LLM_PROVIDER=bedrock
# or
export ANTIGRAV_LLM_PROVIDER=aws_bedrock
```

### Optional Configuration

```bash
# Model override
export ANTIGRAV_LLM_MODEL=anthropic.claude-3-haiku-20240307-v1:0
export ANTIGRAV_LLM_MODEL_BEDROCK=anthropic.claude-3-5-sonnet-20240620-v1:0

# Session token (if using temporary credentials)
export AWS_SESSION_TOKEN=...
```

### Available Models

| Model ID | Model | Context | Cost |
|----------|-------|---------|------|
| `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku | 200K | $ |
| `anthropic.claude-3-sonnet-20240229-v1:0` | Claude 3 Sonnet | 200K | $$ |
| `anthropic.claude-3-5-sonnet-20240620-v1:0` | Claude 3.5 Sonnet | 200K | $$$ |

**Default:** `anthropic.claude-3-haiku-20240307-v1:0`

## 💰 Pricing

Similar to Anthropic direct pricing, varies by region.

**Claude 3 Haiku:**
- Input: ~$0.25/1M tokens
- Output: ~$1.25/1M tokens

Check AWS Bedrock pricing for your region.

## 🎯 Use Cases

**Best For:**
- ✅ AWS ecosystem integration
- ✅ Claude models on AWS
- ✅ Enterprise AWS deployments
- ✅ VPC endpoints
- ✅ AWS IAM integration

**Example:**
```bash
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
export ANTIGRAV_LLM_PROVIDER=bedrock
cargo run -- --workflow feature.md
```

## 🔧 AWS Setup

### 1. Enable Bedrock Access

```bash
# Via AWS Console
1. Go to AWS Bedrock console
2. Navigate to "Model access"
3. Click "Manage model access"
4. Select Anthropic Claude models
5. Submit request
6. Wait for approval (usually instant)
```

### 2. Create IAM User (Optional)

```bash
# Create IAM user with Bedrock permissions
aws iam create-user --user-name bedrock-user

# Attach policy
aws iam attach-user-policy \
  --user-name bedrock-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

# Create access key
aws iam create-access-key --user-name bedrock-user
```

### 3. Test Access

```bash
# List available models
aws bedrock list-foundation-models --region us-east-1

# Test invoke
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{"prompt":"Hello","max_tokens":100}' \
  --region us-east-1 \
  output.json
```

## 🐛 Troubleshooting

### AWS Credentials Not Found
```bash
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
```

### Model Access Denied
```bash
# Enable model access in Bedrock console
# Go to Bedrock → Model access → Request access
```

### Region Not Supported
```bash
# Use supported region
export AWS_REGION=us-east-1  # or us-west-2
```

### IAM Permission Denied
```bash
# Ensure IAM user has bedrock:InvokeModel permission
# Attach AmazonBedrockFullAccess policy
```

## 📚 Resources

- AWS Bedrock Console: https://console.aws.amazon.com/bedrock/
- Bedrock Docs: https://docs.aws.amazon.com/bedrock/
- Pricing: https://aws.amazon.com/bedrock/pricing/
- Model IDs: https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html

---

**Version:** 1.0  
**Last Updated:** 2026-03-07
