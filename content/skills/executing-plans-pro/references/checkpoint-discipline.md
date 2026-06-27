# Checkpoint Discipline

## Overview

Checkpoint discipline ensures quality gates are enforced during execution. This prevents issues from accumulating and allows for course correction.

## Checkpoint Purpose

### Quality Gates

**Purpose:** Verify work meets standards before proceeding.
**When:** At defined points in execution
**What:** Acceptance criteria, integration tests, quality checks

### Progress Verification

**Purpose:** Confirm progress against plan.
**When:** At regular intervals
**What:** Task completion, estimate accuracy, blocker status

### Risk Mitigation

**Purpose:** Identify and address risks early.
**When:** Before high-risk activities
**What:** Risk assessment, mitigation validation, contingency check

## Checkpoint Types

### Mandatory Checkpoints

**Definition:** Must pause and verify before proceeding.
**Examples:**
- After completing dependencies for other tasks
- Before production deployment
- After major feature completion

**Enforcement:**
- Cannot proceed without checkpoint approval
- Documented decision required
- Sign-off if applicable

### Advisory Checkpoints

**Definition:** Recommended pause points for review.
**Examples:**
- Daily progress review
- Weekly milestone review
- After completing a batch of tasks

**Enforcement:**
- Recommended but can skip with justification
- Document skip reason
- Review at next mandatory checkpoint

### Conditional Checkpoints

**Definition:** Triggered by specific conditions.
**Examples:**
- If task exceeds estimate by 50%
- If blocker encountered
- If quality issue discovered

**Enforcement:**
- Triggered automatically when condition met
- Must address trigger before proceeding
- Document resolution

## Checkpoint Process

### Step 1: Prepare for Checkpoint

**Actions:**
- Ensure checkpoint tasks are complete
- Gather verification evidence
- Prepare progress report
- Identify any issues or blockers

**Quality Gates:**
- All tasks in batch complete
- Evidence gathered
- Progress documented

### Step 2: Verify Acceptance Criteria

**Actions:**
- Review acceptance criteria for completed tasks
- Test or verify each criterion
- Document pass/fail for each
- Identify any failures

**Quality Gates:**
- All acceptance criteria verified
- Failures documented
- Pass/fail status clear

### Step 3: Assess Progress

**Actions:**
- Compare actual vs planned progress
- Identify variances from estimates
- Assess overall timeline impact
- Identify trends or patterns

**Quality Gates:**
- Progress measured against plan
- Variances identified
- Impact assessed

### Step 4: Identify Blockers

**Actions:**
- List current blockers
- Assess blocker severity
- Identify blocker causes
- Propose resolution approaches

**Quality Gates:**
- Blockers identified
- Severity assessed
- Resolution proposed

### Step 5: Make Decision

**Options:**
- **Continue:** Proceed to next batch
- **Stop:** Halt execution for review
- **Replan:** Modify plan and continue

**Decision Criteria:**
- Are acceptance criteria met?
- Are blockers manageable?
- Is progress acceptable?
- Is plan still valid?

**Quality Gates:**
- Decision documented
- Rationale clear
- Next steps defined

## Checkpoint Documentation

### Checklist Format

```
Checkpoint: [Name]
Date: [Date]
Tasks Completed: [List]
Acceptance Criteria: [Pass/Fail per criterion]
Progress: [Actual vs Planned]
Blockers: [List with severity]
Decision: [Continue/Stop/Replan]
Rationale: [Why decision made]
Next Steps: [What happens next]
```

### Evidence Requirements

**For Each Task:**
- Completion evidence (screenshots, test results, logs)
- Acceptance criteria verification
- Any deviations from plan
- Integration test results

**For Progress:**
- Time spent vs estimated
- Resources used vs planned
- Quality metrics

**For Blockers:**
- Description
- Severity (Critical/High/Medium/Low)
- Impact on timeline
- Proposed resolution

## Skipping Checkpoints

### When Skipping Is Permitted

**Advisory checkpoints:** Can skip with justification
**Low-risk situations:** When risk is minimal and well-understood
**Time pressure:** When checkpoint would cause significant delay
**Automated verification:** When continuous verification exists

### Skip Documentation

**Required:**
- Reason for skipping
- Risk assessment
- Alternative verification performed
- Approval if applicable

### Skip Risks

**Quality degradation:** Issues may accumulate
- **Loss of visibility:** Progress becomes unclear
- **Integration failures:** Discovered late
- **Recovery cost:** More expensive to fix later

## Anti-Patterns

### Checkpoint Fatigue

**Pattern:** Too many checkpoints, execution slows down
**Problem:** Checkpoints become meaningless
**Fix:** Reduce to essential checkpoints, combine where possible

### Rubber Stamp Checkpoints

**Pattern:** Checkpoints approved without verification
**Problem:** Quality issues pass through
**Fix:** Enforce verification, require evidence

### Checkpoint Gaming

**Pattern:** Tasks reorganized to avoid difficult checkpoints
**Problem:** Checkpoints lose effectiveness
**Fix:** Maintain checkpoint integrity, adapt checkpoints if needed

### Unclear Checkpoint Criteria

**Pattern:** Not clear what checkpoint is verifying
**Problem:** Inconsistent verification
**Fix:** Define clear criteria for each checkpoint

## Integration with Execution Cycle

### In Execution Cycle

Checkpoints are Phase 3 of execution cycle:
- After batch execution (Phase 2)
- Before verification (Phase 4)
- Before adaptation decision (Phase 5)

### With Adaptive Replanning

Checkpoints trigger replanning when:
- Progress significantly off track
- Blockers cannot be resolved
- Quality issues cannot be addressed
- Plan no longer valid

## Quality Checklist

### Before Checkpoint

- [ ] Batch tasks complete
- [ ] Evidence gathered
- [ ] Progress documented

### During Checkpoint

- [ ] Acceptance criteria verified
- [ ] Progress assessed
- [ ] Blockers identified
- [ ] Decision made with rationale

### After Checkpoint

- [ ] Decision documented
- [ ] Next steps clear
- [ ] Stakeholders informed if needed
- [ ] Plan updated if replanning
