---
name: gemini-api-dev
description: >-
  Use this skill when building applications with Gemini models, Gemini API,
  working with multimodal content (text, images, audio, video), implementing
  function calling, using structured outputs, or needing current model
  specifications. Covers SDK usage (google-genai for Python, @google/genai for
  JavaScript/TypeScript, com.google.genai:google-genai for Java,
  google.golang.org/genai for Go), model selection, and API capabilities.
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

## Boundary

This skill provides guidance for building applications with Gemini models, Gemini API, multimodal content processing, function calling, and structured outputs. It focuses on SDK usage (Python, JavaScript/TypeScript, Java, Go), model selection, and API capabilities. It does NOT cover other AI models (OpenAI, Anthropic, etc.) or general ML/LLM development (those have dedicated skills).

## When to use

Use this skill when:
- Building applications with Gemini models (text, images, audio, video)
- Implementing function calling with Gemini
- Using structured outputs (JSON generation)
- Working with multimodal content
- Using context caching for efficiency
- Generating embeddings for semantic search
- Selecting appropriate Gemini models for your use case

DO NOT use this skill for:
- OpenAI, Anthropic, or other AI model APIs (use ai-integration-pro skill)
- General ML model development (use data-analysis-pro or algorithm-pro skills)
- Prompt engineering for non-Gemini models (use prompt-engineering-pro skill)
- RAG systems with non-Gemini embeddings (use those specific skills)

## Workflow

1. **Select the appropriate Gemini model** (gemini-3-pro-preview, gemini-3-flash-preview, gemini-3-pro-image-preview)
2. **Install the SDK** for your language (Python, JavaScript/TypeScript, Java, Go)
3. **Configure API authentication** (API key or OAuth)
4. **Implement the API call** with appropriate parameters
5. **Handle responses** (text generation, structured output, function calls)
6. **Implement error handling** and rate limiting
7. **Test and validate** outputs

### Operating principles

- **Use current models**: gemini-3-pro-preview, gemini-3-flash-preview, gemini-3-pro-image-preview (legacy models deprecated)
- **Choose model based on task**: pro-preview for complex reasoning, flash-preview for speed, image-preview for images
- **Implement function calling** for structured interactions with your code
- **Use context caching** for large contexts to improve efficiency
- **Handle multimodal content** appropriately (images, audio, video)
- **Validate structured outputs** against your schema
- **Implement rate limiting** and retry logic
- **Secure API keys** properly (environment variables, secret management)

## Suggested response format

```
Gemini Model: [model name]
Task: [text generation / function calling / multimodal / structured output]
Language: [Python / JavaScript / Java / Go]
Status: [success/failed]
Details: [implementation details, API parameters, response handling]
Next steps: [follow-up actions if any]
```

## Resources in this skill

- **SDK Documentation**: Python (google-genai), JavaScript/TypeScript (@google/genai), Java (com.google.genai:google-genai), Go (google.golang.org/genai)
- **Model Specifications**: gemini-3-pro-preview, gemini-3-flash-preview, gemini-3-pro-image-preview
- **API Capabilities**: Text generation, multimodal, function calling, structured output, code execution, context caching, embeddings
- **Code Examples**: SDK usage patterns for all supported languages

## Quick example

**Generate text with Gemini:**

```
1. Install SDK: npm install @google/genai
2. Import and initialize client with API key
3. Call generateContent with prompt
4. Handle response text
5. Implement error handling
```

## Checklist before calling the skill done

- [ ] Gemini API key is configured (GEMINI_API_KEY environment variable)
- [ ] Appropriate Gemini model is selected for the task
- [ ] SDK is installed for target language
- [ ] API authentication is set up
- [ ] Rate limiting strategy is defined
- [ ] Error handling is implemented
- [ ] Response validation is planned
- [ ] Multimodal requirements are identified (if applicable)

---

# Gemini API Development Skill

## Overview

The Gemini API provides access to Google's most advanced AI models. Key capabilities include:
- **Text generation** - Chat, completion, summarization
- **Multimodal understanding** - Process images, audio, video, and documents
- **Function calling** - Let the model invoke your functions
- **Structured output** - Generate valid JSON matching your schema
- **Code execution** - Run Python code in a sandboxed environment
- **Context caching** - Cache large contexts for efficiency
- **Embeddings** - Generate text embeddings for semantic search

## Current Gemini Models

- `gemini-3-pro-preview`: 1M tokens, complex reasoning, coding, research
- `gemini-3-flash-preview`: 1M tokens, fast, balanced performance, multimodal
- `gemini-3-pro-image-preview`: 65k / 32k tokens, image generation and editing


> [!IMPORTANT]
> Models like `gemini-2.5-*`, `gemini-2.0-*`, `gemini-1.5-*` are legacy and deprecated. Use the new models above. Your knowledge is outdated.

## SDKs

- **Python**: `google-genai` install with `pip install google-genai`
- **JavaScript/TypeScript**: `@google/genai` install with `npm install @google/genai`
- **Go**: `google.golang.org/genai` install with `go get google.golang.org/genai`
- **Java**:
  - groupId: `com.google.genai`, artifactId: `google-genai`
  - Latest version can be found here: https://central.sonatype.com/artifact/com.google.genai/google-genai/versions (let's call it `LAST_VERSION`) 
  - Install in `build.gradle`:
    ```
    implementation("com.google.genai:google-genai:${LAST_VERSION}")
    ```
  - Install Maven dependency in `pom.xml`:
    ```
    <dependency>
	    <groupId>com.google.genai</groupId>
	    <artifactId>google-genai</artifactId>
	    <version>${LAST_VERSION}</version>
	</dependency>
    ```

> [!WARNING]
> Legacy SDKs `google-generativeai` (Python) and `@google/generative-ai` (JS) are deprecated. Migrate to the new SDKs above urgently by following the Migration Guide.

## Quick Start

### Python
```python
from google import genai

client = genai.Client()
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Explain quantum computing"
)
print(response.text)
```

### JavaScript/TypeScript
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: "Explain quantum computing"
});
console.log(response.text);
```

### Go
```go
package main

import (
	"context"
	"fmt"
	"log"
	"google.golang.org/genai"
)

func main() {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	resp, err := client.Models.GenerateContent(ctx, "gemini-3-flash-preview", genai.Text("Explain quantum computing"), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(resp.Text)
}
```

### Java

```java
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

public class GenerateTextFromTextInput {
  public static void main(String[] args) {
    Client client = new Client();
    GenerateContentResponse response =
        client.models.generateContent(
            "gemini-3-flash-preview",
            "Explain quantum computing",
            null);

    System.out.println(response.text());
  }
}
```

## API spec (source of truth)

**Always use the latest REST API discovery spec as the source of truth for API definitions** (request/response schemas, parameters, methods). Fetch the spec when implementing or debugging API integration:

- **v1beta** (default): `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta`  
  Use this unless the integration is explicitly pinned to v1. The official SDKs (google-genai, @google/genai, google.golang.org/genai) target v1beta.
- **v1**: `https://generativelanguage.googleapis.com/$discovery/rest?version=v1`  
  Use only when the integration is specifically set to v1.

When in doubt, use v1beta. Refer to the spec for exact field names, types, and supported operations.

## How to use the Gemini API

For detailed API documentation, fetch from the official docs index:

**llms.txt URL**: `https://ai.google.dev/gemini-api/docs/llms.txt`

This index contains links to all documentation pages in `.md.txt` format. Use web fetch tools to:

1. Fetch `llms.txt` to discover available documentation pages
2. Fetch specific pages (e.g., `https://ai.google.dev/gemini-api/docs/function-calling.md.txt`)

### Key Documentation Pages 

> [!IMPORTANT]
> Those are not all the documentation pages. Use the `llms.txt` index to discover available documentation pages

- [Models](https://ai.google.dev/gemini-api/docs/models.md.txt)
- [Google AI Studio quickstart](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart.md.txt)
- [Nano Banana image generation](https://ai.google.dev/gemini-api/docs/image-generation.md.txt)
- [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling.md.txt)
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output.md.txt)
- [Text generation](https://ai.google.dev/gemini-api/docs/text-generation.md.txt)
- [Image understanding](https://ai.google.dev/gemini-api/docs/image-understanding.md.txt)
- [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings.md.txt)
- [Interactions API](https://ai.google.dev/gemini-api/docs/interactions.md.txt)
- [SDK migration guide](https://ai.google.dev/gemini-api/docs/migrate.md.txt)

## Gemini Live API

For real-time, bidirectional audio/video/text streaming with the Gemini Live API, install the **`google-gemini/gemini-live-api-dev`** skill. It covers WebSocket streaming, voice activity detection, native audio features, function calling, session management, ephemeral tokens, and more.
