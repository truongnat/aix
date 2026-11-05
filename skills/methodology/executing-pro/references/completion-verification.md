# Completion Verification

## Overview

Completion verification confirms that work meets acceptance criteria, integrates correctly, and doesn't introduce regressions. This ensures quality before marking tasks as complete.

## Verification Levels

### Task-Level Verification

**Scope:** Individual task completion

**Activities:**
- Verify task acceptance criteria
- Test task functionality
- Check code quality
- Review implementation

**When:** After each task completes

**Owner:** Task implementer

### Integration Verification

**Scope:** Integration between tasks or components

**Activities:**
- Test integration points
- Verify data flow
- Check API contracts
- Validate end-to-end scenarios

**When:** After related tasks complete

**Owner:** QA or integration tester

### System Verification

**Scope:** Entire system or feature

**Activities:**
- End-to-end testing
- User acceptance testing
- Performance testing
- Security testing

**When:** After feature or milestone completion

**Owner:** QA team or stakeholders

## Verification Process

### Step 1: Review Acceptance Criteria

**Actions:**
- Review task acceptance criteria
- Verify criteria are clear and testable
- Identify test cases needed

**Output:** Test plan

### Step 2: Execute Verification Tests

**Actions:**
- Run unit tests
- Run integration tests
- Perform manual testing
- Execute automated tests

**Output:** Test results

### Step 3: Analyze Results

**Actions:**
- Review test results
- Identify failures
- Analyze failure causes
- Determine impact

**Output:** Analysis report

### Step 4: Address Failures

**Actions:**
- Fix identified issues
- Re-run tests
- Verify fixes
- Document resolution

**Output:** Fixed issues

### Step 5: Verify Completion

**Actions:**
- Confirm all acceptance criteria met
- Verify no regressions
- Document completion
- Mark task as complete

**Output:** Task completion

## Verification Types

### Functional Verification

**Purpose:** Verify functionality works as specified

**Activities:**
- Test happy path
- Test edge cases
- Test error conditions
- Test user workflows

**Tools:**
- Unit tests
- Integration tests
- End-to-end tests
- Manual testing

### Non-Functional Verification

**Purpose:** Verify non-functional requirements

**Activities:**
- Performance testing
- Security testing
- Accessibility testing
- Compatibility testing

**Tools:**
- Performance profilers
- Security scanners
- Accessibility audit tools
- Compatibility test suites

### Regression Verification

**Purpose:** Verify no regressions introduced

**Activities:**
- Run existing test suite
- Test related functionality
- Check for side effects
- Monitor production metrics

**Tools:**
- Regression test suite
- Automated testing
- Monitoring systems

## Common Verification Issues

### Incomplete Verification

**Pattern:** Only testing happy path

**Problem:** Edge cases and errors not tested

**Fix:** Test all acceptance criteria, including edge cases

### Missing Integration Testing

**Pattern:** Testing components in isolation only

**Problem:** Integration failures discovered late

**Fix:** Add integration tests for all integration points

### No Regression Testing

**Pattern:** Not testing for regressions

**Problem:** New changes break existing functionality

**Fix:** Always run regression tests after changes

### Unclear Acceptance Criteria

**Pattern:** Criteria not verifiable or testable

**Problem:** Verification ambiguous, quality issues

**Fix:** Ensure all acceptance criteria are verifiable before execution

## Quality Checklist

### Before Verification

- [ ] Acceptance criteria clear and testable
- [ ] Test plan defined
- [ ] Test environment ready
- [ ] Test data prepared

### During Verification

- [ ] All acceptance criteria tested
- [ ] Edge cases tested
- [ ] Integration points tested
- [ ] Regressions checked

### After Verification

- [ ] All criteria met
- [ ] No regressions introduced
- [ ] Issues documented
- [ ] Completion verified
