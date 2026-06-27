# Streaming and Real-Time Patterns

## SSE (Server-Sent Events)

- **Mechanism**: HTTP connection; server pushes events to client.
- **Pros**: Simple, works over HTTP, firewall-friendly.
- **Cons**: One-directional (server→client), reconnect logic needed.
- **Use when**: Chat UIs, progress updates, simple real-time data.

## WebSocket

- **Mechanism**: Persistent bidirectional connection.
- **Pros**: Lower latency, bidirectional, efficient for high-frequency updates.
- **Cons**: More complex, proxy/firewall issues, connection management.
- **Use when**: Collaborative editing, games, high-frequency data.

## AG-UI Events

- Standardized event types: `agent_message`, `user_message`, `tool_call`, `tool_result`, `state_update`.
- Transport-agnostic: works over SSE, WebSocket, or HTTP polling fallback.
- **Use when**: Standardizing agent frontend/backend communication.

## Implementation tips

- Always show connection status (connected / reconnecting / disconnected).
- Debounce rapid updates to avoid UI jank.
- Handle reconnection gracefully: restore state, replay missed events.
