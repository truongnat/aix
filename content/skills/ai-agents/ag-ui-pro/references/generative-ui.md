# Generative UI

## JSON Schema to component mapping

The agent outputs a JSON Schema; the frontend maps schema types to UI components.

```json
{
  "type": "form",
  "fields": [
    { "name": "email", "type": "email", "required": true },
    { "name": "priority", "type": "select", "options": ["low", "medium", "high"] }
  ]
}
```

Frontend renders `<Form fields={...} />` dynamically.

## A2UI (Google)

- Google's Generative UI specification for agent widgets.
- Prompt-first generation: agent describes UI; renderer builds it.
- Modular schemas: reusable component definitions.

## CopilotKit generative UI

- Built-in React components: `CopilotChat`, `CopilotSidebar`, `CopilotPopup`.
- Custom renderers: map agent output to your own components.
- Shared state: frontend and agent read/write the same state object.

## Safety

- Sanitize all generated UI before rendering (XSS prevention).
- Validate JSON Schema client-side before rendering.
- Never execute code or evaluate expressions from agent output.
