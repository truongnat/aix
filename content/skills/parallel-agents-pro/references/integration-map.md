# Integration Map for Parallel Agents

## Overview

This map defines how parallel-agents-pro integrates with other skills in this repository.

## Skill Dependencies

### Upstream Skills (Use Before parallel-agents-pro)

**writing-plans-pro**
- **When to call:** Before parallel execution
- **Purpose:** Create detailed plan with dependency mapping
- **Handoff:** Task list with dependencies and parallelization strategy
- **Integration:** parallel-agents-pro uses writing-plans-pro output for agent dispatch

**planning-pro**
- **When to call:** Before parallel execution
- **Purpose:** High-level coordination and milestone tracking
- **Handoff:** Milestone structure and high-level dependencies
- **Integration:** parallel-agents-pro coordinates with planning-pro milestones

### Downstream Skills (Use After or During parallel-agents-pro)

**executing-plans-pro**
- **When to call:** For sequential coordination of dependent tasks
- **Purpose:** Execute dependent tasks sequentially
- **Handoff:** Dependent tasks for sequential execution
- **Integration:** parallel-agents-pro dispatches independent tasks, executing-plans-pro handles dependent

**Domain *-pro skills**
- **When to call:** During execution for agent task execution
- **Purpose:** Execute technical tasks within each agent
- **Handoff:** Task assignment and technical guidance
- **Integration:** parallel-agents-pro coordinates domain skill execution across agents

**systematic-debugging-pro**
- **When to call:** When agents encounter issues or blockers
- **Purpose:** Debug and resolve agent issues
- **Handoff:** Agent issue details and context
- **Integration:** parallel-agents-pro uses systematic-debugging-pro for agent issue resolution

**feedback-pro**
- **When to call:** After execution for review
- **Purpose:** Review execution quality and outcomes
- **Handoff:** Execution results and aggregated output
- **Integration:** parallel-agents-pro uses feedback-pro for quality review

## Integration Scenarios

### Scenario 1: Parallel Task Execution

**Flow:**
1. **writing-plans-pro** creates detailed plan with dependency mapping
2. **parallel-agents-pro** dispatches independent tasks to agents
3. Domain ***-pro skills** execute tasks within each agent
4. **parallel-agents-pro** aggregates results
5. **executing-plans-pro** executes dependent tasks sequentially

**Key Integration Points:**
- Dependency mapping (writing-plans-pro → parallel-agents-pro)
- Agent dispatch (parallel-agents-pro)
- Task execution (parallel-agents-pro → domain skills)
- Result aggregation (parallel-agents-pro)
- Sequential coordination (parallel-agents-pro → executing-plans-pro)

### Scenario 2: Parallel with Dependencies

**Flow:**
1. **writing-plans-pro** maps dependencies
2. **parallel-agents-pro** executes wave 1 (independent tasks)
3. Domain ***-pro skills** execute wave 1 tasks
4. **parallel-agents-pro** aggregates wave 1 results
5. **parallel-agents-pro** executes wave 2 (now-available tasks)
6. Continue until all waves complete

**Key Integration Points:**
- Dependency mapping (writing-plans-pro)
- Wave execution (parallel-agents-pro)
- Task execution (parallel-agents-pro → domain skills)
- Wave coordination (parallel-agents-pro)

### Scenario 3: Agent Failure Handling

**Flow:**
1. **parallel-agents-pro** detects agent failure
2. **systematic-debugging-pro** diagnoses issue
3. **parallel-agents-pro** retries or reassigns task
4. Domain ***-pro skills** execute recovered task
5. **parallel-agents-pro** continues with aggregation

**Key Integration Points:**
- Failure detection (parallel-agents-pro)
- Debugging (parallel-agents-pro → systematic-debugging-pro)
- Recovery (parallel-agents-pro)
- Task execution (parallel-agents-pro → domain skills)

## Handoff Protocols

### From writing-plans-pro

**When:** Plan ready for parallel execution
**Input:** Task list with dependencies, parallelization strategy
**Output:** Aggregated execution results
**Protocol:**
- Receive task list
- Receive dependency map
- Receive parallelization strategy
- Dispatch agents
- Aggregate results

### To executing-plans-pro

**When:** Dependent tasks need sequential execution
**Input:** Dependent tasks with dependencies
**Output:** Execution status
**Protocol:**
- Provide dependent tasks
- Provide dependency information
- Receive execution status
- Continue with next wave

### To Domain Skills

**When:** Agent task execution needed
**Input:** Task with technical requirements
**Output:** Task completion
**Protocol:**
- Provide task description
- Provide acceptance criteria
- Receive task completion
- Verify acceptance criteria

### To systematic-debugging-pro

**When:** Agent issue occurs
**Input:** Agent issue details and context
**Output:** Root cause and resolution
**Protocol:**
- Provide issue description
- Provide context and logs
- Receive diagnosis
- Implement resolution

### To feedback-pro

**When:** Execution review needed
**Input:** Execution results and aggregated output
**Output:** Quality assessment
**Protocol:**
- Provide execution results
- Provide aggregated output
- Request quality review
- Receive assessment

## Conflict Resolution

### Conflicts with writing-plans-pro

**Scenario:** Dependency mapping issues during execution

**Resolution:**
- Pause execution
- Communicate dependency issues to writing-plans-pro
- Adjust dependency map
- Resume execution

### Conflicts with executing-plans-pro

**Scenario:** Sequential coordination conflicts

**Resolution:**
- Review sequential execution plan
- Adjust wave structure
- Ensure consistency
- Continue execution

### Conflicts with Domain Skills

**Scenario:** Technical approach issues in agents

**Resolution:**
- Consult with domain skill
- Adjust technical approach
- Re-validate
- Continue execution

## Quality Gates

### Before parallel-agents-pro

- [ ] Plan received from writing-plans-pro
- [ ] Dependencies understood
- [ ] Parallelization strategy defined
- [ ] Resources available

### During parallel-agents-pro

- [ ] Dependencies respected
- [ ] Agents dispatched appropriately
- [ ] Failures handled
- [ ] Results aggregated correctly

### After parallel-agents-pro

- [ ] Results aggregated
- [ ] Dependent tasks handed to executing-plans-pro
- [ ] Execution reviewed with feedback-pro
- [ ] Lessons learned documented
