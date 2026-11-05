# RED-GREEN-REFACTOR Cycle

## Overview

The TDD cycle consists of three phases: RED (write failing test), GREEN (make it pass), REFACTOR (improve code). This discipline ensures tests drive design and provide safety for refactoring.

## Phase 1: RED - Write Failing Test

**Goal:** Specify desired behavior through a test that fails.

**Steps:**
1. Identify the next small behavior to implement
2. Write a test that verifies this behavior
3. Run the test and confirm it fails
4. Ensure failure message is meaningful

**Principles:**
- Write the simplest possible test for the behavior
- Test should fail for the right reason (behavior not implemented)
- No production code written yet
- Test must be executable (not just a stub)

**Example:**
```javascript
// RED: Test for user authentication
test('authenticates valid user', () => {
  const result = authenticate('user@example.com', 'password123');
  expect(result).toBe(true);
});
// This fails because authenticate() doesn't exist yet
```

**Quality Gates:**
- Test compiles/runs
- Test fails with clear error
- Failure message indicates missing behavior
- Test is independent and fast

## Phase 2: GREEN - Make It Pass

**Goal:** Write the minimal code to make the test pass.

**Steps:**
1. Write the simplest production code that passes the test
2. Run all tests
3. Confirm the new test passes
4. Confirm existing tests still pass

**Principles:**
- Write the absolute minimum code needed
- Don't worry about code quality yet
- No extra features beyond what the test requires
- Hardcoded values acceptable if they satisfy the test

**Example:**
```javascript
// GREEN: Minimal implementation
function authenticate(email, password) {
  if (email === 'user@example.com' && password === 'password123') {
    return true;
  }
  return false;
}
// Test now passes
```

**Quality Gates:**
- New test passes
- All existing tests pass
- No test failures introduced
- Implementation is minimal

## Phase 3: REFACTOR - Improve Code

**Goal:** Improve code structure while maintaining behavior.

**Steps:**
1. Identify improvement opportunities
2. Make small, safe refactorings
3. Run tests after each change
4. Stop when tests fail, fix, then continue

**Principles:**
- Only refactor when all tests pass
- Make small, incremental changes
- Run tests frequently (after each small change)
- Never add new behavior during refactoring

**Example:**
```javascript
// REFACTOR: Extract and generalize
function authenticate(email, password) {
  const validCredentials = {
    'user@example.com': 'password123',
  };
  return validCredentials[email] === password;
}
// Tests still pass, code is more maintainable
```

**Quality Gates:**
- All tests pass before starting
- All tests pass after each change
- No behavior changes
- Code quality improves

## Cycle Discipline

### Never Skip Phases

- **Skipping RED:** Tests become verification, not design
- **Skipping GREEN:** Refactoring without safety net
- **Skipping REFACTOR:** Code quality degrades over time

### Phase Boundaries

- **RED → GREEN:** Write code only to pass the failing test
- **GREEN → REFACTOR:** Only when all tests pass
- **REFACTOR → RED:** After refactoring, back to RED for next feature

### Commit Discipline

- Commit after GREEN (working state)
- Commit after REFACTOR (clean state)
- Never commit with failing tests

## Common Mistakes

### Writing Too Much in GREEN

**Bad:** Implementing multiple features at once
**Good:** One test, one behavior, minimal code

### Refactoring Without GREEN

**Bad:** Changing structure with failing tests
**Good:** All tests green before any refactoring

### Test Not Actually Failing in RED

**Bad:** Test passes immediately (test implementation issue)
**Good:** Test fails for expected reason (missing behavior)

### Adding Features During REFACTOR

**Bad:** "While I'm here, let me add X"
**Good:** Refactoring only, new features in next cycle

## Integration with Development Workflow

### Feature Development

1. Break feature into small behaviors
2. Apply RED-GREEN-REFACTOR for each behavior
3. Repeat until feature complete
4. Integration tests at feature boundaries

### Bug Fixes

1. Write failing test that reproduces bug (RED)
2. Fix bug with minimal change (GREEN)
3. Refactor if needed (REFACTOR)
4. Bug is now prevented by test

### Legacy Code

1. Write characterization tests (document current behavior)
2. Apply RED-GREEN-REFACTOR for new features
3. Refactor with test safety net

## Time Management

### Cycle Duration

- Target: 2-10 minutes per cycle
- If longer: break into smaller behaviors
- If stuck: revert and reconsider approach

### When to Break Discipline

- **Exploratory coding:** Write spike code, then add tests retrospectively
- **Critical bugs:** Fix immediately, add tests after
- **Prototyping:** Skip TDD, add tests if prototype becomes production

## Failure Detection

### Test Never Fails in RED

**Cause:** Test implementation error or behavior already exists
**Fix:** Verify test logic, check if behavior already implemented

### Can't Make Test Pass in GREEN

**Cause:** Test too large, misunderstanding of requirement
**Fix:** Break test into smaller pieces, clarify requirement

### Tests Fail During REFACTOR

**Cause:** Refactoring too large, test coupling to implementation
**Fix:** Revert, make smaller changes, improve test design

## Advanced Techniques

### Test Doubles in RED

- Use mocks/stubs when external dependencies involved
- Ensure doubles match expected interface
- Don't over-mock (tests become brittle)

### Parameterized Tests

- Write one test for multiple cases
- RED: add new case to parameterized test
- GREEN: handle new case
- REFACTOR: improve parameter handling

### Property-Based Testing

- RED: define property that should hold
- GREEN: implement code satisfying property
- REFACTOR: simplify while maintaining property

## Metrics

### Cycle Quality

- **Test-first ratio:** % of code written with failing test first
- **Refactor frequency:** % of GREEN phases followed by REFACTOR
- **Test independence:** % of tests that can run in any order

### Code Quality

- **Test coverage:** Should be high for TDD code
- **Code complexity:** Should remain manageable
- **Duplication:** Should decrease over time
