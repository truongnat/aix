# A2A Anti-patterns

## 1. Premature multi-agent architecture

**Symptom**: Building 5 agents when a single agent with MCP tools suffices.
**Fix**: Start with one agent. Add agents only when work is truly independent and parallelizable.

## 2. Missing Agent Cards

**Symptom**: Agents hardcode peer addresses and capabilities.
**Fix**: Every agent must publish a versioned Agent Card. Discovery must be dynamic.

## 3. No task observability

**Symptom**: Tasks are fire-and-forget; failures are invisible.
**Fix**: Implement full task lifecycle tracking with centralized logging.

## 4. Trusting all peers

**Symptom**: No auth between internal agents.
**Fix**: Mutual auth (mTLS or OAuth) for all A2A connections.

## 5. Tight coupling to single LLM vendor

**Symptom**: All agents use the same model family.
**Fix**: Abstract model interface; route to best model per agent/task.
