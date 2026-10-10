# System Prompt Architecture

## Components

### 1. Role definition

Who the model is. Be specific.

- Good: "You are a senior TypeScript engineer reviewing code for security and performance."
- Bad: "You are a helpful assistant."

### 2. Constraints

What the model must and must not do.

- Must: "Always validate inputs before processing."
- Must not: "Never generate code with `eval()` or `Function()` constructors."

### 3. Output format

Structure, schema, and examples.

```
Respond in JSON with this schema:
{
  "answer": "string",
  "confidence": "number 0-1",
  "sources": ["string"]
}
```

### 4. Error handling

What to do when uncertain or data is missing.

- "If you are uncertain, respond with confidence < 0.5 and explain why."
- "If the input is malformed, return an error object with code and message."

### 5. Context (optional)

Relevant background the model needs.

- "The codebase uses NestJS with PostgreSQL. Auth is JWT-based."

## Length discipline

- System prompts should be concise. Every sentence must earn its tokens.
- Move detailed examples to few-shot, not the system prompt.
- Test: remove one sentence at a time; if quality doesn't drop, keep it removed.

## Temperature and top-p

- **Low temp (0.0-0.3)**: Factual, deterministic tasks (classification, extraction, code).
- **Medium temp (0.4-0.7)**: Balanced creativity (summarization, rewriting).
- **High temp (0.8-1.0)**: Creative tasks (brainstorming, story generation).
- Set top-p to 1.0 when using temperature, or use top-p alone for nucleus sampling.
