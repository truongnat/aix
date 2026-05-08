<div align="center">
  <h1>🚀 Skills Devkit</h1>
  <p><strong>Production-grade AI Agent Skills, Workflows & Knowledge Base</strong></p>
  
  [![npm version](https://img.shields.io/npm/v/@truongnat/devkit.svg)](https://npmjs.org/package/@truongnat/devkit)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![CI](https://github.com/truongnat/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/truongnat/skills/actions)
  [![Skills: 101](https://img.shields.io/badge/Skills-101-blue.svg)](#)
  [![Workflows: 20](https://img.shields.io/badge/Workflows-20-purple.svg)](#)

  <p>Turn your Claude, Cursor, and Codex into a 10x engineering team with curated, battle-tested agent capabilities.</p>
</div>

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎯 **101+ Skills** | Curated system prompts and tools for Fullstack, DevOps, Data, and more. |
| 🔄 **20+ Workflows** | End-to-end SDLC workflows (Ticket -> Plan -> Code -> PR -> Release). |
| 🧠 **Knowledge Base**| Native RAG capabilities to index and query your entire codebase. |
| 🛡️ **Strict Rules** | Built on Andrej Karpathy's coding principles to prevent AI hallucinations and "slop". |
| 🔌 **Extensible** | Easy to add custom skills or sync directly into your repo's `.agents/` folder. |
| 🛠️ **CLI Tools** | Built-in CLI for skill validation, KB indexing, and gap analysis. |

## 🚀 Quick Start

Initialize the Skills Devkit in any project folder:

```bash
npx @truongnat/devkit@latest
```

*This will automatically sync the devkit bundle (skills, workflows, rules, commands) to your local project.*

### 🤖 Claude Project Integration

For the best experience with Claude, follow our [Claude Project Guide](CLAUDE.md) to set up:
- **Custom Instructions**: Configure Claude as a Senior Fullstack Engineer.
- **Prompt Templates**: Use battle-tested [Fullstack Prompts](prompts/fullstack-pro.md).
- **Project Context**: Optimized file uploading and context management.

## 📚 What's Included?

### 🎯 Agent Skills (101+)
Domain-specific capabilities for specialized tasks:

- **Frontend & UI**: `nextjs-pro`, `react-pro`, `shadcn-mastery-pro`, `ui-design-brain-pro`, `motion-design-pro`
- **Backend & Cloud**: `nestjs-pro`, `prisma-postgres`, `microservices-pro`, `docker-pro`, `ci-cd-pro`
- **Architecture**: `clean-code-architecture-pro`, `system-design`, `senior-architect`
- **Planning & Execution**: `writing-plans-pro`, `executing-plans-pro`, `parallel-agents-pro`
- **Quality & Security**: `systematic-debugging-pro`, `security-review`, `agent-evaluation-pro`

### 🔄 Agent Workflows (20+)
Structured, multi-step procedures (Use them via Slash commands):

- `/ticket` — Kanban-style feature implementation
- `/release` — Release management and changelog generation
- `/code-review` — Deep, architectural code review
- `/debug` — Systematic root-cause analysis
- `/incident` — Live incident response protocol
- `/index-project` — Full project RAG indexing and wiki generation

### 🧠 Knowledge Base & Project Indexing
Empower your agents with complete context:

```bash
# Index your entire project into a vector database
npx @truongnat/devkit index-project --dir . --out .project-index

# Generate a project Wiki based on the codebase
npx @truongnat/devkit generate-wiki --docs .project-index/docs

# Query the knowledge base
npx @truongnat/devkit query-kb "How does the auth module work?"
```

## 🧠 Karpathy Coding Principles

We strictly enforce 4 non-negotiable principles for all agent operations:
1. **Think Before Coding**: No assumptions, no guessing.
2. **Simplicity First**: Write 50 lines if 200 lines aren't needed.
3. **Surgical Changes**: Touch only what is necessary.
4. **Goal-Driven Execution**: Define success criteria before writing a single line.

Read more about our [Skill Authoring Rules](skills/SKILL_AUTHORING_RULES.md).

## 🛠️ CLI Reference

The devkit includes powerful CLI tools for managing your agent environment:

```bash
npx @truongnat/devkit validate-skills   # Validate skill frontmatter & schemas
npx @truongnat/devkit analyze-skills    # Run quality analysis on all skills
npx @truongnat/devkit build-kb          # Build vector embeddings for the KB
npx @truongnat/devkit sync-catalogs     # Sync updates across skill catalogs
```

## 🤝 Contributing
Want to add a new skill? See our [Agent Integration Guide](AGENTS.md) and [Skill Authoring Rules](skills/SKILL_AUTHORING_RULES.md).

## 📄 License
[MIT License](LICENSE) © 2026 Truong Nguyen
