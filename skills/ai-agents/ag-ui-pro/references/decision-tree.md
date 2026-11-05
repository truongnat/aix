# AG-UI Decision Tree

```
What is the interaction type?
├── Chat → Streaming chat component (CopilotKit or custom SSE)
├── Action approval → HITL modal with context preview
├── Dynamic form → Generative UI with JSON Schema mapping
├── Collaborative → Shared state with WebSocket
└── Dashboard → Embedded agent widgets with real-time updates

Which transport?
├── Simple chat, one-directional → SSE
├── Collaborative, bidirectional → WebSocket
├── Fallback needed → HTTP polling (last resort)

Which framework?
├── React → CopilotKit, custom AG-UI client
├── Vue → Custom AG-UI integration
├── Svelte → Custom AG-UI integration
└── Vanilla JS → AG-UI protocol directly over EventSource
```
