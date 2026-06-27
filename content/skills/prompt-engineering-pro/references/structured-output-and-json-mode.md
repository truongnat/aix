# Structured Output and JSON Mode

## JSON mode

Most modern LLMs support JSON mode or constrained decoding.

### OpenAI

- Use `response_format: { type: "json_object" }` or `response_format: { type: "json_schema", json_schema: {...} }`.
- Include "JSON" in the system or user prompt.
- Validate output with JSON Schema client-side.

### Anthropic

- Use `tool_use` with a single tool for structured output.
- Or request JSON in the prompt and parse client-side.
- Prompt caching works well with static schema descriptions.

### Google Gemini

- Use `responseMimeType: "application/json"` with a schema.
- Native schema enforcement reduces parse failures.

## JSON Schema best practices

1. **Required fields**: Always specify `required` array.
2. **Descriptions**: Every field should have a `description`.
3. **Enums**: Use `enum` for closed sets (status codes, categories).
4. **Examples**: Include `examples` for complex fields.
5. **Nested limits**: Avoid deeply nested schemas (>3 levels) that confuse models.

## Fallback strategy

Even with JSON mode, models occasionally produce malformed JSON.

1. **Parse attempt**: Try `JSON.parse()`.
2. **Regex repair**: Fix common issues (trailing commas, unquoted keys).
3. **Retry**: Send the malformed output back with "Fix this JSON: ...".
4. **Graceful degrade**: Return partial data or an error object.

## Alternative formats

- **XML**: Good for models trained on XML (older GPT models).
- **Markdown tables**: Human-readable, easy to parse with regex.
- **YAML**: Compact for nested data; watch for indentation sensitivity.
