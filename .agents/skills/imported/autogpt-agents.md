# Skill: autogpt-agents
Schema: antigrav.skill@v1

```json
{
  "description": "Autonomous AI agent platform for building and deploying continuous agents. Use when creating visual workflow agents, deploying persistent autonomous agents, or building complex multi-step AI automatio",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155441,
  "model": "qwen3:8b",
  "name": "autogpt-agents",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "14-agents/autogpt/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "agents",
    "ai platform",
    "ai-research",
    "autogpt",
    "autonomous agents",
    "visual builder",
    "workflow automation"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Autonomous AI agent platform for building and deploying continuous agents. Use when creating visual workflow agents, deploying persistent autonomous agents, or building complex multi-step AI automation systems.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Clone repository
git clone https://github.com/Significant-Gravitas/AutoGPT.git
cd AutoGPT/autogpt_platform

# Copy environment file
cp .env.example .env

# Start backend services
docker compose up -d --build

# Start frontend (in separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
- Graph (Agent)
  ├── Node (Input)
  │   └── Block (AgentInputBlock)
  ├── Node (Process)
  │   └── Block (LLMBlock)
  ├── Node (Decision)
  │   └── Block (SmartDecisionMaker)
  └── Node (Output)
      └── Block (AgentOutputBlock)
- User/Trigger → Graph Execution → Node Execution → Block.execute()
     ↓              ↓                 ↓
  Inputs      Queue System      Output Yields

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `14-agents/autogpt/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# AutoGPT - Autonomous AI Agent Platform Comprehensive platform for building, deploying, and managing continuous AI agents through a visual interface or development toolkit. ## When to use AutoGPT **Use AutoGPT when:** - Building autonomous agents that run continuously - Creating visual workflow-based AI agents - Deploying agents with external triggers (webhooks, schedules) - Building complex multi-step automation pipelines - Need a no-code/low-code agent builder **Key features:** - **Visual Agent Builder**: Drag-and-drop node-based workflow editor - **Continuous Execution**: Agents run persistently with triggers - **Marketplace**: Pre-built agents and blocks to share/reuse - **Block System**: Modular components for LLM, tools, integrations - **Forge Toolkit**: Developer tools for custom a

{{input}}
