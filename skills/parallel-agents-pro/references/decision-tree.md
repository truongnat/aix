# Decision Tree for Parallel Agents

## Overview

This decision tree guides key decisions for parallel agent workflows.

## Decision Tree

```
START
│
├─ Are tasks independent?
│  ├─ YES → Proceed to parallel execution
│  │  ├─ Are resources available?
│  │  │  ├─ YES → Use 2-4 agents (standard)
│  │  │  └─ NO → Use 1-2 agents (limited)
│  │  └─ Is shared state needed?
│  │     ├─ NO → Use isolated state
│  │     ├─ YES → Can partition state?
│  │     │  ├─ YES → Use partitioned state
│  │     │  └─ NO → Use shared with coordination
│  │
│  └─ NO → Execute sequentially
│     └─ Use single agent
│
├─ What is the performance requirement?
│  ├─ CRITICAL
│  │  ├─ Use maximum parallelization
│  │  ├─ Agent count: As many as resources allow
│  │  └─ State: Partitioned where possible
│  │
│  ├─ HIGH
│  │  ├─ Use moderate parallelization
│  │  ├─ Agent count: 4-8 agents
│  │  └─ State: Isolated or partitioned
│  │
│  └─ STANDARD
│     ├─ Use single agent or minimal parallelization
│     ├─ Agent count: 1-2 agents
│     └─ State: Isolated
│
└─ What is the complexity tolerance?
   ├─ HIGH TOLERANCE
   │  ├─ Can use complex coordination
   │  ├─ Can use shared state
   │  └─ Can use many agents
   │
   ├─ MEDIUM TOLERANCE
   │  ├─ Use moderate coordination
   │  ├─ Use isolated or partitioned state
   │  └─ Use 2-4 agents
   │
   └─ LOW TOLERANCE
      ├─ Use simple coordination
      ├─ Use isolated state
      └─ Use 1-2 agents
```

## Decision Questions

### Independence Assessment

**Independent Indicators:**
- No dependencies between tasks
- No shared data needed
- Can execute in any order
- No communication needed

**Dependent Indicators:**
- Dependencies between tasks
- Shared data required
- Specific execution order required
- Communication needed

### Resource Assessment

**Available Indicators:**
- Sufficient CPU
- Sufficient memory
- Sufficient network bandwidth
- Sufficient database connections

**Constrained Indicators:**
- CPU limited
- Memory limited
- Network limited
- Database connections limited

### State Requirements

**No State Indicators:**
- Tasks don't need to share data
- Each task self-contained
- No coordination needed

**Partitionable Indicators:**
- State can be partitioned by key
- State can be partitioned by agent
- Natural partitioning exists

**Non-Partitionable Indicators:**
- State must be shared
- No natural partitioning
- Global state required

### Performance Requirements

**Critical Indicators:**
- Tight SLA
- High throughput required
- Low latency required
- Business-critical

**High Indicators:**
- Important but not critical
- Performance matters
- Some flexibility

**Standard Indicators:**
- Routine work
- Performance not critical
- Flexibility acceptable

### Complexity Tolerance

**High Tolerance Indicators:**
- Team experienced
- Time for complexity
- Value from optimization
- Accepts complexity cost

**Medium Tolerance Indicators:**
- Team moderately experienced
- Some time for complexity
- Moderate value from optimization
- Accepts some complexity

**Low Tolerance Indicators:**
- Team inexperienced
- Time pressure
- Complexity cost high
- Prefers simplicity

## Quick Reference

### Standard Configuration (Most Common)

- **Execution:** Parallel with 2-4 agents
- **State:** Isolated
- **Coordination:** Event-based or barrier
- **Use when:** Standard parallel work, medium resources

### High-Performance Configuration

- **Execution:** Maximum parallelization
- **Agent Count:** As many as resources allow
- **State:** Partitioned
- **Coordination:** Central coordinator
- **Use when:** Performance critical, abundant resources

### Simple Configuration

- **Execution:** Sequential with single agent
- **Agent Count:** 1 agent
- **State:** Isolated
- **Coordination:** None
- **Use when:** Dependent tasks, resource constrained
