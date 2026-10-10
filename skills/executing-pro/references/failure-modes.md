# Failure Modes in Executing Plans

## Overview

Plan execution can fail in predictable ways. Recognizing these patterns allows mitigation and recovery.

## Primary Failure Modes

### 1. Ignoring Dependencies

**Pattern:** Executing tasks out of dependency order.

**Symptoms:**
- Tasks blocked because prerequisites not complete
- Integration failures
- Rework required
- Wasted effort

**Causes:**
- Not reviewing dependencies before execution
- Pressure to complete tasks quickly
- Assuming independence
- Poor dependency documentation

**Mitigation:**
- Review dependencies before each batch
- Validate prerequisites are complete
- Respect dependency mapping
- Document dependency violations

**Recovery:**
- Stop violating dependencies
- Complete prerequisite tasks
- Re-do affected work if needed
- Update dependency documentation

### 2. Skipping Checkpoints

**Pattern:** Continuing execution without pausing at checkpoints.

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
- Document skip reasons for advisory checkpoints
- Emphasize checkpoint value
- Make checkpoints efficient

**Recovery:**
- Pause at next mandatory checkpoint
- Verify all work since last checkpoint
- Address accumulated issues
- Re-establish checkpoint discipline

### 3. Rigid Plan Adherence

**Pattern:** Refusing to adapt when circumstances change.

**Symptoms:**
- Plan becomes obsolete
- Execution fails to deliver value
- Resources wasted on outdated tasks
- Stakeholder dissatisfaction

**Causes:**
- Belief that plan must be followed exactly
- Fear of replanning
- Not recognizing changing context
- Inflexible processes

**Mitigation:**
- Build adaptation into process
- Define replanning triggers
- Encourage adaptation when needed
- Make replanning a normal part of execution

**Recovery:**
- Assess current state vs reality
- Identify what needs to change
- Replan based on current context
- Communicate changes to stakeholders

### 4. Incomplete Verification

**Pattern:** Assuming completion without verifying acceptance criteria.

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

- Dependencies being violated
- Checkpoints being skipped
- Progress not tracked
- Verification not performed

### Mid-Execution Checkpoints

- Are dependencies respected?
- Are checkpoints enforced?
- Is progress tracked?
- Is verification complete?

### Execution Quality Metrics

- **Dependency adherence:** % of dependencies respected
- **Checkpoint compliance:** % of checkpoints enforced
- **Verification completeness:** % of acceptance criteria verified
- **Progress accuracy:** % of tasks on schedule

## Recovery Strategies

### When Dependencies Ignored

1. Stop violating dependencies
2. Complete prerequisite tasks
3. Re-do affected work if needed
4. Update dependency documentation
5. Strengthen dependency discipline

### When Checkpoints Skipped

1. Pause at next mandatory checkpoint
2. Verify all work since last checkpoint
3. Address accumulated issues
4. Re-establish checkpoint discipline
5. Review checkpoint strategy

### When Plan Becomes Obsolete

1. Assess current state vs reality
2. Identify what needs to change
3. Replan based on current context
4. Communicate changes to stakeholders
5. Update execution strategy

### When Verification Incomplete

1. Verify all work to date
2. Address quality issues
3. Add regression tests
4. Strengthen verification process
5. Re-verify critical tasks

## Prevention Checklist

### Before Execution

- [ ] Dependencies reviewed and validated
- [ ] Checkpoints defined and agreed
- [ ] Verification approach clear
- [ ] Progress tracking plan in place
- [ ] Communication plan established

### During Execution

- [ ] Dependencies respected
- [ ] Checkpoints enforced
- [ ] Progress tracked
- [ ] Verification performed
- [ ] Communication maintained

### During Checkpoints

- [ ] Acceptance criteria verified
- [ ] Progress assessed
- [ ] Blockers identified
- [ ] Decision documented
- [ ] Next steps clear

### After Execution

- [ ] Completion verified
- [ ] Lessons learned documented
- [ ] Stakeholders informed
- [ ] Process reviewed for improvement
