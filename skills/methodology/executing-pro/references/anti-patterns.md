# Anti-Patterns in Executing Plans

## Overview

These are common anti-patterns to avoid during plan execution. Recognizing them helps prevent execution failures.

## Primary Anti-Patterns

### 1. Waterfall Execution

**Pattern:** Executing entire plan sequentially without adaptation.

**Symptoms:**
- No checkpoints
- No progress tracking
- No adaptation to changes
- Rigid adherence to outdated plan

**Causes:**
- Belief that plan must be followed exactly
- Fear of replanning
- Not monitoring progress
- Not accepting change

**Mitigation:**
- Implement checkpoints
- Track progress regularly
- Adapt when needed
- Accept plan as living document

**Recovery:**
- Pause execution
- Assess current state vs reality
- Replan based on current context
- Resume with updated plan

### 2. Checkpoint Skipping

**Pattern:** Skipping checkpoints to save time.

**Symptoms:**
- Issues accumulate
- Quality degrades
- Progress unclear
- Problems discovered late

**Causes:**
- Checkpoint fatigue
- Time pressure
- Belief that checkpoints slow execution
- Lack of checkpoint discipline

**Mitigation:**
- Enforce mandatory checkpoints
- Document skip reasons
- Emphasize checkpoint value
- Make checkpoints efficient

**Recovery:**
- Pause at next mandatory checkpoint
- Verify all work since last checkpoint
- Address accumulated issues
- Re-establish checkpoint discipline

### 3. Blind Plan Following

**Pattern:** Following plan without questioning validity.

**Symptoms:**
- Continuing with invalid plan
- Not adapting to changes
- Executing unnecessary tasks
- Wasting resources

**Causes:**
- Fear of deviating from plan
- Not monitoring context
- Belief that plan is perfect
- Lack of decision authority

**Mitigation:**
- Regularly validate plan against reality
- Empower team to question plan
- Monitor for replan triggers
- Act when plan becomes invalid

**Recovery:**
- Assess plan validity
- Identify what changed
- Replan if needed
- Communicate changes

### 4. Incomplete Verification

**Pattern:** Assuming completion without verification.

**Symptoms:**
- Quality issues discovered late
- Acceptance criteria not met
- Integration failures
- Rework required

**Causes:**
- Assuming work is done
- Not defining clear acceptance criteria
- Rushing through verification
- Lack of testing discipline

**Mitigation:**
- Verify every acceptance criterion
- Test integration points
- Check for regressions
- Document verification results

**Recovery:**
- Verify all work to date
- Address quality issues
- Add regression tests
- Strengthen verification process

### 5. Poor Progress Tracking

**Pattern:** Not tracking execution against plan.

**Symptoms:**
- Unclear progress status
- Blockers not identified
- Estimates not validated
- Timeline surprises

**Causes:**
- Not measuring progress
- Assuming everything is on track
- Lack of tracking discipline
- Poor communication

**Mitigation:**
- Track progress continuously
- Compare actual vs planned
- Identify blockers early
- Communicate status regularly

**Recovery:**
- Assess current progress
- Identify blockers and delays
- Update timeline estimates
- Improve tracking going forward

### 6. Inadequate Adaptation

**Pattern:** Replanning without adequate analysis or buy-in.

**Symptoms:**
- Replans don't address root issues
- Stakeholders confused by changes
- Plan churn without improvement
- Loss of confidence in plan

**Causes:**
- Rushed replanning
- Not analyzing root cause
- Not communicating changes
- Replanning for wrong reasons

**Mitigation:**
- Analyze before replanning
- Identify root cause of need to replan
- Communicate changes clearly
- Get buy-in for replanning

**Recovery:**
- Assess replanning effectiveness
- Address root causes
- Stabilize plan
- Rebuild confidence

### 7. Resource Mismanagement

**Pattern:** Not managing resources effectively during execution.

**Symptoms:**
- Resources overcommitted
- Bottlenecks
- Resource conflicts
- Inefficient utilization

**Causes:**
- Not considering resource constraints
- Poor resource planning
- Not adapting to resource changes
- Inefficient resource allocation

**Mitigation:**
- Plan resource allocation
- Monitor resource utilization
- Adapt to resource changes
- Optimize resource usage

**Recovery:**
- Assess current resource state
- Reallocate resources
- Adjust plan based on resources
- Improve resource planning

### 8. Communication Gaps

**Pattern:** Not communicating progress, issues, or decisions.

**Symptoms:**
- Stakeholders unaware of status
- Decisions not understood
- Issues not escalated
- Misalignment

**Causes:**
- Not prioritizing communication
- Assuming others know status
- Fear of reporting bad news
- Poor communication channels

**Mitigation:**
- Communicate progress regularly
- Report issues promptly
- Document decisions
- Use clear communication channels

**Recovery:**
- Assess communication gaps
- Communicate current status
- Establish regular updates
- Improve communication process

## Detection Signals

### Early Warning Signs

- Checkpoints being skipped
- Progress not tracked
- Verification not performed
- Communication gaps

### Mid-Execution Checkpoints

- Are checkpoints enforced?
- Is progress tracked?
- Is verification complete?
- Are adaptations made when needed?

### Execution Quality Metrics

- **Checkpoint compliance:** % of checkpoints enforced
- **Verification completeness:** % of acceptance criteria verified
- **Progress accuracy:** % of tasks on schedule
- **Adaptation appropriateness:** % of adaptations that improve outcomes

## Prevention Checklist

### Before Execution

- [ ] Checkpoints defined and agreed
- [ ] Progress tracking plan in place
- [ ] Verification approach clear
- [ ] Communication plan established

### During Execution

- [ ] Checkpoints enforced
- [ ] Progress tracked
- [ ] Verification performed
- [ ] Communication maintained

### During Checkpoints

- [ ] Acceptance criteria verified
- [ ] Progress assessed
- [ ] Blockers identified
- [ ] Decision documented

### After Execution

- [ ] Completion verified
- [ ] Lessons learned documented
- [ ] Stakeholders informed
- [ ] Process reviewed for improvement
