# Verification Checkpoints

## Overview

Verification checkpoints are quality gates that validate progress and ensure work meets standards before proceeding. They prevent issues from accumulating and enable early course correction.

## Checkpoint Types

### Milestone Checkpoints

**Trigger:** After completing major feature or phase

**Purpose:** Verify major deliverable is complete

**Examples:**
- After database schema completion
- After API implementation
- After frontend integration
- After feature completion

### Dependency Checkpoints

**Trigger:** After completing tasks that other tasks depend on

**Purpose:** Ensure dependencies are satisfied before dependent tasks start

**Examples:**
- After database migration before API implementation
- After API contract before frontend integration
- After authentication before protected features

### Time-Based Checkpoints

**Trigger:** At regular time intervals

**Purpose:** Regular progress review and adaptation

**Examples:**
- Daily standup review
- Weekly milestone review
- Bi-weekly quality review

### Risk-Based Checkpoints

**Trigger:** Before high-risk or irreversible changes

**Purpose:** Extra verification before critical actions

**Examples:**
- Before production deployment
- Before data migration
- Before breaking changes
- Before third-party integration

## Checkpoint Process

### Step 1: Prepare for Checkpoint

**Actions:**
- Ensure checkpoint tasks are complete
- Gather verification evidence
- Prepare progress report
- Identify any issues or blockers

**Quality Gates:**
- All tasks in checkpoint scope complete
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

## Verification Methods

### Automated Verification

**Unit Tests:**
- Verify individual components work correctly
- Fast, repeatable, comprehensive
- Should run on every checkpoint

**Integration Tests:**
- Verify components work together
- Test integration points
- Should run on dependency checkpoints

**End-to-End Tests:**
- Verify complete workflows
- Test user journeys
- Should run on milestone checkpoints

### Manual Verification

**Code Review:**
- Review code quality and design
- Verify implementation approach
- Should be part of every checkpoint

**Design Review:**
- Review design decisions
- Verify alignment with requirements
- Should be on major checkpoints

**User Acceptance:**
- Verify user needs met
- Test user experience
- Should be on milestone checkpoints

### Quality Gates

**Static Analysis:**
- Linting and code quality checks
- Security scanning
- Should run on every checkpoint

**Performance Testing:**
- Verify performance requirements
- Load testing
- Should run on performance-critical checkpoints

**Security Testing:**
- Verify security requirements
- Vulnerability scanning
- Should run on security-critical checkpoints

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

## Common Mistakes

### Skipping Checkpoints

**Pattern:** Continue execution without pausing at checkpoints

**Problem:** Issues accumulate, quality degrades

**Fix:** Enforce mandatory checkpoints, document skip reasons

### Rubber Stamp Checkpoints

**Pattern:** Checkpoints approved without verification

**Problem:** Quality issues pass through

**Fix:** Enforce verification, require evidence

### Unclear Checkpoint Criteria

**Pattern:** Not clear what checkpoint is verifying

**Problem:** Inconsistent verification

**Fix:** Define clear criteria for each checkpoint

### Too Many Checkpoints

**Pattern:** Excessive checkpoints slow execution

**Problem:** Checkpoint fatigue, overhead exceeds benefit

**Fix:** Focus on essential checkpoints, combine where possible

## Quality Checklist

### Before Checkpoint

- [ ] Checkpoint tasks complete
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
