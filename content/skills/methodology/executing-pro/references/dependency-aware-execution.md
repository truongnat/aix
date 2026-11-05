# Dependency-Aware Execution

## Overview

Dependency-aware execution ensures tasks are executed in the correct order, respecting the dependency relationships defined in the plan. This prevents blocking and ensures efficient execution.

## Dependency Types

### Hard Dependencies

**Definition:** Task B literally cannot start until Task A completes.

**Characteristics:**
- Blocking: B cannot proceed without A
- Sequential: Must execute in order
- Clear: Easy to identify

**Examples:**
- Database migration must complete before API can use new schema
- API endpoint must exist before frontend can integrate
- Library must be installed before code can use it

### Soft Dependencies

**Definition:** Task B can start without A, but is better with A complete.

**Characteristics:**
- Non-blocking: B can proceed without A
- Preferable: Better with A complete
- Flexible: Can work around

**Examples:**
- Frontend can start before backend is complete (using mocks)
- Testing can start before all features are complete
- Documentation can start alongside implementation

### Informational Dependencies

**Definition:** Task B needs information from A, but can proceed independently.

**Characteristics:**
- Informational: Needs knowledge, not execution
- Documentable: Can be documented upfront
- Parallel: Can execute in parallel once info available

**Examples:**
- Task B needs API contract from Task A
- Task B needs design decision from Task A
- Task B needs configuration from Task A

## Execution Strategies

### Sequential Execution

**Approach:** Execute tasks one at a time in dependency order

**When to Use:**
- Strong dependencies between tasks
- Resource constraints
- Need for tight integration

**Benefits:**
- Simple to manage
- Clear progress
- Easy to debug

**Drawbacks:**
- Slower overall
- Underutilizes resources

### Parallel Execution

**Approach:** Execute independent tasks simultaneously

**When to Use:**
- Independent tasks
- Sufficient resources
- No shared state conflicts

**Benefits:**
- Faster overall
- Better resource utilization

**Drawbacks:**
- More complex coordination
- Potential conflicts

### Wave-Based Execution

**Approach:** Execute in waves based on dependency levels

**When to Use:**
- Mixed dependencies
- Want parallelization where possible
- Need coordination

**Benefits:**
- Balanced approach
- Parallelization where possible
- Clear wave boundaries

**Drawbacks:**
- More complex than sequential
- Requires dependency analysis

## Wave-Based Execution Process

### Step 1: Analyze Dependencies

**Actions:**
- Map all dependencies
- Identify dependency levels
- Determine which tasks can run in parallel

**Output:** Dependency graph with levels

### Step 2: Define Waves

**Actions:**
- Group tasks by dependency level
- Each wave contains tasks with no dependencies within the wave
- Ensure no circular dependencies

**Output:** Wave definitions

### Step 3: Execute Wave 1

**Actions:**
- Execute all tasks in wave 1 in parallel
- Monitor for issues
- Handle failures

**Output:** Wave 1 completion

### Step 4: Verify Wave 1

**Actions:**
- Verify all tasks in wave 1 completed successfully
- Check acceptance criteria
- Identify any issues

**Output:** Wave 1 verification

### Step 5: Execute Next Wave

**Actions:**
- Once wave 1 verified, execute wave 2
- Continue wave-by-wave until all waves complete

**Output:** All waves completed

## Dependency Violation Handling

### Detection

**How to Detect:**
- Task attempting to start before dependencies complete
- Integration failures due to missing prerequisites
- Error messages indicating missing dependencies

### Response

**Options:**

**Wait:**
- Wait for dependencies to complete
- Simple approach
- May delay execution

**Reorder:**
- Reorder tasks to respect dependencies
- Requires plan adjustment
- More efficient

**Use Fallback:**
- Use mock or stub for missing dependency
- Allows parallel execution
- May require additional work

**Abort:**
- Stop execution and resolve dependency
- Ensures correctness
- May delay overall execution

## Common Mistakes

### Ignoring Dependencies

**Pattern:** Executing tasks out of dependency order

**Problem:** Integration failures, rework required

**Fix:** Respect dependency mapping, validate before execution

### Over-Conservative Execution

**Pattern:** Executing everything sequentially even when parallelization possible

**Problem:** Slower execution, underutilized resources

**Fix:** Identify independent tasks, execute in parallel where possible

### Not Checking Dependencies

**Pattern:** Assuming dependencies are satisfied without verification

**Problem:** Execution failures due to missing prerequisites

**Fix:** Verify dependencies before starting dependent tasks

### Circular Dependencies

**Pattern:** Tasks depend on each other in a cycle

**Problem:** Impossible to execute

**Fix:** Break cycle by splitting tasks or removing dependency

## Quality Checklist

### Before Execution

- [ ] Dependencies mapped and validated
- [ ] Dependency levels identified
- [ ] Wave definitions created
- [ ] Resource availability confirmed

### During Execution

- [ ] Dependencies respected
- [ ] Parallelization used where appropriate
- [ ] Dependency violations detected early
- [ ] Violations handled appropriately

### After Execution

- [ ] All dependencies satisfied
- [ ] No integration failures
- [ ] Execution efficient
- [ ] Lessons learned documented
