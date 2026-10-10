# Prompt Engineering Decision Tree

## Task complexity → prompt structure

```
How complex is the task?
├── Simple (single-step, clear output) → System prompt + user prompt
├── Medium (needs examples) → System prompt + 2-3 few-shot examples + user prompt
├── Complex (multi-step reasoning) → System prompt + chain-of-thought + user prompt
└── Agent (tools, memory, RAG) → System prompt + ReAct + tool descriptions + user prompt

What output format?
├── Free text → No special mode
├── Structured data → JSON mode or function calling
├── Code → Specify language, style, and constraints
└── Creative → Higher temperature, style constraints

What is the latency budget?
├── < 1 second → Short prompt, fast model, no CoT
├── 1-5 seconds → Standard prompt, CoT if needed
└── > 5 seconds → Complex reasoning acceptable; optimize quality

Context window pressure?
├── Low (< 50% used) → Standard prompt
├── Medium (50-80%) → Compress context, remove redundancy
└── High (> 80%) → RAG, summarization, or sliding window
```
