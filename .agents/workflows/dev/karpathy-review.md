---
description: Code review workflow applying Karpathy discipline principles. Checks for overengineering, scope creep, and untraceable changes.
---

# Workflow: karpathy-review
Schema: agentic-sdlc.workflow@v1

```json
{
  "name": "karpathy-review",
  "domain": "dev",
  "description": "Code review workflow applying Karpathy discipline principles. Checks for overengineering, scope creep, and untraceable changes.",
  "version": "1.0.0",
  "steps": ["scope_check", "simplicity_check", "surgical_check", "internet_security_check", "goal_check"],
  "failure_mode": "Continue",
  "max_retries": 0,
  "timeout_ms": 300000
}
```

## Step: scope_check
Skill: agent.karpathy_discipline
Role: reviewer

Check that every changed line traces directly to the original request.

Success criteria:
- No drive-by refactoring
- No formatting-only changes in unrelated files
- No "improvements" to adjacent code

Input: Review the current diff and verify that EVERY changed line traces directly to the original request. Flag any changes that appear unrelated, including:
- Formatting changes in untouched code
- Refactoring that wasn't requested
- "Improvements" to adjacent functions

## Step: simplicity_check
Skill: agent.karpathy_discipline
Role: reviewer

Check for overengineering and unnecessary complexity.

Success criteria:
- No unnecessary abstractions
- No speculative flexibility/configurability
- Code could not be meaningfully shorter while maintaining correctness

Input: Review the implementation for overengineering:
- Are there abstractions that serve only a single use case?
- Is there "flexibility" or "configurability" that wasn't requested?
- Could the code be 50% shorter while maintaining correctness?
- Would a senior engineer say this is overcomplicated?

## Step: surgical_check
Skill: agent.karpathy_discipline
Role: reviewer

Check that changes are minimal and match existing style.

Success criteria:
- Existing code style is preserved
- No pre-existing dead code was removed
- Only imports/variables made unused by THIS change are cleaned up

Input: Review the changes for surgical precision:
- Do the changes match the existing code style?
- Was any pre-existing dead code removed (it shouldn't be)?
- Are all cleanup changes (removed imports, variables) traced to THIS change?
- Were any comments or docstrings removed that shouldn't have been?

## Step: goal_check
Skill: agent.karpathy_discipline
Role: reviewer
DependsOn: scope_check, simplicity_check, surgical_check, internet_security_check

Verify that success criteria were defined and met.

Success criteria:
- Original task has clear success criteria
- Each criterion has been verified
- Tests cover the changes

Input: Final review — verify goal-driven execution:
- Were success criteria defined before implementation?
- Has each criterion been verified?
- Do tests cover the changes adequately?
- Can the implementation be considered complete?

## Step: internet_security_check
Skill: agent.karpathy_discipline
Role: reviewer
DependsOn: scope_check, simplicity_check, surgical_check

Review internet-capable execution paths and verify a security check has been performed.

Success criteria:
- Any network-capable skill usage is explicitly identified
- Security review notes are present
- No unsafe internet usage pattern is approved silently

Input: Security review gate:
- If any internet-capable skills are involved, list them explicitly
- Confirm security checks were performed and documented
- Flag any unsafe or unaudited internet usage
