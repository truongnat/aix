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

2. **Preprocess attached files or local paths**
   - If file-processing intent is ambiguous, clarify the goal and file scope before starting
   - If the request includes files, read text/code directly and optionally convert document formats with MarkItDown before optimizing
   - MarkItDown is optional but recommended for PDF/Office extraction; use the bundled `node .agents/devkit/dist/tools.js analyze-doc <file...>` or `npx @david-choi/devkit analyze-doc <file...>`
   - If MarkItDown is missing, notify the user and ask before installing it
   - Capture provenance: filename, extraction method, relevant section/page/sheet, and uncertainty
   - Keep only the minimum extracted context needed for routing and execution

3. **Research and optimize the prompt**
   - Gather relevant context from project and environment
   - Clarify ambiguous terms by inferring from context
   - Add constraints and requirements based on best practices
   - Make the prompt clean, specific, and actionable
   - Specify expected output format and structure

4. **Discover relevant skills, workflows, or templates**
   - **Skills**: Automatically discover from `skills/` or `skill_index.json` by matching triggers and descriptions
   - **Workflows**: Match procedure to structured workflow(s)
   - **Templates**: Match output format to appropriate template(s)
   - Prioritize workflows over individual skills for structured processes
   - Consider dependencies between skills/workflows/templates
   - Check for conflicts or overlaps

5. **Coordinate execution**
   - Sequence skills/workflows/templates based on dependencies
   - Define handoff points between skills/workflows/templates
   - Specify clear execution order
   - Handle edge cases

## Output format

**Internal analysis (do not output to user):**
1. Analyze the request - extract domain, action, constraints, output format
2. Preprocess attached/local files when present - extract minimum grounded context before optimization
3. Research and optimize the prompt - add context, clarify ambiguities, make actionable
4. Discover relevant skills/workflows/templates - match triggers, descriptions, procedures
5. Coordinate execution - sequence based on dependencies, define handoffs

**Output to user (concise):**
- Brief summary of what will be done (1 sentence)
- Primary skill(s)/workflow(s) being used
- Execute immediately without showing intermediate analysis

**Example output:**
"Analyzing request... Using auth-pro for authentication and react-pro for React integration. Starting implementation now."

## Example

**Input**: "I need to add login to my React app"

**Internal analysis** (hidden):
- Domain: React web application
- Action: Implement authentication/login
- Context: Existing React app (assumed SPA)
- Optimized prompt: "Implement OAuth 2.0 Authorization Code Flow with PKCE..."
- Skills: auth-pro (primary), react-pro (secondary), security-pro (optional)
- Execution: auth-pro → react-pro → security-pro

**Output to user**:
"Analyzing request... Using auth-pro for authentication and react-pro for React integration. Starting implementation now."

## Skill reference

This workflow uses the **router-pro** system skill. See `skills/router-pro/SKILL.md` for detailed documentation.
