# Orchestration Patterns

## Gateway

- One coordinator agent receives user requests.
- Gateway delegates to specialist agents via A2A.
- Specialists use MCP for their own tool access.
- **Best for**: Most multi-agent systems. Simplest to reason about and debug.

## Pipeline

- Agents chained in sequence: Input → Agent 1 → Agent 2 → Agent 3 → Output.
- Each agent processes and passes results forward.
- **Best for**: Document workflows, data processing, compliance checks.
- Parallel stages where safe.

## Mesh

- Agents communicate peer-to-peer based on dynamic needs.
- Task auction or bidding for work assignment.
- **Best for**: Complex research, autonomous systems, unpredictable work distribution.
- **Warning**: Hardest to debug and scale. Use only when Gateway/Pipeline are insufficient.

## Hybrid

- Gateway for user-facing requests.
- Pipeline for internal processing stages.
- Mesh for autonomous sub-tasks.
- **Best for**: Large systems with mixed predictability.
