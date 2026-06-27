# Task Breakdown Methodology

## Overview

Task breakdown converts goals into verifiable, executable tasks. This methodology ensures tasks are appropriately sized, have clear completion criteria, and can be assigned and tracked.

## Breakdown Hierarchy

### Levels of Breakdown

**Level 1: Goal**
- High-level objective (e.g., "Implement user authentication")
- Not executable directly
- Needs decomposition

**Level 2: Features**
- Major deliverables (e.g., "Login form", "Database schema", "API endpoints")
- Still too large for direct execution
- Needs further decomposition

**Level 3: Tasks**
- Executable units of work (e.g., "Create users table", "Implement POST /login")
- Can be assigned to a developer
- Should complete in 1-3 days

**Level 4: Subtasks (optional)**
- Fine-grained steps (e.g., "Define table columns", "Write migration")
- Used for complex tasks
- Should complete in hours

### Example Breakdown

```
Goal: Implement user authentication
├── Feature: Database schema
│   ├── Task: Create users table
│   │   ├── Subtask: Define table columns
│   │   ├── Subtask: Write migration
│   │   └── Subtask: Add indexes
│   └── Task: Create sessions table
├── Feature: API endpoints
│   ├── Task: Implement POST /login
│   ├── Task: Implement POST /logout
│   └── Task: Implement GET /me
└── Feature: Frontend forms
    ├── Task: Create login form
    └── Task: Create logout button
```

## Task Sizing

### Ideal Task Size

**Duration:** 1-3 days of work
**Complexity:** Can be understood by one developer
**Dependencies:** Minimal external dependencies
**Verification:** Clear completion criteria

### Too Large Signs

- Takes more than 5 days
- Requires multiple developers
- Has multiple distinct deliverables
- Unclear when "done"

### Too Small Signs

- Takes less than 2 hours
- Purely administrative
- Not independently valuable
- Creates tracking overhead

### Sizing Techniques

**Time Boxing:** Aim for 2-day target, split if larger
**Deliverable Focus:** One clear deliverable per task
**Dependency Minimization:** Reduce external dependencies where possible
**Complexity Check:** Can one developer complete independently?

## Verifiable Completion Criteria

### Characteristics of Good Criteria

**Observable:** Can be seen or tested
**Specific:** Clear pass/fail condition
**Measurable:** Quantifiable where possible
**Binary:** Either done or not done

### Examples

**Bad:** "Implement login"
**Good:** "POST /login returns 200 with valid credentials, 401 with invalid"

**Bad:** "Create database schema"
**Good:** "Users table created with migration passing all tests"

**Bad:** "Fix bug"
**Good:** "Issue no longer reproduces with regression test added"

### Criteria Template

For each task, define:
1. **What:** What must be delivered
2. **How:** How to verify it works
3. **Edge Cases:** What edge cases must be handled
4. **Integration:** How it integrates with other components

## Breakdown Process

### Step 1: Understand the Goal

- Clarify what "done" means
- Identify constraints and requirements
- Understand context and dependencies

### Step 2: Identify Major Features

- Break goal into logical components
- Group related functionality
- Identify natural boundaries

### Step 3: Break Features into Tasks

- Apply task sizing guidelines
- Ensure each task has clear deliverable
- Define completion criteria

### Step 4: Review and Refine

- Check task dependencies
- Verify task sizes are appropriate
- Ensure acceptance criteria are clear

### Step 5: Add Estimates and Risks

- Estimate effort with ranges
- Identify risks and blockers
- Note assumptions

## Common Patterns

### Database Tasks

- Schema changes
- Migration scripts
- Data seeding
- Index creation

### API Tasks

- Endpoint implementation
- Request validation
- Response formatting
- Error handling

### Frontend Tasks

- Component creation
- State management
- API integration
- Styling

### Integration Tasks

- Component wiring
- Data flow implementation
- Error handling across boundaries
- End-to-end testing

## Anti-Patterns

### Waterfall Breakdown

**Pattern:** Breaking down entire project upfront in extreme detail
**Problem:** Changes invalidate detailed plans
**Fix:** Break down just-in-time, maintain flexibility

### Over-Granularity

**Pattern:** Breaking down to subtasks for everything
**Problem:** Tracking overhead, loss of context
**Fix:** Only subtask when task is genuinely complex

### Mixed Abstraction Levels

**Pattern:** Task list mixes high-level and low-level items
**Problem:** Confusing, hard to track
**Fix:** Maintain consistent abstraction level

### Vague Tasks

**Pattern:** Tasks like "investigate", "research", "design"
**Problem:** Unclear completion criteria
**Fix:** Make specific: "investigate X and document findings"

## Integration with Other Planning

### With Planning-Pro

- **Planning-pro:** High-level sequencing, milestones
- **Writing-plans-pro:** Detailed task breakdown
- **Handoff:** After high-level plan is approved

### With Business-Analysis-Pro

- **Business-analysis-pro:** Requirements, acceptance criteria
- **Writing-plans-pro:** Technical task breakdown
- **Handoff:** After requirements are validated

### With Domain Skills

- **Domain skills:** Technical feasibility, stack-specific patterns
- **Writing-plans-pro:** General task structure
- **Handoff:** Collaborative for technical tasks

## Quality Checklist

### Task Quality

- [ ] Task has clear deliverable
- [ ] Task is appropriately sized (1-3 days)
- [ ] Task has verifiable completion criteria
- [ ] Task can be assigned to one person

### Plan Quality

- [ ] Tasks cover all required work
- [ ] Dependencies are accurate
- [ ] No gaps or overlaps between tasks
- [ ] Tasks are in logical sequence

### Completeness

- [ ] Estimates provided for each task
- [ ] Risks and blockers identified
- [ ] Assumptions documented
- [ ] Verification checkpoints included

## Metrics

### Breakdown Quality

- **Task size distribution:** % of tasks in ideal size range
- **Completion clarity:** % of tasks with clear criteria
- **Dependency accuracy:** % of dependencies that prove correct
- **Estimation accuracy:** % of estimates within range

### Execution Quality

- **Task completion rate:** % of tasks completed as planned
- **Replanning rate:** % of tasks requiring significant changes
- **Blocker prediction:** % of predicted blockers that actually occur
