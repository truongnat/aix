---
name: senior-architect
description: Comprehensive software architecture skill for designing scalable, maintainable systems using ReactJS, NextJS, NodeJS, Express, React Native, Swift, Kotlin, Flutter, Postgres, GraphQL, Go, Python. Includes architecture diagram generation, system design patterns, tech stack decision frameworks, and dependency analysis. Use when designing system architecture, making technical decisions, creating architecture diagrams, evaluating trade-offs, or defining integration patterns.
metadata:
  short-description: "Architecture — scalable system design, diagrams, tech stack decisions"
---

## Boundary

This skill provides comprehensive software architecture guidance for designing scalable, maintainable systems using ReactJS, NextJS, NodeJS, Express, React Native, Swift, Kotlin, Flutter, Postgres, GraphQL, Go, Python. It focuses on architecture diagram generation, system design patterns, tech stack decision frameworks, and dependency analysis. It does NOT cover implementation details (use framework-specific skills) or infrastructure deployment (use devops-specific skills).

## When to use

Use this skill when:
- Designing system architecture
- Making technical decisions
- Creating architecture diagrams
- Evaluating trade-offs
- Defining integration patterns
- Analyzing dependencies
- Selecting tech stacks

DO NOT use this skill for:
- Implementation details (use framework-specific skills: react-pro, nextjs-pro, nestjs-pro, etc.)
- Infrastructure deployment (use ci-cd-pro, docker-pro skills)
- Database schema design (use database-specific skills)
- API endpoint design (use api-design-pro skill)

## Workflow

1. **Understand requirements** (functional, non-functional, constraints)
2. **Select appropriate tools** (diagram generator, project architect, dependency analyzer)
3. **Design the architecture** (components, layers, patterns)
4. **Generate architecture diagrams** for visualization
5. **Evaluate trade-offs** (performance, scalability, maintainability)
6. **Document decisions** and rationale
7. **Review and iterate** with stakeholders

### Operating principles

- **Scalability First**: Design for horizontal scaling and growth
- **Separation of Concerns**: Clear boundaries between layers and components
- **SOLID Principles**: Apply SOLID principles to architecture design
- **Trade-off Analysis**: Explicitly evaluate and document trade-offs
- **Documentation**: Maintain up-to-date architecture diagrams
- **Dependency Management**: Minimize coupling, maximize cohesion
- **Technology Fit**: Choose technologies based on requirements, not trends
- **Evolutionary Architecture**: Design for change and evolution

## Suggested response format

```
Architecture Type: [monolith / microservices / serverless / hybrid]
Tech Stack: [languages, frameworks, databases]
Diagram: [architecture diagram or file path]
Status: [success/failed]
Details: [architecture decisions, trade-offs, patterns used]
Next steps: [follow-up actions if any]
```

## Resources in this skill

- **Architecture Diagram Generator**: Automated diagram creation
- **Project Architect**: Project structure and organization
- **Dependency Analyzer**: Dependency analysis and visualization
- **Design Patterns**: System design patterns and best practices
- **Tech Stack Decision Frameworks**: Frameworks for technology selection
- **Integration Patterns**: Integration patterns and approaches

## Quick example

**Design a microservices architecture:**

```
1. Analyze requirements and constraints
2. Define service boundaries
3. Select communication patterns (REST, GraphQL, gRPC)
4. Design data architecture (databases per service vs shared)
5. Generate architecture diagram
6. Document trade-offs and decisions
```

## Checklist before calling the skill done

- [ ] Requirements are clearly defined
- [ ] Non-functional requirements are identified (performance, scalability, availability)
- [ ] Constraints are understood (budget, timeline, team skills)
- [ ] Technology preferences are known
- [ ] Integration requirements are defined
- [ ] Deployment environment is understood
- [ ] Stakeholders are identified
- [ ] Documentation requirements are defined

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
