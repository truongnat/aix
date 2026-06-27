# Test Design Principles

## Overview

Good tests are behavior-focused, independent, fast, and provide meaningful failure messages. These principles ensure tests drive good design and remain maintainable.

## Core Principles

### 1. Test Behavior, Not Implementation

**Principle:** Tests should verify what the system does, not how it does it.

**Why:** Implementation tests break when code structure changes without behavior change.

**Example:**

**Bad (implementation-focused):**
```javascript
test('uses cache', () => {
  const spy = jest.spyOn(cache, 'get');
  process();
  expect(spy).toHaveBeenCalled();
});
```

**Good (behavior-focused):**
```javascript
test('returns cached result when available', () => {
  cache.set('key', 'value');
  const result = process('key');
  expect(result).toBe('value');
});
```

### 2. Tests Should Be Independent

**Principle:** Each test should run in isolation and not depend on other tests.

**Why:** Dependent tests cause cascading failures and make debugging difficult.

**Guidelines:**
- Each test sets up its own state
- No shared state between tests
- Tests can run in any order
- No test ordering assumptions

**Example:**

**Bad (shared state):**
```javascript
let user;
beforeAll(() => {
  user = createUser();
});

test('user exists', () => {
  expect(user).toBeDefined();
});

test('user can login', () => {
  // Depends on user from previous test
});
```

**Good (independent):**
```javascript
test('user exists', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

test('user can login', () => {
  const user = createUser();
  const result = login(user);
  expect(result).toBe(true);
});
```

### 3. Tests Should Be Fast

**Principle:** Tests should run quickly to enable frequent execution.

**Why:** Slow tests discourage running them frequently, breaking TDD discipline.

**Guidelines:**
- Unit tests: < 100ms each
- Integration tests: < 1s each
- Avoid unnecessary I/O
- Use in-memory databases when possible
- Mock external services

**Example:**

**Bad (slow):**
```javascript
test('saves to database', async () => {
  await db.save(user); // Real database, slow
  const result = await db.find(user.id);
  expect(result).toEqual(user);
});
```

**Good (fast):**
```javascript
test('saves to database', async () => {
  await mockDb.save(user); // In-memory mock
  const result = await mockDb.find(user.id);
  expect(result).toEqual(user);
});
```

### 4. Meaningful Failure Messages

**Principle:** When a test fails, it should clearly indicate what went wrong.

**Why:** Poor failure messages waste time debugging.

**Guidelines:**
- Use descriptive test names
- Include expected vs actual values
- Explain business context in assertions
- Avoid generic assertions

**Example:**

**Bad (generic):**
```javascript
test('processes data', () => {
  const result = process(data);
  expect(result).toBe(true);
});
```

**Good (specific):**
```javascript
test('returns true when valid email provided', () => {
  const result = process('user@example.com');
  expect(result).toBe(true);
});
```

### 5. Test One Thing

**Principle:** Each test should verify a single behavior.

**Why:** Multi-behavior tests make it unclear what failed and why.

**Guidelines:**
- One assertion per test (ideal)
- Multiple assertions only if they test one logical behavior
- Split complex behaviors into multiple tests

**Example:**

**Bad (multiple behaviors):**
```javascript
test('user operations', () => {
  const user = createUser();
  expect(user.id).toBeDefined();
  expect(user.email).toBe('test@example.com');
  expect(login(user)).toBe(true);
  expect(deleteUser(user)).toBe(true);
});
```

**Good (single behavior):**
```javascript
test('creates user with valid email', () => {
  const user = createUser('test@example.com');
  expect(user.email).toBe('test@example.com');
});

test('user can login with correct credentials', () => {
  const user = createUser('test@example.com', 'password');
  expect(login(user, 'password')).toBe(true);
});
```

## Test Organization

### Arrange-Act-Assert Pattern

Structure tests in three phases:

1. **Arrange:** Set up the test state
2. **Act:** Execute the behavior being tested
3. **Assert:** Verify the result

**Example:**
```javascript
test('calculates discount for premium user', () => {
  // Arrange
  const user = createPremiumUser();
  const order = createOrder(100);
  
  // Act
  const discounted = applyDiscount(user, order);
  
  // Assert
  expect(discounted.total).toBe(90); // 10% discount
});
```

### Given-When-Then Pattern (BDD style)

Similar to AAA, but with behavior-focused language:

1. **Given:** The initial context
2. **When:** The action occurs
3. **Then:** The expected outcome

**Example:**
```javascript
test('premium user gets discount', () => {
  // Given
  const user = createPremiumUser();
  const order = createOrder(100);
  
  // When
  const result = applyDiscount(user, order);
  
  // Then
  expect(result.total).toBe(90);
});
```

## Test Naming

### Descriptive Names

Test names should:
- Describe what is being tested
- Indicate the expected outcome
- Use business language when possible

**Pattern:** `[unit] should [expected behavior] when [state/condition]`

**Examples:**
- `userService should return user when valid id provided`
- `shoppingCart should calculate total when items added`
- `paymentProcessor should decline when card expired`

### Avoid Generic Names

**Bad:**
- `test1`, `test2`, `test3`
- `it works`
- `test function`

**Good:**
- `authenticates user with valid credentials`
- `rejects invalid email format`
- `calculates tax correctly for different states`

## Test Data

### Use Representative Data

Tests should use realistic data that represents actual usage.

**Bad:** `test('process', () => process('x'))`
**Good:** `test('processes user email', () => process('user@example.com'))`

### Avoid Magic Values

Use named constants or clearly explain values.

**Bad:**
```javascript
expect(result).toBe(42); // Why 42?
```

**Good:**
```javascript
const EXPECTED_AGE = 42;
expect(result).toBe(EXPECTED_AGE);
```

### Use Builders/Factories

Create test data through helper functions for consistency.

```javascript
function createUser(overrides = {}) {
  return {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  };
}

test('user with admin role', () => {
  const admin = createUser({ role: 'admin' });
  // ...
});
```

## Test Doubles

### When to Use Doubles

Use test doubles (mocks, stubs, fakes) when:
- Testing in isolation from external dependencies
- Simulating edge cases or error conditions
- Improving test performance
- Controlling non-deterministic behavior (time, randomness)

### Mock vs Stub vs Fake

**Mock:** Verify interactions (behavior verification)
```javascript
const mock = jest.fn();
process(mock);
expect(mock).toHaveBeenCalledWith('expected');
```

**Stub:** Provide canned responses (state verification)
```javascript
const stub = { getData: () => 'canned response' };
const result = process(stub);
expect(result).toBe('processed');
```

**Fake:** Working implementation (usually in-memory)
```javascript
const fakeDb = new InMemoryDatabase();
fakeDb.save(user);
```

### Avoid Over-Mocking

**Bad:** Everything mocked, tests become brittle
```javascript
const mockDb = mock(Database);
const mockCache = mock(Cache);
const mockLogger = mock(Logger);
// Test becomes implementation test
```

**Good:** Mock only external dependencies
```javascript
const mockExternalApi = mock(ExternalApi);
const db = new RealDatabase(); // Use real for fast in-memory
```

## Edge Cases and Boundary Testing

### Test Boundaries

Test at the edges of valid input ranges.

```javascript
test('accepts minimum valid value', () => {
  expect(validate(1)).toBe(true);
});

test('accepts maximum valid value', () => {
  expect(validate(100)).toBe(true);
});

test('rejects below minimum', () => {
  expect(validate(0)).toBe(false);
});

test('rejects above maximum', () => {
  expect(validate(101)).toBe(false);
});
```

### Test Null/Undefined/Empty

```javascript
test('handles null input', () => {
  expect(process(null)).toThrow();
});

test('handles undefined input', () => {
  expect(process(undefined)).toBe(default);
});

test('handles empty array', () => {
  expect(process([])).toEqual([]);
});
```

## Test Maintenance

### Refactor Tests Like Code

Tests are code too. Keep them clean:
- Extract common setup into helpers
- Remove duplication
- Improve readability
- Update tests when requirements change

### Delete Obsolete Tests

When functionality is removed, delete its tests. Don't comment them out.

### Keep Tests Simple

Avoid complex logic in tests. If a test is complex, the system being tested might be too complex.

## Anti-Patterns to Avoid

### 1. Implementation Testing

Testing private methods or internal structure.

### 2. Brittle Tests

Tests that break with harmless refactors.

### 3. Slow Tests

Tests that take too long, discouraging frequent runs.

### 4. Flaky Tests

Tests that sometimes pass, sometimes fail.

### 5. Test Code Duplication

Repeated test setup and assertions.

### 6. Over-Specified Tests

Tests that check too many details, making them brittle.

### 7. Test Logic in Tests

Conditional logic or loops in test code.
