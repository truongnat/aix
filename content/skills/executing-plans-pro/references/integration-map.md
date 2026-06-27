# Integration Map for Executing Plans

## Overview

This map defines how executing-plans-pro integrates with other skills in this repository.

## Skill Dependencies

### Upstream Skills (Use Before executing-plans-pro)

**writing-plans-pro**
- **When to call:** Before execution
- **Purpose:** Create detailed execution plan
- **Handoff:** Task list with dependencies, acceptance criteria, estimates
- **Integration:** executing-plans-pro uses writing-plans-pro output for execution

**planning-pro**
- **When to call:** Before execution
- **Purpose:** High-level coordination and milestone tracking
- **Handoff:** Milestone structure and high-level dependencies
- **Integration:** executing-plans-pro coordinates with planning-pro milestones

### Downstream Skills (Use After or During executing-plans-pro)

**Domain *-pro skills**
- **When to call:** During execution for technical task execution
- **Purpose:** Execute technical tasks within their stack
- **Handoff:** Task assignment and technical guidance
- **Integration:** executing-plans-pro coordinates domain skill execution

**systematic-debugging-pro**
- **When to call:** When issues or blockers occur during execution
- **Purpose:** Debug and resolve execution issues
- **Handoff:** Issue details and context
- **Integration:** executing-plans-pro uses systematic-debugging-pro for issue resolution

**testing-pro**
- **When to call:** During execution for verification
- **Purpose:** Verify work meets acceptance criteria
- **Handoff:** Tasks to verify
- **Integration:** executing-plans-pro uses testing-pro for verification

**feedback-pro**
- **When to call:** After execution for review
- **Purpose:** Review execution quality and outcomes
- **Handoff:** Execution results
- **Integration:** executing-plans-pro uses feedback-pro for quality review

**git-operations-pro**
- **When to call:** During execution for version control
- **Purpose:** Manage code changes during execution
- **Handoff:** Changes to commit
- **Integration:** executing-plans-pro uses git-operations-pro for version control

## Integration Scenarios

### Scenario 1: Standard Feature Execution

**Flow:**
1. **writing-plans-pro** creates detailed plan
2. **executing-plans-pro** executes plan
3. Domain ***-pro skills** execute technical tasks
4. **testing-pro** verifies work
5. **executing-plans-pro** coordinates checkpoints
6. **feedback-pro** reviews execution

**Key Integration Points:**
- Plan to execution (writing-plans-pro → executing-plans-pro)
- Task execution (executing-plans-pro → domain skills)
- Verification (executing-plans-pro → testing-pro)
- Review (executing-plans-pro → feedback-pro)

### Scenario 2: Debugging During Execution

**Flow:**
1. **executing-plans-pro** encounters blocker
2. **systematic-debugging-pro** diagnoses issue
3. Domain ***-pro skills** implement fix
4. **executing-plans-pro** resumes execution
5. **testing-pro** verifies fix

**Key Integration Points:**
- Issue detection (executing-plans-pro)
- Debugging (executing-plans-pro → systematic-debugging-pro)
- Fix implementation (executing-plans-pro → domain skills)
- Fix verification (executing-plans-pro → testing-pro)

### Scenario 3: Adaptive Replanning

**Flow:**
1. **executing-plans-pro** identifies need to replan
2. **planning-pro** assists with replanning
3. **writing-plans-pro** updates detailed plan
4. **executing-plans-pro** continues with new plan

**Key Integration Points:**
- Replan trigger (executing-plans-pro)
- Replan assistance (executing-plans-pro → planning-pro)
- Plan update (executing-plans-pro → writing-plans-pro)

## Handoff Protocols

### From writing-plans-pro

**When:** Plan ready for execution
**Input:** Detailed task list with dependencies, criteria, estimates
**Output:** Execution status and completion
**Protocol:**
- Receive complete task list
- Receive dependency map
- Receive acceptance criteria
- Receive estimates and risks
- Execute and report status

### To Domain Skills

**When:** Technical task execution needed
**Input:** Task with technical requirements
**Output:** Task completion
**Protocol:**
- Provide task description
- Provide acceptance criteria
- Receive task completion
- Verify acceptance criteria

### To systematic-debugging-pro

**When:** Blocker or issue occurs
**Input:** Issue details and context
**Output:** Root cause and resolution
**Protocol:**
- Provide issue description
- Provide context and logs
- Receive diagnosis
- Implement resolution

### To testing-pro

**When:** Verification needed
**Input:** Tasks to verify
**Output:** Verification results
**Protocol:**
- Provide tasks and acceptance criteria
- Receive verification results
- Address failures
- Mark tasks complete

### To feedback-pro

**When:** Execution review needed
**Input:** Execution results
**Output:** Quality assessment
**Protocol:**
- Provide execution results
- Request quality review
- Receive assessment
- Incorporate feedback

### To git-operations-pro

**When:** Version control needed
**Input:** Changes to commit
**Output:** Commit status
**Protocol:**
- Provide changes
- Request commit
- Receive commit status
- Track version

## Conflict Resolution

### Conflicts with writing-plans-pro

**Scenario:** Execution reveals plan issues
**Resolution:**
- Pause execution
- Communicate plan issues to writing-plans-pro
- Adjust plan
- Resume execution

### Conflicts with Domain Skills

**Scenario:** Technical approach issues
**Resolution:**
- Consult with domain skill
- Adjust technical approach
- Re-validate
- Continue execution

### Conflicts with systematic-debugging-pro

**Scenario:** Debugging reveals deeper issues
**Resolution:**
- Accept diagnosis
- Implement recommended fix
- Verify fix
- Resume execution

### Conflicts with planning-pro

**Scenario:** Milestone conflicts with detailed execution
**Resolution:**
- Review milestone structure
- Adjust execution or milestone
- Ensure consistency
- Update both

## Quality Gates

### Before executing-plans-pro

- [ ] Plan received from writing-plans-pro
- [ ] Dependencies understood
- [ ] Resources available
- [ ] Checkpoints defined

### During executing-plans-pro

- [ ] Domain skills consulted for technical execution
- [ ] Blockers handled with systematic-debugging-pro
- [ ] Verification done with testing-pro
- [ ] Version control with git-operations-pro

### After executing-plans-pro

- [ ] Execution reviewed with feedback-pro
- [ ] Lessons learned documented
- [ ] Stakeholders informed
- [ ] Plan updated if needed
