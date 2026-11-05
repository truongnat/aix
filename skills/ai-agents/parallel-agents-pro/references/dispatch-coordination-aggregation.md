# Dispatch-Coordination-Aggregation Flow

## Overview

The parallel agent workflow follows three phases: dispatch agents → coordinate execution → aggregate results. This flow ensures efficient parallelization while maintaining correctness.

## Phase 1: Dispatch

**Goal:** Assign independent tasks to agents for parallel execution.

### Task Assignment

**Independent Tasks:**
- Identify tasks with no dependencies on each other
- Assign each to a separate agent
- Maximize parallelization within resource constraints

**Dependent Tasks:**
- Identify dependency chains
- Dispatch in waves (wave 1: independent, wave 2: depends on wave 1, etc.)
- Coordinate waves to respect dependencies

### Agent Assignment

**Factors:**
- Task complexity and duration
- Agent capabilities
- Resource availability
- State requirements

**Strategies:**
- **Round-robin:** Distribute evenly across agents
- **Load-aware:** Assign based on agent current load
- **Capability-based:** Match tasks to agent strengths
- **State-local:** Assign tasks that share state to same agent

### Dispatch Example

```
Tasks:
- A: Create users table (no dependencies)
- B: Create sessions table (no dependencies)
- C: Implement POST /login (depends on A, B)
- D: Implement POST /logout (depends on A, B)
- E: Create login form (depends on C)
- F: Create logout button (depends on D)

Wave 1 (parallel):
  Agent 1: Task A
  Agent 2: Task B

Wave 2 (parallel, after Wave 1 complete):
  Agent 1: Task C
  Agent 2: Task D

Wave 3 (parallel, after Wave 2 complete):
  Agent 1: Task E
  Agent 2: Task F
```

## Phase 2: Coordination

**Goal:** Manage dependencies and shared state across agents.

### Dependency Coordination

**Barrier Synchronization:**
- Wait for all agents in a wave to complete
- Only then dispatch next wave
- Ensures dependencies satisfied

**Event-Based Coordination:**
- Agents signal completion of specific tasks
- Dependent agents wait for required signals
- More flexible than barrier synchronization

**Example:**
```
Agent 1 completes Task A → signals "A-complete"
Agent 2 completes Task B → signals "B-complete"
Agent 3 waits for "A-complete" and "B-complete" before starting Task C
```

### Shared State Coordination

**State Isolation:**
- Minimize shared state
- Use immutable data where possible
- Coordinate state changes explicitly

**Locking Strategies:**
- **Optimistic:** Assume no conflict, detect and retry
- **Pessimistic:** Lock before access, prevent conflicts
- **Versioning:** Track state versions, resolve conflicts on merge

**Coordination Points:**
- Define explicit coordination points
- Agents synchronize at these points
- Validate state consistency

### Coordination Example

```
Shared state: User database

Agent 1: Create user
Agent 2: Update user profile

Coordination strategy: Optimistic with version check
- Agent 1 reads user (version 1)
- Agent 2 reads user (version 1)
- Agent 1 writes user (version 2)
- Agent 2 attempts write, detects version mismatch
- Agent 2 re-reads (version 2), merges changes, writes (version 3)
```

## Phase 3: Aggregation

**Goal:** Combine results from multiple agents into final output.

### Result Collection

**Success Cases:**
- Collect results from all agents
- Validate each result
- Combine into final output

**Partial Failures:**
- Collect results from successful agents
- Identify failed agents
- Handle missing results (retry, fallback, or accept partial)

### Aggregation Strategies

**Merge:**
- Combine results from all agents
- Resolve conflicts if any
- Produce unified output

**Filter:**
- Apply criteria to results
- Keep only results meeting criteria
- Produce filtered output

**Transform:**
- Transform each result
- Combine transformed results
- Produce derived output

**Reduce:**
- Apply reduction operation across results
- Produce single aggregated value

### Aggregation Example

```
Agents return test results:
- Agent 1: { test: "login", status: "pass" }
- Agent 2: { test: "logout", status: "pass" }
- Agent 3: { test: "register", status: "fail" }

Aggregation strategy: Merge with status check
- Combine all results
- Check if any failed
- Return: { all: ["login", "logout", "register"], passed: 2, failed: 1, overall: "fail" }
```

## Failure Handling

### Agent Failures

**Detection:**
- Timeout: Agent doesn't respond within expected time
- Error: Agent returns error
- Crash: Agent terminates unexpectedly

**Strategies:**
- **Retry:** Reassign task to another agent or same agent
- **Fallback:** Use alternative approach or default value
- **Skip:** Accept partial results, note missing data
- **Abort:** Stop entire workflow if critical

### Coordination Failures

**Deadlock:**
- Agents waiting on each other
- Detect circular waits
- Break deadlock by timeout or priority

**Livelock:**
- Agents repeatedly retry without progress
- Detect repeated conflicts
- Use backoff or alternative strategy

### Aggregation Failures

**Validation Failures:**
- Agent results don't meet expectations
- Reject invalid results
- Retry or use fallback

**Merge Conflicts:**
- Results conflict when combined
- Apply conflict resolution strategy
- May require manual intervention

## Quality Metrics

### Dispatch Quality

- **Parallelization efficiency:** % of tasks parallelized
- **Agent utilization:** % of agent capacity used
- **Assignment balance:** Evenness of task distribution

### Coordination Quality

- **Dependency adherence:** % of dependencies respected
- **Coordination overhead:** Time spent on coordination vs execution
- **State conflict rate:** % of state operations with conflicts

### Aggregation Quality

- **Result completeness:** % of expected results collected
- **Aggregation accuracy:** Correctness of combined results
- **Failure handling:** % of failures handled gracefully

## Anti-Patterns

### Over-Dispatching

**Pattern:** Dispatching more agents than available resources
**Problem:** Resource contention, slowdown
**Fix:** Match agent count to resources

### Poor Dependency Handling

**Pattern:** Ignoring dependencies in dispatch
**Problem:** Execution failures, incorrect results
**Fix:** Respect dependencies, use waves

### Excessive Coordination

**Pattern:** Too much coordination overhead
**Problem:** Coordination cost exceeds parallelization benefit
**Fix:** Minimize coordination, use isolation

### No Failure Handling

**Pattern:** Assuming all agents succeed
**Problem:** Workflow fails on first agent failure
**Fix:** Implement failure handling strategies

## Integration with Other Skills

### With Writing-Plans-Pro

- **Writing-plans-pro:** Dependency mapping
- **Parallel-agents-pro:** Use dependencies for wave dispatch
- **Handoff:** Dependency-aware task breakdown

### With Executing-Plans-Pro

- **Executing-plans-pro:** Sequential coordination
- **Parallel-agents-pro:** Parallel coordination
- **Handoff:** Parallel for independent, sequential for dependent

### With Domain Skills

- **Domain skills:** Agent task execution
- **Parallel-agents-pro:** Coordination and aggregation
- **Handoff:** Task assignment and result collection
