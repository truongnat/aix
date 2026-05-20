---
description: Disciplined feature development workflow enforcing Karpathy principles (Think, Plan, Implement, Test, Review).
---

# Workflow: karpathy-feature
Schema: agentic-sdlc.workflow@v1

```json
{
  "name": "karpathy-feature",
  "domain": "dev",
  "description": "Feature development workflow with Karpathy coding discipline gates. Enforces Think → Plan → Implement → Test → Review cycle.",
  "version": "1.0.0",
  "steps": ["think", "plan", "security_check", "implement", "test", "review", "workflow_report", "report_quality_gate"],
  "failure_mode": "FailFast",
  "max_retries": 1,
  "timeout_ms": 600000
}
```

## Step: think
Skill: agent.karpathy_discipline
Role: architect

Surface assumptions, identify ambiguity, and ask clarifying questions before any implementation.

Success criteria:
- All assumptions are explicitly stated
- Ambiguous requirements have been flagged
- A simpler alternative has been considered (if applicable)
- No code has been written yet

Input: Analyze the following task and surface all assumptions, ambiguities, and tradeoffs. Do NOT start coding. Only produce a structured analysis.

Task: {{task}}

## Step: plan
Skill: agent.analyze_code
Role: architect
DependsOn: think

Create a minimal implementation plan with verifiable success criteria for each step.

Success criteria:
- Plan has ≤ 5 steps (simplicity check)
- Each step has a verification check
- No speculative features included
- Scope is minimal and directly traceable to the request

Input: Based on the analysis from the think step, create a step-by-step implementation plan. Each step must have a verification check. Keep the plan minimal — no speculative features.

## Step: security_check
Skill: agent.llm_subagent
Role: security-reviewer
DependsOn: plan

Review the implementation plan for security risks, specifically focusing on internet-capable skills if any.

Success criteria:
- No unauthorized network patterns identified
- Domain security policies are respected
- Data exfiltration risks are mitigated

Input: Review the implementation plan for security risks. If the plan involves network or filesystem access, ensure it follows project security policies.

## Step: implement
Skill: agent.llm_subagent
Role: implementer
DependsOn: security_check

Execute the plan with surgical precision. Touch only files directly required by the plan.

Success criteria:
- Only files listed in the plan are modified
- Changes are minimal and match existing code style
- No drive-by refactoring or formatting changes
- All new code has a direct trace to the requirement

Input: Implement the plan from the previous step. Follow these constraints strictly:
- Touch ONLY the files identified in the plan
- Match existing code style exactly
- Do NOT refactor adjacent code
- Do NOT add features not in the plan

## Step: test
Skill: agent.llm_subagent
Role: tester
DependsOn: implement

Verify the implementation meets success criteria.

Success criteria:
- All existing tests still pass
- New tests cover the changes
- Success criteria from the plan are met

Input: Verify the implementation by:
1. Running existing tests to confirm no regressions
2. Writing tests for the new changes
3. Checking each success criterion from the plan

## Step: review
Skill: agent.karpathy_discipline
Role: reviewer
DependsOn: test

Final quality gate — check discipline compliance.

Success criteria:
- Every changed line traces to the original request
- No unnecessary complexity introduced
- No scope creep beyond the original task
- Diff is minimal and clean

Input: Review the implementation against Karpathy discipline principles:
1. Were assumptions surfaced before coding?
2. Is the code minimal — could it be simpler?
3. Are changes surgical — only touching what's necessary?
4. Are success criteria met and verified?

## Step: workflow_report
Skill: agent.llm_subagent
Role: architect
DependsOn: review

Synthesize the execution trace into a final report.

Success criteria:
- Report contains a summary of changes
- All success criteria are mapped to evidence
- Discipline compliance is documented

Input: Synthesize the execution trace into a final workflow report. You MUST return a strict JSON object — no markdown, no prose, just JSON.

Required output schema:
```json
{
  "summary": "<string, min 80 chars: state what was done, what passed, and the final outcome>",
  "actions": [
    "<action 1: concrete next step or follow-up task, min 12 chars>",
    "<action 2: another concrete next step, min 12 chars>"
  ],
  "risks": [
    "<risk 1: any residual risk, open question, or known limitation>"
  ]
}
```

Rules:
- `summary` must be at least 80 characters describing the implementation and outcomes
- `actions` must contain at least 2 specific, actionable follow-up items
- `risks` must contain at least 1 residual risk or known limitation
- Do NOT wrap the JSON in markdown code fences
- Do NOT add any text outside the JSON object

## Step: report_quality_gate
Skill: agent.report_quality_gate
Role: reviewer
DependsOn: workflow_report

Verify the final report is detailed and accurate.

Success criteria:
- Report is not sparse
- Evidence is clearly linked to changes
- Final outcome is unambiguous

Input: {{workflow_report}}
