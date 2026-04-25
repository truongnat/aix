# Anti-Patterns in Writing Plans

## Overview

These are common anti-patterns to avoid when writing detailed implementation plans. Recognizing them helps prevent planning failures.

## Primary Anti-Patterns

### 1. Waterfall Planning

**Pattern:** Detailed planning for entire project upfront in extreme detail.

**Symptoms:**
- Planning takes weeks or months
- Every detail specified before execution
- No flexibility for changes
- Plans become obsolete quickly

**Causes:**
- Belief that detailed planning reduces risk
- Organizational requirements
- Not accepting uncertainty
- Desire for control

**Mitigation:**
- Plan just-in-time
- Maintain flexibility
- Plan in waves (near-term detailed, long-term high-level)
- Accept and plan for change

**Recovery:**
- Abandon detailed long-term plan
- Focus on near-term detailed planning
- Maintain high-level long-term view
- Replan as needed

### 2. Over-Granularity

**Pattern:** Breaking down into too many small tasks.

**Symptoms:**
- Tasks take less than 2 hours
- Tracking overhead exceeds task time
- Loss of context between related tasks
- Administrative burden

**Causes:**
- Belief that more detail is better
- Waterfall planning mindset
- Not considering tracking cost
- Breaking down for breaking down's sake

**Mitigation:**
- Target 1-3 day tasks
- Only subtask when genuinely complex
- Consider tracking overhead
- Maintain meaningful task boundaries

**Recovery:**
- Combine related small tasks
- Remove administrative overhead
- Focus on meaningful deliverables
- Simplify task list

### 3. Vague Tasks

**Pattern:** Tasks with unclear scope or completion criteria.

**Symptoms:**
- Tasks like "investigate", "research", "design"
- No clear deliverable
- Unclear when task is "done"
- Different interpretations by different people

**Causes:**
- Insufficient decomposition
- Unclear requirements
- Lazy planning
- Avoiding difficult breakdown work

**Mitigation:**
- Every task must have clear deliverable
- Define verifiable completion criteria
- Use action-oriented language
- Break down vague tasks into specific actions

**Recovery:**
- Stop with vague task list
- Clarify what each task must deliver
- Rewrite tasks with specific outcomes
- Add completion criteria to each task

### 4. Missing Dependencies

**Pattern:** Dependencies not identified or documented.

**Symptoms:**
- Tasks block unexpectedly during execution
- Discover dependencies when starting work
- Upstream tasks not prioritized
- Delays from unanticipated blocking

**Causes:**
- Insufficient dependency analysis
- Assuming independence
- Not consulting technical team
- Rushing through planning

**Mitigation:**
- Systematic dependency mapping
- Validate dependencies with implementers
- Document both hard and soft dependencies
- Consider dependency chains, not just immediate

**Recovery:**
- Pause execution
- Map missing dependencies
- Reorder tasks based on dependencies
- Update plan with accurate dependencies

### 5. Unrealistic Estimates

**Pattern:** Estimates that are too optimistic or not grounded.

**Symptoms:**
- Tasks consistently overrun estimates
- No buffers for uncertainty
- Single-point estimates instead of ranges
- Estimates not based on actual complexity

**Causes:**
- Optimism bias
- Pressure to deliver quickly
- Not considering complexity factors
- Not accounting for unknowns

**Mitigation:**
- Use range-based estimates (min, likely, max)
- Document assumptions behind estimates
- Add buffers for uncertainty
- Use historical data when available

**Recovery:**
- Re-estimate with realistic ranges
- Document why estimates were wrong
- Add buffers for remaining work
- Communicate revised timeline

### 6. Incomplete Acceptance Criteria

**Pattern:** Tasks without clear verification conditions.

**Symptoms:**
- Unclear when task is complete
- Disagreements about completion
- Quality issues discovered late
- Rework required

**Causes:**
- Not defining success upfront
- Assuming shared understanding
- Rushing through planning
- Not considering edge cases

**Mitigation:**
- Define acceptance criteria for every task
- Make criteria verifiable and specific
- Consider edge cases and error conditions
- Get agreement on criteria before execution

**Recovery:**
- Define acceptance criteria retroactively
- Get agreement on criteria
- Verify work meets criteria
- Add criteria to future tasks

### 7. Ignoring Uncertainty

**Pattern:** Planning as if everything is known.

**Symptoms:**
- No buffers for unknowns
- Single-point estimates
- No risk identification
- Assumptions not documented

**Causes:**
- Overconfidence
- Pressure to provide certainty
- Not acknowledging complexity
- Fear of admitting uncertainty

**Mitigation:**
- Explicitly identify unknowns
- Add buffers for uncertainty
- Document assumptions
- Plan for contingencies

**Recovery:**
- Identify and document unknowns
- Add buffers where uncertainty exists
- Create contingency plans
- Communicate uncertainty to stakeholders

### 8. Mixed Abstraction Levels

**Pattern:** Task list mixes high-level and low-level items.

**Symptoms:**
- Some tasks are features, others are subtasks
- Inconsistent granularity
- Confusing to execute
- Hard to track progress

**Causes:**
- Not maintaining consistent level
- Breaking down unevenly
- Multiple people contributing without coordination
- Not reviewing task list

**Mitigation:**
- Maintain consistent abstraction level
- Review task list for consistency
- Choose appropriate level for project
- Subtask only when genuinely needed

**Recovery:**
- Review and restructure task list
- Choose target abstraction level
- Break down or combine tasks to match
- Ensure consistency across list

## Detection Signals

### Early Warning Signs

- Tasks with verbs like "investigate", "research"
- No completion criteria defined
- Single-point estimates
- Tasks taking less than 2 hours
- Planning taking excessive time

### Mid-Planning Checkpoints

- Are all tasks verifiable?
- Are dependencies mapped?
- Are estimates ranges with assumptions?
- Is granularity consistent?
- Is uncertainty acknowledged?

### Plan Quality Metrics

- **Task clarity:** % of tasks with clear deliverables
- **Dependency coverage:** % of dependencies identified
- **Estimation realism:** % of estimates within range
- **Acceptance criteria coverage:** % of tasks with criteria

## Prevention Checklist

### Before Planning

- [ ] Requirements clear and validated
- [ ] Team capacity understood
- [ ] Technical context known
- [ ] Planning approach agreed

### During Planning

- [ ] Tasks have clear deliverables
- [ ] Tasks appropriately sized
- [ ] Dependencies mapped
- [ ] Acceptance criteria defined

### During Review

- [ ] Task granularity consistent
- [ ] Estimates realistic with ranges
- [ ] Risks and unknowns identified
- [ ] Plan flexible enough for change

### Before Execution

- [ ] Plan reviewed by implementers
- [ ] Dependencies validated
- [ ] Estimates challenged
- [ ] Contingencies planned
