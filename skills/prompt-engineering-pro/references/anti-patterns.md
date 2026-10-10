# Prompt Engineering Anti-patterns

## 1. Overloading system prompt

**Symptom**: System prompt is 500+ tokens with 10 constraints and 5 examples.
**Fix**: Move examples to few-shot. Move detailed context to user prompt. Keep system prompt < 200 tokens.

## 2. Vague instructions

**Symptom**: "Be helpful" or "Do a good job."
**Fix**: Specific, actionable instructions: "List 3 pros and 3 cons. Format as markdown bullets."

## 3. No error handling

**Symptom**: Prompt assumes perfect input; model hallucinates on edge cases.
**Fix**: Include explicit error handling in system prompt or few-shot examples.

## 4. Hardcoding data in prompt

**Symptom**: Current date, product prices, or API URLs hardcoded in the prompt.
**Fix**: Inject dynamic data via templating. Keep prompts static; data external.

## 5. Ignoring token limits

**Symptom**: Prompt + expected output exceeds context window.
**Fix**: Estimate tokens. Compress context. Use RAG or summarization.

## 6. No versioning

**Symptom**: Prompts edited in production with no history or rollback.
**Fix**: Version every prompt in Git or a prompt registry.

## 7. Copying prompts without understanding

**Symptom**: Copying a prompt from a blog post that doesn't match your task.
**Fix**: Design prompts for your specific task, model, and constraints. Test thoroughly.
