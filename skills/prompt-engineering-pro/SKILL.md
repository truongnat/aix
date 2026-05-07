---
name: prompt-engineering-pro
description: |
  Design, optimize, and version prompts for LLM applications: system prompts, few-shot patterns, chain-of-thought, structured outputs, prompt caching, and A/B testing.

  Use this skill when designing prompts for an LLM application, optimizing token usage, comparing prompt variants, implementing structured output (JSON mode), or building a prompt versioning system.

  Do not use for building the full agent pipeline (use ai-integration-pro) or for evaluating prompt quality (use agent-evaluation-pro).

  Triggers: "prompt design", "system prompt", "chain of thought", "few-shot", "structured output", "JSON mode", "prompt template", "prompt versioning", "prompt caching", "optimize tokens", "prompt engineering", "prompt comparison", "prompt A/B test".

metadata:
  short-description: Prompt engineering — design, optimization, versioning, structured output
  content-language: en
  domain: ai-integration
  level: professional
---

# Prompt engineering (professional)

Skill text is **English**; match the user's response language from Cursor User Rules / project rules when applicable.

Use official LLM provider docs (OpenAI, Anthropic, Google) and research on prompt engineering (chain-of-thought, ReAct, Tree of Thoughts) as authority. This skill encodes **system prompt architecture**, **few-shot design**, **structured output patterns**, **token optimization**, **prompt caching**, and **versioning**. Confirm **model**, **context window**, **output format requirements**, and **latency budget** before proposing a prompt.

## Boundary

**`prompt-engineering-pro`** owns **prompt design**, **optimization**, **structured output patterns**, **caching strategy**, and **versioning**. It does **not** own the full agent pipeline (RAG, tool use, memory) or evaluation — combine with **`ai-integration-pro`** and **`agent-evaluation-pro`** as needed.

| Skill | When to combine with **`prompt-engineering-pro`** |
|-------|---------------------------------------------------|
| **`ai-integration-pro`** | When the prompt is part of a broader agent with tools, RAG, or memory |
| **`agent-evaluation-pro`** | When measuring prompt quality with metrics and regression tests |
| **`testing-pro`** | When integrating prompt tests into CI |

## When to use

- Designing system prompts, user prompts, or assistant prompts for an LLM application.
- Implementing few-shot examples, chain-of-thought, or ReAct patterns.
- Enabling structured outputs (JSON mode, function calling, schema enforcement).
- Optimizing token usage (prompt compression, caching, context window management).
- Comparing prompt variants with A/B testing or statistical significance.
- Building a prompt versioning system (Git-based, registry, or prompt management tool).
- Trigger keywords: `prompt design`, `system prompt`, `chain of thought`, `few-shot`, `structured output`, `JSON mode`, `prompt template`, `prompt caching`

## When not to use

- **Building the full agent** (tools, RAG, memory, orchestration) — use **`ai-integration-pro`**.
- **Evaluating prompt quality** with metrics and datasets — use **`agent-evaluation-pro`**.
- **General software testing** — use **`testing-pro`**.

## Required inputs

- **Model** — GPT-4, Claude, Gemini, Llama, etc.
- **Context window** — available tokens for system + user + few-shot + output.
- **Output format** — free text, JSON, structured list, code, etc.
- **Latency budget** — target response time (affects prompt length and model choice).

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** model, context window, output format, and latency budget → verify: [constraints documented].
2. **State assumptions** about user intent, data availability, and error modes (**Think Before Coding**).
3. **Apply** minimum prompt structure first; add few-shot or CoT only when justified (**Simplicity First**).
4. **Make surgical changes** — only modify the prompt directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified with output samples (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Understand the task deeply before writing the prompt. A well-understood task needs fewer tokens and fewer examples.
2. **Simplicity First** — Start with a clear system prompt + user prompt. Add few-shot, CoT, or ReAct only when the baseline fails.
3. **Surgical Changes** — When iterating, change one component at a time (system prompt, few-shot, or schema). Measure the impact.
4. **Goal-Driven Execution** — Done = the prompt produces correct, consistent outputs on representative inputs.
5. **System prompt = contract** — The system prompt defines the model's role, constraints, output format, and error handling. Invest heavily here.
6. **Few-shot quality > quantity** — 2-3 high-quality examples beat 10 mediocre ones. Curate examples that cover edge cases.
7. **Structured output is a forcing function** — JSON mode or function calling reduces ambiguity and makes downstream parsing reliable.
8. **Version every prompt** — Treat prompts like code. Version, diff, and review them.

## Default recommendations by scenario

| Scenario | Default |
|----------|---------|
| Simple Q&A | System prompt + user prompt, no few-shot |
| Complex reasoning | System prompt + chain-of-thought in user prompt |
| Classification / extraction | System prompt + 2-3 few-shot examples + JSON mode |
| Multi-step agent | System prompt + ReAct pattern + tool descriptions |
| Code generation | System prompt + language/framework context + output format rules |
| Creative writing | System prompt + style constraints + temperature > 0.7 |

## Decision trees

Summary: task complexity → prompt structure → output format → optimization.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: overloading system prompt, vague instructions, no error handling, hardcoding data in prompt, ignoring token limits, no versioning, copying prompts without understanding.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### System prompt architecture (summary)

- Role definition: who the model is (expert, assistant, reviewer).
- Constraints: what the model must and must not do.
- Output format: structure, schema, examples.
- Error handling: what to do when uncertain or data is missing.

Details: [references/system-prompt-architecture.md](references/system-prompt-architecture.md)

### Few-shot and chain-of-thought patterns (summary)

- Few-shot: 2-5 examples covering happy path and edge cases.
- CoT: explicit reasoning steps in the output; reduces errors on complex tasks.
- ReAct: reasoning + action loop for multi-step tasks with tool use.

Details: [references/few-shot-and-cot-patterns.md](references/few-shot-and-cot-patterns.md)

### Structured output and JSON mode (summary)

- JSON mode: enforce JSON output with schema validation.
- Function calling: structured args for external tool invocation.
- XML / Markdown: alternative structured formats for models without JSON mode.

Details: [references/structured-output-and-json-mode.md](references/structured-output-and-json-mode.md)

### Token optimization and caching (summary)

- Prompt compression: summarize context, remove redundancy.
- Caching: cache static system prompts and few-shot examples (Anthropic prompt caching, OpenAI context caching).
- Context window management: sliding window, RAG for long context.

Details: [references/token-optimization-and-caching.md](references/token-optimization-and-caching.md)

## Cross-skill handoffs

- **`ai-integration-pro`** — when the prompt is part of a broader agent with tools, RAG, or memory.
- **`agent-evaluation-pro`** — when measuring prompt quality with metrics and regression tests.
- **`testing-pro`** — when integrating prompt tests into CI.

Details: [references/integration-map.md](references/integration-map.md)

## Suggested response format (implement / review)

1. **Issue or goal** — What the prompt needs to achieve and the constraints.
2. **Recommendation** — Prompt structure, model choice, output format, and optimization strategy.
3. **Code** — System prompt, user prompt template, few-shot examples, JSON schema, and sample outputs.
4. **Residual risks** — Token overflow, model hallucination, schema drift, latency.

## Resources in this skill

| Topic | File |
|-------|------|
| System prompt architecture | [references/system-prompt-architecture.md](references/system-prompt-architecture.md) |
| Few-shot and CoT patterns | [references/few-shot-and-cot-patterns.md](references/few-shot-and-cot-patterns.md) |
| Structured output and JSON mode | [references/structured-output-and-json-mode.md](references/structured-output-and-json-mode.md) |
| Token optimization and caching | [references/token-optimization-and-caching.md](references/token-optimization-and-caching.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |

## Quick example

**Input:** "Our extraction prompt sometimes returns malformed JSON. Fix it."
- Add explicit JSON schema in the system prompt with an example.
- Use model's JSON mode (if available) to enforce schema.
- Add validation layer: parse → catch JSONDecodeError → retry with corrected prompt.
- **Verify:** Run 50 examples; JSON parse success rate = 100%.

**Input (tricky):** "Reduce token usage for our long-context summarization prompt."
- Compress input: chunk text, extract key sentences, then summarize chunks.
- Use prompt caching for static system prompt (Anthropic / OpenAI).
- Evaluate: token count before vs. after; quality metric (ROUGE or human) must not degrade.
- **Verify:** Token count reduced by >30% with no quality degradation.

**Input (cross-skill):** "Design a ReAct agent prompt for our customer support bot."
- **`prompt-engineering-pro`**: Design ReAct prompt structure (thought → action → observation).
- **`ai-integration-pro`**: Integrate with tool definitions, RAG for knowledge base, and memory.
- **`agent-evaluation-pro`**: Build eval dataset for multi-step reasoning accuracy.
- **Verify:** Each skill owns a clear slice; prompt defines the reasoning loop, agent-pro owns execution.

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum prompt structure; added complexity only when justified (Simplicity First)
- [ ] Only modified prompt components directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified with output samples (Goal-Driven Execution)
- [ ] System prompt defines role, constraints, output format, and error handling
- [ ] Few-shot examples are high-quality and cover edge cases
- [ ] Structured output enforced where applicable (JSON mode, function calling)
- [ ] Token count estimated and within context window
- [ ] Prompt is versioned (Git, registry, or prompt management tool)
- [ ] Residual risks called out: hallucination, schema drift, latency
