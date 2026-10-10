# AG-UI Anti-patterns

## 1. Polling instead of streaming

**Symptom**: Frontend polls every 2 seconds for agent updates.
**Fix**: Use SSE or WebSocket for real-time updates.

## 2. No error states

**Symptom**: UI shows nothing when agent fails or connection drops.
**Fix**: Explicit error UI with retry option and clear messaging.

## 3. Duplicating state

**Symptom**: Frontend and backend maintain separate conversation state.
**Fix**: Shared state with one source of truth (AG-UI events or WebSocket).

## 4. Blocking UI on agent thinking

**Symptom**: Entire page freezes during agent processing.
**Fix**: Async processing with loading indicators; allow cancellation.

## 5. No HITL for destructive actions

**Symptom**: Agent deletes records without confirmation.
**Fix**: Approval gate for all destructive or high-stakes actions.

## 6. Ignoring accessibility

**Symptom**: Chat UI is not keyboard-navigable or screen-reader friendly.
**Fix**: ARIA labels, keyboard shortcuts, focus management.
