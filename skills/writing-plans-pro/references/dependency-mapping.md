# Dependency Mapping

## Overview

Dependency mapping identifies relationships between tasks, ensuring execution order and enabling parallelization. This prevents blocking and optimizes workflow.

## Dependency Types

### Hard Dependencies (Must-Have)

**Definition:** Task B literally cannot start until Task A completes.

**Examples:**
- Database migration must complete before API can use new schema
- API endpoint must exist before frontend can integrate
- Library must be installed before code can use it

**Characteristics:**
- Blocking: B cannot proceed without A
- Sequential: Must execute in order
- Clear: Easy to identify

### Soft Dependencies (Should-Have)

**Definition:** Task B can start without A, but is better with A complete.

**Examples:**
- Frontend can start before backend is complete (using mocks)
- Testing can start before all features are complete
- Documentation can start alongside implementation

**Characteristics:**
- Non-blocking: B can proceed without A
- Preferable: Better with A complete
- Flexible: Can work around

### Informational Dependencies

**Definition:** Task B needs information from A, but can proceed independently.

**Examples:**
- Task B needs API contract from Task A
- Task B needs design decision from Task A
- Task B needs configuration from Task A

**Characteristics:**
- Informational: Needs knowledge, not execution
- Documentable: Can be documented upfront
- Parallel: Can execute in parallel once info available

## Dependency Notation

### Common Notations

**Arrow Notation:** A → B (A must complete before B)
**FS (Finish-to-Start):** A must finish before B starts
**SS (Start-to-Start):** B can start when A starts
**FF (Finish-to-Finish):** B must finish when A finishes

### Example

```
Task A (Database migration) → Task B (API implementation)
Task C (Frontend mock) can start in parallel with A
Task D (Frontend integration) → Task B
```

## Mapping Process

### Step 1: Identify All Tasks

- List all tasks from breakdown
- Ensure each task has unique identifier
- Understand each task's deliverable

### Step 2: Identify Hard Dependencies

- Ask: "What must be in place before this can start?"
- Document hard dependencies
- Verify dependencies are real, not assumed

### Step 3: Identify Soft Dependencies

- Ask: "What would make this easier or better?"
- Document soft dependencies
- Note if they can be worked around

### Step 4: Identify Informational Dependencies

- Ask: "What information does this need?"
- Document informational dependencies
- Determine if info can be provided upfront

### Step 5: Validate Dependencies

- Check for circular dependencies
- Verify dependency chain is logical
- Identify critical path

### Step 6: Optimize

- Identify parallelization opportunities
- Consider breaking tasks to reduce dependencies
- Document workarounds for soft dependencies

## Critical Path Analysis

### What is Critical Path?

The longest sequence of dependent tasks that determines minimum project duration.

### Finding Critical Path

1. Map all dependencies
2. Identify all paths from start to finish
3. Calculate duration for each path
4. Longest path is critical path

### Critical Path Implications

- Delays on critical path delay entire project
- Focus attention on critical path tasks
- Parallelize non-critical path tasks where possible

## Parallelization Opportunities

### Independent Tasks

Tasks with no dependencies can run in parallel.

**Example:**
- Task A: Create login form
- Task B: Create registration form
- Task C: Create password reset form
All can run in parallel if resources available.

### Partial Dependencies

Tasks that only depend on early parts of other tasks.

**Example:**
- Task A: Implement API (1-3 days)
- Task B: Frontend integration (depends on API contract only)
- B can start once API contract is defined (day 1), not when A completes (day 3)

## Dependency Anti-Patterns

### Circular Dependencies

**Pattern:** A → B → A
**Problem:** Impossible to execute
**Fix:** Break cycle by splitting tasks or removing dependency

### Over-Dependency

**Pattern:** Everything depends on everything
**Problem:** No parallelization possible, serial execution
**Fix:** Challenge each dependency, find ways to decouple

### Hidden Dependencies

**Pattern:** Dependencies not documented, discovered during execution
**Problem:** Unexpected blocking, delays
**Fix:** Systematic dependency identification, validate with team

### False Dependencies

**Pattern:** Assumed dependencies that don't actually exist
**Problem:** Unnecessary serialization, slower execution
**Fix:** Validate each dependency, remove false ones

## Dependency Documentation

### Task Dependency Table

| Task | Depends On | Type | Notes |
|------|-----------|------|-------|
| Task B | Task A | Hard | Database schema required |
| Task C | Task A | Soft | Can use mocks |
| Task D | Task A (contract only) | Informational | Needs API spec |

### Dependency Graph

Visual representation showing:
- Tasks as nodes
- Dependencies as edges
- Critical path highlighted
- Parallelization opportunities visible

### Dependency Matrix

Matrix showing:
- Tasks on both axes
- X marks dependency
- Easy to identify patterns and clusters

## Risk Management

### Dependency Risks

**Upstream Delay:** Delay in dependent task
**Upstream Failure:** Failure in dependent task
**Integration Failure:** Tasks don't integrate as expected
**Resource Conflict:** Tasks compete for same resources

### Mitigation Strategies

**Buffers:** Add time buffers for critical dependencies
**Alternatives:** Identify alternative approaches if dependency fails
**Parallel Work:** Start work that doesn't depend on blocking task
**Monitoring:** Track upstream task progress closely

## Integration with Execution

### With Executing-Plans-Pro

- **Writing-plans-pro:** Define dependencies
- **Executing-plans-pro:** Execute respecting dependencies
- **Handoff:** Dependency-aware execution plan

### With Parallel-Agents-Pro

- **Writing-plans-pro:** Identify parallelizable tasks
- **Parallel-agents-pro:** Execute tasks in parallel
- **Handoff:** Dependency map for parallel execution

## Quality Checklist

### Dependency Accuracy

- [ ] All hard dependencies identified
- [ ] Soft dependencies documented
- [ ] Informational dependencies captured
- [ ] No circular dependencies

### Dependency Necessity

- [ ] Each dependency validated as necessary
- [ ] False dependencies removed
- [ ] Over-dependency reduced
- [ ] Workarounds documented for soft dependencies

### Dependency Clarity

- [ ] Dependency type clear (hard/soft/informational)
- [ ] Dependency reasons documented
- [ ] Blocking conditions clear
- [ ] Workarounds identified where applicable

### Optimization

- [ ] Parallelization opportunities identified
- [ ] Critical path calculated
- [ ] Dependency reduction opportunities explored
- [ ] Execution order optimized
