# Integration Map for Writing Plans

## Overview

This map defines how writing-plans-pro integrates with other skills in this repository.

## Skill Dependencies

### Upstream Skills (Use Before writing-plans-pro)

**business-analysis-pro**
- **When to call:** Before writing detailed plans
- **Purpose:** Validate requirements, clarify acceptance criteria
- **Handoff:** Validated requirements with clear acceptance criteria
- **Integration:** writing-plans-pro uses business-analysis-pro output as input for task breakdown

**planning-pro**
- **When to call:** Before writing detailed plans
- **Purpose:** High-level sequencing, milestone structure
- **Handoff:** High-level plan with milestones and dependencies
- **Integration:** writing-plans-pro decomposes planning-pro milestones into detailed tasks

### Downstream Skills (Use After writing-plans-pro)

**executing-plans-pro**
- **When to call:** After plan is written and approved
- **Purpose:** Execute the detailed plan
- **Handoff:** Detailed task list with dependencies, acceptance criteria, estimates
- **Integration:** executing-plans-pro uses writing-plans-pro output for execution coordination

**Domain *-pro skills**
- **When to call:** During plan creation for technical validation
- **Purpose:** Validate technical feasibility, identify technical constraints
- **Handoff:** Technical constraints and feasibility assessment
- **Integration:** writing-plans-pro incorporates domain skill feedback into task breakdown

**feedback-pro**
- **When to call:** After plan is written for review
- **Purpose:** Review plan quality, identify gaps
- **Handoff:** Plan for review
- **Integration:** writing-plans-pro incorporates feedback-pro recommendations

## Integration Scenarios

### Scenario 1: New Feature Implementation

**Flow:**
1. **business-analysis-pro** validates requirements
2. **planning-pro** creates high-level plan with milestones
3. **writing-plans-pro** breaks down into detailed tasks
4. Domain ***-pro skills** validate technical feasibility
5. **feedback-pro** reviews plan quality
6. **executing-plans-pro** executes the plan

**Key Integration Points:**
- Requirements validation (business-analysis-pro → writing-plans-pro)
- Milestone to task breakdown (planning-pro → writing-plans-pro)
- Technical feasibility (domain skills → writing-plans-pro)
- Plan review (writing-plans-pro → feedback-pro)
- Plan execution (writing-plans-pro → executing-plans-pro)

### Scenario 2: Bug Fix Implementation

**Flow:**
1. **systematic-debugging-pro** identifies root cause
2. **writing-plans-pro** creates fix implementation plan
3. Domain ***-pro skills** validate fix approach
4. **executing-plans-pro** executes fix
5. **testing-pro** verifies fix

**Key Integration Points:**
- Root cause understanding (systematic-debugging-pro → writing-plans-pro)
- Fix validation (domain skills → writing-plans-pro)
- Fix execution (writing-plans-pro → executing-plans-pro)
- Fix verification (executing-plans-pro → testing-pro)

### Scenario 3: Refactoring

**Flow:**
1. **refactor-pro** identifies refactoring opportunities
2. **writing-plans-pro** creates refactoring plan
3. Domain ***-pro skills** validate refactoring approach
4. **executing-plans-pro** executes refactoring
5. **testing-pro** verifies no regressions

**Key Integration Points:**
- Refactoring scope (refactor-pro → writing-plans-pro)
- Refactoring validation (domain skills → writing-plans-pro)
- Refactoring execution (writing-plans-pro → executing-plans-pro)
- Regression verification (executing-plans-pro → testing-pro)

## Handoff Protocols

### To business-analysis-pro

**When:** Requirements unclear or ambiguous
**Input:** Goal or feature to implement
**Output:** Validated requirements with acceptance criteria
**Protocol:**
- Provide context and constraints
- Request requirements validation
- Receive validated requirements
- Proceed with detailed planning

### To planning-pro

**When:** High-level sequencing needed
**Input:** Detailed task list
**Output:** Sequenced plan with milestones
**Protocol:**
- Provide task list with dependencies
- Request high-level sequencing
- Receive milestone structure
- Incorporate into detailed plan

### To Domain Skills

**When:** Technical feasibility validation needed
**Input:** Task with technical approach
**Output:** Feasibility assessment and constraints
**Protocol:**
- Provide task description and proposed approach
- Request technical validation
- Receive feasibility assessment
- Adjust plan based on feedback

### To executing-plans-pro

**When:** Plan ready for execution
**Input:** Detailed task list with dependencies, criteria, estimates
**Output:** Execution progress and completion
**Protocol:**
- Provide complete task list
- Provide dependency map
- Provide acceptance criteria
- Provide estimates and risks
- Receive execution status

### To feedback-pro

**When:** Plan quality review needed
**Input:** Complete plan
**Output:** Quality assessment and recommendations
**Protocol:**
- Provide complete plan
- Request quality review
- Receive assessment and recommendations
- Incorporate feedback into plan

## Conflict Resolution

### Conflicts with business-analysis-pro

**Scenario:** Requirements validation reveals gaps
**Resolution:**
- Pause detailed planning
- Address requirement gaps
- Re-validate requirements
- Resume detailed planning

### Conflicts with Domain Skills

**Scenario:** Technical feasibility issues
**Resolution:**
- Review technical constraints
- Adjust task approach
- Re-validate with domain skill
- Update plan

### Conflicts with planning-pro

**Scenario:** High-level sequencing conflicts with detailed breakdown
**Resolution:**
- Review milestone structure
- Adjust task breakdown or milestones
- Ensure consistency
- Update both plans

### Conflicts with executing-plans-pro

**Scenario:** Execution reveals plan issues
**Resolution:**
- Pause execution
- Review plan issues
- Adjust plan
- Resume execution

## Quality Gates

### Before Calling writing-plans-pro

- [ ] Requirements validated (if applicable)
- [ ] High-level plan created (if applicable)
- [ ] Context and constraints understood
- [ ] Stakeholder alignment achieved

### During writing-plans-pro

- [ ] Domain skills consulted for technical validation
- [ ] Dependencies mapped accurately
- [ ] Acceptance criteria defined clearly
- [ ] Estimates realistic with assumptions

### After writing-plans-pro

- [ ] Plan reviewed by feedback-pro
- [ ] Plan approved by stakeholders
- [ ] Plan handed off to executing-plans-pro
- [ ] Plan documented and communicated
