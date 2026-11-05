# Failure Modes in TDD

## Overview

TDD can fail in predictable ways. Recognizing these patterns allows mitigation and recovery.

## Primary Failure Modes

### 1. Test-First Violations

**Pattern:** Writing production code before tests.

**Symptoms:**
- Tests written after implementation
- Tests pass immediately (no RED phase)
- "I'll add tests later" mentality
- Test coverage added retrospectively

**Causes:**
- Time pressure
- Lack of discipline
- Belief that TDD slows development
- Uncertainty about how to test before implementation

**Mitigation:**
- Start with smallest possible test
- Use spike code for exploration, then rewrite with TDD
- Pair programming with TDD discipline
- Track test-first ratio as metric

**Recovery:**
- Stop writing production code
- Write failing test for current work
- Delete or comment out production code
- Restart RED-GREEN-REFACTOR cycle

### 2. Brittle Tests

**Pattern:** Tests break when implementation changes without behavior change.

**Symptoms:**
- Tests fail after refactoring
- Tests check implementation details
- Mocking internal components
- Tests break with harmless code changes

**Causes:**
- Testing implementation instead of behavior
- Over-mocking
- Tight coupling to internal structure
- Test code duplication

**Mitigation:**
- Test behavior through public interfaces
- Use integration tests for end-to-end behavior
- Minimize mocking
- Refactor tests to reduce duplication

**Recovery:**
- Identify if behavior actually changed
- If not, update tests to focus on behavior
- If yes, acknowledge behavior change and update accordingly

### 3. Test Duplication

**Pattern:** Same test logic repeated across multiple tests.

**Symptoms:**
- Similar test setup in many tests
- Repeated assertion patterns
- Copy-pasted test code
- Maintenance burden when logic changes

**Causes:**
- Lack of test helpers
- Test code not treated as production code
- Copy-paste approach to test writing
- Insufficient refactoring of tests

**Mitigation:**
- Extract common setup into helpers
- Use test builders/factories
- Create custom assertions
- Refactor tests like production code

**Recovery:**
- Identify duplicated patterns
- Extract to helper functions
- Replace duplicated code with helpers
- Run tests to verify equivalence

### 4. Coverage Theater

**Pattern:** High test coverage but low actual quality.

**Symptoms:**
- High coverage percentage
- Tests don't catch real bugs
- Meaningless assertions (expect(true).toBe(true))
- Tests that don't verify important behaviors

**Causes:**
- Coverage as primary metric
- Writing tests just to hit coverage targets
- Testing trivial code paths
- Ignoring edge cases and error conditions

**Mitigation:**
- Focus on behavior coverage, not line coverage
- Test important and risky code more thoroughly
- Use mutation testing to verify test quality
- Review tests for meaningfulness

**Recovery:**
- Audit tests for meaningful assertions
- Remove or improve meaningless tests
- Add tests for untested important behaviors
- Use mutation testing to find weak tests

### 5. Slow Test Suite

**Pattern:** Tests take too long to run, discouraging frequent execution.

**Symptoms:**
- Test suite takes minutes or hours
- Developers avoid running tests
- Tests run only in CI, not locally
- RED-GREEN-REFACTOR cycle slowed down

**Causes:**
- Too many integration tests
- Real database/network calls
- No test parallelization
- Accumulated technical debt in tests

**Mitigation:**
- Keep unit tests fast (< 100ms each)
- Use test doubles for external dependencies
- Parallelize test execution
- Separate slow integration tests from fast unit tests

**Recovery:**
- Profile test suite to find slow tests
- Replace slow tests with faster alternatives
- Move slow tests to separate suite
- Add test timeouts to catch regressions

### 6. Flaky Tests

**Pattern:** Tests sometimes pass, sometimes fail without code changes.

**Symptoms:**
- Test fails in CI but passes locally
- Intermittent failures
- Time-dependent failures
- Race conditions

**Causes:**
- Shared state between tests
- Non-deterministic behavior (time, randomness)
- External dependencies (network, databases)
- Poor test isolation

**Mitigation:**
- Ensure test isolation
- Mock non-deterministic sources
- Use fixed time in tests
- Avoid shared state

**Recovery:**
- Identify source of flakiness
- Add deterministic controls (fixed time, seeded randomness)
- Improve test isolation
- If external dependency, mock it

### 7. Test Code Quality Issues

**Pattern:** Test code is messy, hard to understand, or hard to maintain.

**Symptoms:**
- Complex logic in tests
- Tests as long as or longer than production code
- Unclear what test is verifying
- Hard to add new tests

**Causes:**
- Tests not treated as production code
- Lack of refactoring of tests
- Copy-paste accumulation
- No code review for tests

**Mitigation:**
- Apply same quality standards to test code
- Refactor tests regularly
- Code review test changes
- Keep tests simple and focused

**Recovery:**
- Refactor complex tests
- Extract helpers and utilities
- Simplify test logic
- Add comments for complex scenarios

### 8. Over-Specified Tests

**Pattern:** Tests check too many implementation details.

**Symptoms:**
- Tests verify exact method call sequences
- Tests check internal state extensively
- Mocks with exact parameter matching
- Tests fail with harmless refactors

**Causes:**
- Desire for "comprehensive" testing
- Lack of trust in implementation
- Testing implementation instead of behavior
- Over-mocking

**Mitigation:**
- Focus on end behavior
- Use integration tests more
- Relax mock matching (any instance vs exact match)
- Test through public interfaces

**Recovery:**
- Identify over-specified assertions
- Remove unnecessary implementation checks
- Focus on behavior verification
- Use integration tests for comprehensive coverage

## Detection Signals

### Early Warning Signs

- Tests written after implementation
- Test suite growing slower over time
- Frequent test failures during refactoring
- Developers avoiding running tests
- High coverage but low bug detection

### Mid-Cycle Checkpoints

- Did test fail initially (RED)?
- Is test independent of others?
- Does test focus on behavior?
- Is test fast enough?
- Is test code maintainable?

### Health Metrics

- **Test-first ratio:** % of code written with failing test first
- **Test speed:** Average time per test
- **Flakiness rate:** % of intermittent failures
- **Test duplication:** Code duplication in test suite
- **Behavior focus:** % of tests checking behavior vs implementation

## Recovery Strategies

### When Test-First Violations Detected

1. Stop writing production code
2. Write failing test for current work
3. Delete or comment out production code
4. Restart RED-GREEN-REFACTOR cycle
5. Track and report violations

### When Brittle Tests Detected

1. Identify if behavior actually changed
2. If not, update tests to focus on behavior
3. Reduce mocking and implementation checks
4. Add integration tests for end-to-end verification

### When Test Duplication Detected

1. Identify duplicated patterns
2. Extract to helper functions
3. Replace duplicated code
4. Run tests to verify equivalence
5. Review for other duplication opportunities

### When Coverage Theater Detected

1. Audit tests for meaningful assertions
2. Remove or improve meaningless tests
3. Add tests for important behaviors
4. Use mutation testing to find weak tests
5. Focus on behavior coverage metrics

### When Slow Test Suite Detected

1. Profile test suite
2. Identify slow tests
3. Replace with faster alternatives
4. Move slow tests to separate suite
5. Add test timeouts

### When Flaky Tests Detected

1. Identify source of flakiness
2. Add deterministic controls
3. Improve test isolation
4. Mock external dependencies
5. Add retry logic only as last resort

## Prevention Checklist

### Before Starting TDD

- [ ] Testing framework set up and working
- [ ] Test execution fast enough for frequent runs
- [ ] Team trained on TDD principles
- [ ] Code review includes test quality
- [ ] Test-first metrics tracked

### During Development

- [ ] Test written before implementation
- [ ] Test fails initially (RED)
- [ ] Minimal code to pass (GREEN)
- [ ] Refactoring only when green
- [ ] Tests independent and fast

### During Code Review

- [ ] Test-first discipline followed
- [ ] Tests focus on behavior
- [ ] Tests are maintainable
- [ ] No test duplication
- [ ] Tests provide meaningful failures

### During Maintenance

- [ ] Tests updated with behavior changes
- [ ] Obsolete tests deleted
- [ ] Test suite performance monitored
- [ ] Flaky tests addressed promptly
- [ ] Test code refactored regularly
