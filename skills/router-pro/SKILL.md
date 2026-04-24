---
name: router-pro
description: |
  System skill for automatic request analysis, prompt optimization, and intelligent routing to skills, workflows, or templates. Instead of calling skills individually, this skill analyzes user input, researches and improves the prompt for clarity and accuracy, identifies relevant skills, workflows, or templates, and coordinates execution.

  Use this skill when the user provides a general request that needs automatic decomposition, when the prompt needs optimization for better AI understanding, when appropriate skills or workflows need to be identified and executed, or when a template is needed for reports, issues, or other structured outputs.

  This is a **system skill** - it does not perform domain-specific work but routes to and coordinates **working skills** (auth-pro, react-pro, docker-pro, etc.), **workflows** (/ticket, /debug, /release, etc.), and **templates** (reports, issues, prompts, etc.).

  Triggers: "route", "analyze", "plan", "break down", "how should I", "what skills", "optimize prompt", "orchestrate", "help me with", "template", "report format", "issue template".

metadata:
  short-description: Router — auto analysis, prompt optimization, skill/workflow/template discovery, execution
  content-language: en
  domain: system
  level: foundation
---

# Router (system skill)

Skill text is **English**; answer in the user’s preferred language when Cursor User Rules, project rules, or the conversation specify it.

This skill automatically analyzes user requests, researches and improves prompts for clarity and accuracy, identifies relevant skills, workflows, or templates, and coordinates execution. It serves as an intelligent middle layer between user input and domain-specific execution.

## Boundary

**`router-pro`** owns automatic request analysis, prompt research and optimization, skill/workflow/template discovery, and execution coordination. It does **not** own domain-specific implementation - those are delegated to:

- **Working skills** - Discovered dynamically from `skills/` directory or `skill_index.json` based on triggers and descriptions
- **Workflows** - Structured procedures in `workflows/` directory
- **Templates** - Static resources in `templates/` directory (reports, issues, prompts, scaffolds)

### Dynamic skill discovery

Skills are discovered automatically by:
1. Reading `skills/` directory or `knowledge-base/embeddings/skill_index.json`
2. Matching user input to skill triggers and descriptions
3. Ranking skills by relevance (trigger matches, description keywords, domain alignment)

No hardcoding required - the system automatically discovers all available skills.

## When to use

- User provides a general request that needs automatic analysis and routing
- Prompt needs research and optimization for clarity and accuracy
- Appropriate skills, workflows, or templates need to be identified automatically
- User asks "how should I approach X" or "help me with Y"
- Request needs decomposition into actionable steps
- Multiple skills, workflows, or templates might be needed for a complex task
- User needs a report format, issue template, or other structured output
- User asks for "template", "report format", "issue template"

## When not to use

- User request is clearly domain-specific and can directly use a working skill
- User explicitly names a specific skill (e.g., "use auth-pro")
- Simple, single-skill tasks that don't need orchestration
- When the working skill can handle the request directly

## Required inputs

- **User query**: The original user request or description
- **Context**: Project context (tech stack, constraints, goals)
- **Current state**: What's already been done or implemented

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

1. **Analyze** the user input to understand intent, scope, and complexity
2. **Research and optimize** the prompt for clarity, accuracy, and completeness
3. **Discover** relevant skills, workflows, or templates that can address the request
4. **Coordinate** execution by specifying skills/workflows/templates to use and execution order

### Operating principles

1. **Analyze automatically** - Parse user input without requiring clarification
2. **Research context** - Gather relevant information to improve prompt accuracy
3. **Optimize for clarity** - Refine prompts to be specific, clean, and easy to understand
4. **Discover intelligently** - Match to most relevant skills, workflows, or templates
5. **Prioritize workflows** - When a structured workflow exists, prefer it over ad-hoc skill calls
6. **Match templates** - When a structured output format is needed, find appropriate template
7. **Coordinate execution** - Specify clear execution order and handoff points
8. **Preserve context** - Maintain project context across skill/workflow/template calls

## Prompt research and optimization strategy

When analyzing user input:

1. **Extract key information**:
   - Domain/technology (e.g., "React", "authentication", "Docker", "CI/CD")
   - Action/operation (e.g., "implement", "debug", "optimize", "review")
   - Constraints (e.g., "performance", "security", "existing codebase")
   - Output format (e.g., "code", "architecture", "steps", "report")

2. **Research and refine**:
   - Add specific context about the project and environment
   - Clarify ambiguous terms by inferring from context
   - Add constraints and requirements based on best practices
   - Specify expected output format and structure
   - Include relevant technical details and standards
   - Make the prompt clean, specific, and actionable

3. **Skill/workflow/template discovery**:
   - **Skills**: Automatically discover from `skills/` or `skill_index.json` by matching triggers and descriptions
   - **Workflows**: Match procedure to workflow (debug → /debug, ticket → /ticket)
   - **Templates**: Match output format to template (report → report templates, issue → issue templates)
   - Prioritize workflows over individual skills for structured processes
   - Consider dependencies (check skill metadata for dependencies)
   - Check for skill/workflow/template conflicts or overlaps

## Skill, workflow, and template discovery

### Dynamic skill discovery

Skills are discovered automatically from the skills repository:

**Discovery mechanism:**
1. Read `skills/` directory or `knowledge-base/embeddings/skill_index.json`
2. For each skill, extract triggers, description, domain, level from SKILL.md frontmatter
3. Match user input against triggers (keyword matching)
4. Match user input against description (semantic similarity)
5. Rank skills by relevance score

**Matching criteria:**
- **Trigger matches**: High priority - direct keyword matches
- **Description keywords**: Medium priority - domain/technology terms
- **Domain alignment**: Low priority - skill domain matches request domain
- **Level appropriateness**: Consider skill level (foundation/professional/advanced)

**Example:**
- Input: "OAuth implementation" → Matches auth-pro (trigger: "OAuth")
- Input: "React hooks" → Matches react-pro (trigger: "hooks")
- Input: "database performance" → Matches postgresql-pro (domain: database, description: performance)

### Workflows by procedure

| Procedure | Workflow |
|-----------|----------|
| Ticket management | /ticket |
| Release process | /release |
| Urgent fix | /hotfix |
| Code review | /code-review |
| Debugging | /debug |
| Security audit | /security-audit |
| Architecture review | /arch-review |
| Performance investigation | /perf-investigation |
| Refactoring | /refactor |
| Incident response | /incident |
| Data migration | /data-migration |
| Onboarding | /onboarding |
| API design | /api-design |
| Test strategy | /test-strategy |
| Dependency audit | /dep-audit |
| Project indexing | /index-project |

### Templates by output type

| Output Type | Template |
|-------------|----------|
| Code review report | report/code-review.md |
| Security audit report | report/security-audit.md |
| Performance report | report/performance-report.md |
| Incident report | report/incident-report.md |
| Test strategy report | report/test-strategy.md |
| Dependency audit report | report/dependency-audit.md |
| Debug/RCA report | report/debug-report.md |
| Project index report | report/project-index-report.md |
| Architecture Decision Record | report/architecture-decision-record.md |
| Bug report | issue/bug-report.md |
| Feature request | issue/feature-request.md |
| Knowledge base document | kb-document/knowledge-doc.md |
| Prompt template | prompt/prompt-template.md |
| Workflow scaffold | workflow/w-template.md |
| Skill scaffold | skill/ (skill-template) |

## Workflow orchestration

When multiple skills or workflows are needed:

1. **Sequence** based on dependencies and logical flow
2. **Define handoff points** - what each skill/workflow produces
3. **Specify context sharing** - what information passes between skills/workflows
4. **Set execution order** - which skill/workflow runs first
5. **Handle edge cases** - what if a skill/workflow fails or returns partial results
6. **Prefer workflows** - Use structured workflows when available instead of ad-hoc skill chaining

## Suggested response format (STRICT)

**Internal analysis (do not output):**
1. Analyze the user input to understand intent, scope, and complexity
2. Research and optimize the prompt for clarity, accuracy, and completeness
3. Discover relevant skills, workflows, or templates
4. Define execution plan with skill/workflow execution order
5. Identify context requirements and potential issues

**Output to user (concise):**
- Brief summary of what will be done
- Primary skill(s)/workflow(s) being used
- Execute immediately without showing intermediate analysis

**Example output:**
"Analyzing request... Using nestjs-pro for backend guard patterns and nextjs-pro for frontend error handling. Starting code review now."

## Quick example

**User input**: "I need to add login to my React app"

**Internal analysis** (hidden):
- Domain: React web application
- Action: Implement authentication/login
- Context: Existing React app (assumed SPA)
- Optimized prompt: "Implement OAuth 2.0 Authorization Code Flow with PKCE for a React Single Page Application..."
- Skills: auth-pro (primary), react-pro (secondary), security-pro (optional)
- Execution: auth-pro → react-pro → security-pro

**Output to user**:
"Analyzing request... Using auth-pro for authentication implementation and react-pro for React-specific patterns. Starting implementation now."

## Checklist before calling the skill done

- [ ] User query fully analyzed and understood
- [ ] Prompt optimized with context and constraints
- [ ] Relevant working skills identified with rationale
- [ ] Execution plan defined with skill order
- [ ] Context requirements specified
- [ ] Potential issues or risks noted
