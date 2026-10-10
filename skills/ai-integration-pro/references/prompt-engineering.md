# AI Integration — Prompt engineering

## System prompt structure

```
[ROLE]
You are a [role] specialized in [domain].

[TASK]
Your task is to [specific task]. Always [key behavior].

[CONSTRAINTS]
- Never [forbidden behavior]
- Only [allowed scope]
- When unsure, [fallback behavior]

[OUTPUT FORMAT]
Respond with valid JSON matching this schema:
{
  "answer": string,
  "confidence": "high" | "medium" | "low",
  "citations": string[]
}

[EXAMPLES]
Input: ...
Output: ...
```

## Few-shot examples (Claude)

```ts
const response = await anthropic.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  system: 'You are a sentiment classifier. Respond with JSON only.',
  messages: [
    { role: 'user', content: 'This product is amazing!' },
    { role: 'assistant', content: '{"sentiment": "positive", "score": 0.95}' },
    { role: 'user', content: 'Worst experience ever.' },
    { role: 'assistant', content: '{"sentiment": "negative", "score": 0.02}' },
    { role: 'user', content: 'It was okay I guess.' },
  ],
});
```

## Chain-of-thought

```ts
const systemPrompt = `
Solve the problem step by step:
1. Identify what is being asked
2. List what you know
3. Work through the logic
4. State your conclusion

Format: <thinking>...</thinking>\n<answer>...</answer>
`;
```

## Structured output (Claude XML tags)

```ts
const systemPrompt = `
Extract the key information and respond using these XML tags:
<name>person's full name</name>
<company>company name</company>
<role>job title</role>
`;

// Parse response
const name = response.match(/<name>(.*?)<\/name>/s)?.[1];
```

## Temperature guide

| Use case | Temperature |
|----------|-------------|
| JSON/structured output | 0.0 |
| Code generation | 0.0–0.2 |
| Factual Q&A | 0.1–0.3 |
| Summarization | 0.3–0.5 |
| Creative writing | 0.7–1.0 |

## Prompt injection defense

```ts
// Never interpolate user content directly into instructions
// Bad:
const prompt = `Summarize this document: ${userContent}`;

// Good: separate user content from instructions
const messages = [{
  role: 'user',
  content: [
    { type: 'text', text: 'Summarize the following document:' },
    { type: 'text', text: `<document>\n${sanitize(userContent)}\n</document>` }
  ]
}];
```
