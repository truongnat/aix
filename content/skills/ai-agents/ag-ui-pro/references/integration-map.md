# AG-UI Integration Map

## ai-integration-pro

- **When**: Designing the agent backend that powers the UI.
- **Ownership split**:
  - `ag-ui-pro`: Frontend components, state sync, user interaction.
  - `ai-integration-pro`: Agent backend, prompts, tools, RAG.

## frontend-design-pro

- **When**: Designing the visual aesthetic and component style.
- **Ownership split**:
  - `ag-ui-pro`: Agent-interactive components and patterns.
  - `frontend-design-pro`: Visual design, accessibility, brand consistency.

## react-pro / nextjs-pro

- **When**: Implementing in React / Next.js.
- **Ownership split**:
  - `ag-ui-pro`: Agent-specific components and state management.
  - `react-pro` / `nextjs-pro`: Framework patterns, routing, SSR considerations.

## a2a-protocol-pro

- **When**: Frontend interacts with a multi-agent system.
- **Ownership split**:
  - `ag-ui-pro`: Frontend integration with the Gateway or coordinator.
  - `a2a-protocol-pro`: Multi-agent orchestration behind the frontend.

## auth-pro

- **When**: UI needs user authentication and authorization.
- **Ownership split**:
  - `ag-ui-pro`: Auth UI components (login, logout, session display).
  - `auth-pro`: Auth architecture, token lifecycle, session management.
