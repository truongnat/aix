---
name: senior-architect
description: Comprehensive software architecture skill for designing scalable, maintainable systems using modern tech stacks. Includes architecture diagram generation, system design patterns, tech stack decision frameworks, and dependency analysis.
metadata:
  short-description: Architecture — Scalable System Design, Diagrams, Tech Stack Decisions, Vibe Coding
  content-language: en
  domain: architecture
  level: professional
---

# Senior Architect

Expert-level guidance for designing robust, scalable, and evolutionary software systems.

## Boundary

This skill provides comprehensive software architecture guidance for designing systems across Web, Mobile, and Cloud. It focuses on architecture diagrams, system design patterns, tech stack decision frameworks, and dependency analysis. Implementation details are owned by framework-specific skills (e.g., `react-pro`, `nextjs-pro`).

## When to use

Use this skill when:
- Designing system architecture from scratch.
- Making high-level technical decisions and tech stack selections.
- Creating architecture diagrams (C4 model, Sequence, ERD).
- Evaluating trade-offs (CAP theorem, Scalability vs Latency).
- Defining integration patterns for microservices or modular monoliths.

## Workflow

1. **Requirement Analysis**: Gather functional and non-functional requirements (SLIs/SLOs).
2. **Context Mapping**: Define system boundaries and external dependencies.
3. **Pattern Selection**: Choose appropriate architecture patterns (Event-driven, Microservices, etc.).
4. **Tech Stack Decision**: Use decision frameworks (ADRs) to select technologies.
5. **Diagramming**: Generate visual representations of the system.
6. **Trade-off Evaluation**: Document the "Why" behind the "What".

### Operating principles

- **Scalability First**: Design for horizontal scaling and growth.
- **Separation of Concerns**: Clear boundaries between layers and components.
- **Evolutionary Architecture**: Design for change and incremental upgrades.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Software Architect.
</Role>

<Context>
[Requirement summary and architectural constraints]
</Context>

<Design>
- Pattern: [e.g. Event-driven]
- Stack: [e.g. Next.js 15, Go, Kafka, PostgreSQL]
- Diagram: [Mermaid diagram]
</Design>

<Rationale>
[Detailed architectural decisions and trade-offs]
</Rationale>

<Verification>
[Step-by-step verification plan for the architecture]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Software Architect Roadmap | [roadmap.sh/software-architect](https://roadmap.sh/software-architect) |
| System Design Primer | [github.com/donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) |
| Architecture Patterns | [references/architecture_patterns.md](file:///Users/truongdev/Documents/projects/labs/skills/references/architecture_patterns.md) |
| Tech Decision Guide | [references/tech_decision_guide.md](file:///Users/truongdev/Documents/projects/labs/skills/references/tech_decision_guide.md) |

## Quick example

**Design a microservices architecture for E-commerce:**
1. Define service boundaries (Orders, Catalog, Auth).
2. Select communication patterns (gRPC for internal, REST for external).
3. Design data architecture (Database per service).
4. Evaluate trade-offs (Consistency vs Availability).

## Checklist before calling the skill done
- [ ] **Think Before Coding**: Functional and non-functional requirements clearly defined.
- [ ] **Simplicity First**: Avoided over-engineering; chose the simplest architecture that scales.
- [ ] **Surgical Changes**: Architectural updates are modular and minimize blast radius.
- [ ] **Goal-Driven Execution**: Architecture validated against SLOs and business goals.
- [ ] System boundaries and interaction patterns documented.
- [ ] Tech stack decisions justified with ADRs.
- [ ] Diagrams generated for all major components.

---

# Senior Architect

Complete toolkit for senior architect with modern tools and best practices.

## Quick Start

### Main Capabilities

This skill provides three core capabilities through automated scripts:

```bash
# Script 1: Architecture Diagram Generator
python scripts/architecture_diagram_generator.py [options]

# Script 2: Project Architect
python scripts/project_architect.py [options]

# Script 3: Dependency Analyzer
python scripts/dependency_analyzer.py [options]
```

## Core Capabilities

### 1. Architecture Diagram Generator

Automated tool for architecture diagram generator tasks.

**Features:**
- Automated scaffolding
- Best practices built-in
- Configurable templates
- Quality checks

**Usage:**
```bash
python scripts/architecture_diagram_generator.py <project-path> [options]
```

### 2. Project Architect

Comprehensive analysis and optimization tool.

**Features:**
- Deep analysis
- Performance metrics
- Recommendations
- Automated fixes

**Usage:**
```bash
python scripts/project_architect.py <target-path> [--verbose]
```

### 3. Dependency Analyzer

Advanced tooling for specialized tasks.

**Features:**
- Expert-level automation
- Custom configurations
- Integration ready
- Production-grade output

**Usage:**
```bash
python scripts/dependency_analyzer.py [arguments] [options]
```

## Reference Documentation

### Architecture Patterns

Comprehensive guide available in `references/architecture_patterns.md`:

- Detailed patterns and practices
- Code examples
- Best practices
- Anti-patterns to avoid
- Real-world scenarios

### System Design Workflows

Complete workflow documentation in `references/system_design_workflows.md`:

- Step-by-step processes
- Optimization strategies
- Tool integrations
- Performance tuning
- Troubleshooting guide

### Tech Decision Guide

Technical reference guide in `references/tech_decision_guide.md`:

- Technology stack details
- Configuration examples
- Integration patterns
- Security considerations
- Scalability guidelines

## Tech Stack

**Languages:** TypeScript, JavaScript, Python, Go, Swift, Kotlin
**Frontend:** React, Next.js, React Native, Flutter
**Backend:** Node.js, Express, GraphQL, REST APIs
**Database:** PostgreSQL, Prisma, NeonDB, Supabase
**DevOps:** Docker, Kubernetes, Terraform, GitHub Actions, CircleCI
**Cloud:** AWS, GCP, Azure

## Development Workflow

### 1. Setup and Configuration

```bash
# Install dependencies
npm install
# or
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

### 2. Run Quality Checks

```bash
# Use the analyzer script
python scripts/project_architect.py .

# Review recommendations
# Apply fixes
```

### 3. Implement Best Practices

Follow the patterns and practices documented in:
- `references/architecture_patterns.md`
- `references/system_design_workflows.md`
- `references/tech_decision_guide.md`

## Best Practices Summary

### Code Quality
- Follow established patterns
- Write comprehensive tests
- Document decisions
- Review regularly

### Performance
- Measure before optimizing
- Use appropriate caching
- Optimize critical paths
- Monitor in production

### Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Keep dependencies updated

### Maintainability
- Write clear code
- Use consistent naming
- Add helpful comments
- Keep it simple

## Common Commands

```bash
# Development
npm run dev
npm run build
npm run test
npm run lint

# Analysis
python scripts/project_architect.py .
python scripts/dependency_analyzer.py --analyze

# Deployment
docker build -t app:latest .
docker-compose up -d
kubectl apply -f k8s/
```

## Troubleshooting

### Common Issues

Check the comprehensive troubleshooting section in `references/tech_decision_guide.md`.

### Getting Help

- Review reference documentation
- Check script output messages
- Consult tech stack documentation
- Review error logs

## Resources

- Pattern Reference: `references/architecture_patterns.md`
- Workflow Guide: `references/system_design_workflows.md`
- Technical Guide: `references/tech_decision_guide.md`
- Tool Scripts: `scripts/` directory
