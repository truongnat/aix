# Execution Cycle

## Overview

The execution cycle follows a repeatable pattern: plan → execute batch → checkpoint → verify → adapt or continue. This disciplined approach ensures quality and allows for adaptation.

## Cycle Phases

### Phase 1: Plan Review

**Goal:** Confirm plan is ready for execution.

**Steps:**
1. Review detailed plan from **`writing-plans-pro`**
2. Confirm dependencies are accurate
3. Verify acceptance criteria are clear
4. Check resources and environment are ready
5. Validate checkpoint strategy

**Quality Gates:**
- Plan tasks are verifiable
- Dependencies are mapped
- Resources are available
- Checkpoints are defined

### Phase 2: Execute Batch

**Goal:** Execute a batch of tasks respecting dependencies.

**Steps:**
1. Select next batch of executable tasks
2. Respect dependency order
3. Execute tasks sequentially or in parallel as appropriate
4. Track completion status
5. Document any deviations

**Quality Gates:**
- Dependencies respected
- Tasks completed according to acceptance criteria
- Deviations documented
- Progress tracked

### Phase 3: Checkpoint

**Goal:** Pause and verify at defined gates.

**Steps:**
1. Reach checkpoint (milestone, dependency gate, time gate)
2. Verify acceptance criteria for completed tasks
3. Assess progress against plan
4. Identify blockers or issues
5. Decide: continue, stop, or replan

**Quality Gates:**
- Acceptance criteria verified
- Progress assessed
- Blockers identified
- Decision documented

### Phase 4: Verify

**Goal:** Confirm quality and integration.

**Steps:**
1. Verify acceptance criteria met
2. Test integration points
3. Check for regressions
4. Validate against original requirements
5. Document verification results

**Quality Gates:**
- Acceptance criteria satisfied
- Integration tested
- No regressions introduced
- Verification documented

### Phase 5: Adapt or Continue

**Goal:** Decide next action based on checkpoint results.

**If Continue:**
- Proceed to next batch
- Maintain current plan
- Continue execution cycle

**If Replan:**
- Identify what needs to change
- Update plan with changes
- Re-validate dependencies
- Continue execution cycle

**If Stop:**
- Document reason for stopping
- Capture current state
- Plan resumption if applicable

**Quality Gates:**
- Decision rationale documented
- Plan updated if replanning
- State captured if stopping
- Next steps clear

## Batch Selection

### Batch Size

**Ideal:** 2-5 tasks per batch
**Factors:**
- Task complexity
- Dependency relationships
- Resource availability
- Checkpoint proximity

### Batch Composition

**Sequential:** Tasks must execute in order
**Parallel:** Tasks can execute simultaneously
**Mixed:** Some sequential, some parallel within batch

### Example

```
Batch 1: Database schema tasks (sequential)
  - Task A: Create users table
  - Task B: Create sessions table
  - Task C: Run migrations

Batch 2: API endpoints (parallel)
  - Task D: POST /login
  - Task E: POST /logout
  - Task F: GET /me

Batch 3: Frontend integration (sequential)
  - Task G: Integrate login form
  - Task H: Integrate logout button
  - Task I: Test end-to-end
```

## Checkpoint Types

### Dependency Checkpoints

**Trigger:** After completing tasks that other tasks depend on
**Purpose:** Verify dependencies are satisfied before proceeding
**Example:** After database migration, before API implementation

### Milestone Checkpoints

**Trigger:** After completing major feature or phase
**Purpose:** Verify major deliverable is complete
**Example:** After completing authentication feature

### Time-Based Checkpoints

**Trigger:** At regular time intervals (daily, weekly)
**Purpose:** Regular progress review and adaptation
**Example:** Daily standup review

### Risk-Based Checkpoints

**Trigger:** Before high-risk or irreversible changes
**Purpose:** Extra verification before critical actions
**Example:** Before production deployment

## Adaptation Triggers

### When to Replan

**Blockers:** Task cannot proceed due to blocking issue
**New Information:** Requirements change or new constraints discovered
**Estimation Errors:** Tasks taking significantly longer than estimated
**Quality Issues:** Acceptance criteria cannot be met
**Resource Changes:** Team availability or capacity changes

### Replanning Process

1. **Assess Impact:** How significant is the change?
2. **Identify Options:** What are the possible responses?
3. **Select Approach:** Choose best option considering trade-offs
4. **Update Plan:** Modify detailed plan accordingly
5. **Communicate:** Inform stakeholders of changes
6. **Continue:** Resume execution cycle

### Adaptation Strategies

**Scope Reduction:** Remove non-essential tasks
**Timeline Extension:** Add time to plan
**Resource Addition:** Add more resources if available
**Technical Pivot:** Change technical approach
**Priority Reordering:** Reorder tasks based on new priorities

## Cycle Quality Metrics

### Execution Quality

- **Dependency Adherence:** % of dependencies respected
- **Checkpoint Compliance:** % of checkpoints enforced
- **Acceptance Criteria Met:** % of tasks meeting criteria
- **Plan Adherence:** % of tasks completed as planned

### Adaptation Quality

- **Replan Necessity:** % of replans that were necessary
- **Replan Effectiveness:** % of replans that improved outcomes
- **Adaptation Timeliness:** Time from issue to adaptation

## Common Mistakes

### Skipping Checkpoints

**Pattern:** Continuing execution without pausing at checkpoints
**Problem:** Issues accumulate, quality degrades
**Fix:** Enforce checkpoint discipline, document decisions

### Ignoring Dependencies

**Pattern:** Executing tasks out of dependency order
**Problem:** Integration failures, rework required
**Fix:** Respect dependency mapping, validate before execution

### Rigid Plan Adherence

**Pattern:** Refusing to adapt when circumstances change
**Problem:** Plan becomes obsolete, execution fails
**Fix:** Build adaptation into process, replan when needed

### Incomplete Verification

**Pattern:** Assuming completion without verification
**Problem:** Quality issues discovered late
**Fix:** Verify acceptance criteria at every checkpoint

## Integration with Other Skills

### With Writing-Plans-Pro

- **Writing-plans-pro:** Creates detailed plan
- **Executing-plans-pro:** Executes plan
- **Handoff:** Plan ready for execution

### With Planning-Pro

- **Planning-pro:** High-level coordination
- **Executing-plans-pro:** Detailed execution
- **Handoff:** Milestone progress reporting

### With Domain Skills

- **Domain skills:** Technical execution
- **Executing-plans-pro:** Coordination and tracking
- **Handoff:** Task assignment and verification
