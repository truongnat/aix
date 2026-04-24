---
description: Auto-analyze request, research/optimize prompt, discover skills/workflows/templates, coordinate execution
targets: [cursor, claude]
---

# /route - Automatic request routing and orchestration

Automatically analyze a user request, research and optimize the prompt for clarity and accuracy, discover relevant skills, workflows, or templates, and coordinate execution. This serves as an intelligent middle layer between user input and domain-specific execution.

## When to use

- User provides a general request that needs automatic analysis and routing
- Prompt needs research and optimization for better AI understanding
- Appropriate skills, workflows, or templates need to be identified automatically
- User asks "how should I approach X" or "help me with Y"
- Request needs decomposition into actionable steps
- User needs a report format, issue template, or other structured output
- User asks for "template", "report format", "issue template"

## Workflow

1. **Analyze the request**
   - Extract key information: domain, action, constraints, output format
   - Identify intent and scope without requiring clarification
   - Determine complexity and whether multiple skills/workflows/templates are needed

2. **Research and optimize the prompt**
   - Gather relevant context from project and environment
   - Clarify ambiguous terms by inferring from context
   - Add constraints and requirements based on best practices
   - Make the prompt clean, specific, and actionable
   - Specify expected output format and structure

3. **Discover relevant skills, workflows, or templates**
   - **Skills**: Automatically discover from `skills/` or `skill_index.json` by matching triggers and descriptions
   - **Workflows**: Match procedure to structured workflow(s)
   - **Templates**: Match output format to appropriate template(s)
   - Prioritize workflows over individual skills for structured processes
   - Consider dependencies between skills/workflows/templates
   - Check for conflicts or overlaps

4. **Coordinate execution**
   - Sequence skills/workflows/templates based on dependencies
   - Define handoff points between skills/workflows/templates
   - Specify clear execution order
   - Handle edge cases

## Output format

Provide a structured response with:

1. **Analyzed request** - What was understood from the original input
2. **Optimized prompt** - Refined, clean prompt for AI execution
3. **Skills/workflows/templates identified** - Which skills, workflows, or templates to use and why
4. **Execution plan** - Step-by-step workflow with clear next steps
5. **Context requirements** - What context is needed
6. **Potential issues** - Known risks or edge cases

## Example

**Input**: "I need to add login to my React app"

**Output**:
```
### Analyzed request
- Domain: React web application
- Action: Implement authentication/login
- Context: Existing React app (assumed SPA)

### Optimized prompt
"Implement OAuth 2.0 Authorization Code Flow with PKCE for a React Single Page Application. The application uses React and needs secure authentication with login/logout functionality. Focus on: (1) secure token storage avoiding localStorage, (2) proper OAuth flow with PKCE, (3) login/logout UI components, (4) integration with a standard OAuth provider (e.g., Auth0, Google), (5) session management and token refresh. Provide code examples with proper error handling."

### Skills/workflows/templates identified
- Primary: auth-pro (authentication implementation) - matched via trigger "authentication"
- Secondary: react-pro (React-specific patterns) - matched via trigger "React"
- Optional: security-pro (security review) - dependency of auth-pro
- Template: report/architecture-decision-record.md (if ADR needed)

### Execution plan
1. Execute auth-pro with the optimized prompt
2. Execute react-pro for React-specific integration patterns
3. Optionally execute security-pro for security review
4. Use architecture-decision-record template if documenting the decision

### Discovery method
- Skills discovered via automatic trigger/description matching from skills/
- Workflows matched by procedure name
- Templates matched by output type

### Context requirements
- React version and setup
- Existing authentication infrastructure (if any)
- OAuth provider preferences
- Security requirements

### Potential issues
- Token storage in SPA environment
- CSRF protection
- Session management
```

## Skill reference

This workflow uses the **router-pro** system skill. See `skills/router-pro/SKILL.md` for detailed documentation.
