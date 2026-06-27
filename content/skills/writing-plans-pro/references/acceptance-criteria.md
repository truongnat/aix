# Acceptance Criteria Definition

## Overview

Acceptance criteria define verifiable success conditions for tasks. Clear criteria ensure tasks are complete and meet requirements.

## Characteristics of Good Acceptance Criteria

### Verifiable

Can be tested and confirmed as met or not met.

**Bad:** "Task should be done well"
**Good:** "API returns 200 status code for valid input"

### Specific

Clear and unambiguous, no room for interpretation.

**Bad:** "Improve performance"
**Good:** "API response time < 200ms for 95th percentile"

### Testable

Can be verified through automated or manual testing.

**Bad:** "Code looks clean"
**Good:** "Code passes all linting rules with no warnings"

### Binary

Either met or not met, no partial completion.

**Bad:** "Mostly working"
**Good:** "All unit tests pass"

## Acceptance Criteria Template

For each task, define:

### Functional Criteria

What the task must do:
- Input → Output mapping
- Expected behavior
- Edge cases handled

### Non-Functional Criteria

How the task must perform:
- Performance requirements
- Security requirements
- Compatibility requirements

### Quality Criteria

Standards the task must meet:
- Code quality
- Documentation
- Testing coverage

## Examples

### API Task

**Task:** Implement POST /api/users

**Functional Criteria:**
- Accepts JSON payload with name, email, password
- Returns 201 with created user object on success
- Returns 400 with error message on validation failure
- Returns 409 if email already exists
- Password is hashed before storage

**Non-Functional Criteria:**
- Response time < 100ms
- Rate limited to 100 requests/minute
- Input sanitized to prevent injection

**Quality Criteria:**
- Unit tests for all code paths
- Integration test with database
- API documentation updated

### Frontend Task

**Task:** Create login form

**Functional Criteria:**
- Form accepts email and password
- Validates email format
- Shows error message on invalid credentials
- Redirects to dashboard on successful login
- Disables submit button during API call

**Non-Functional Criteria:**
- Accessible (WCAG 2.1 AA)
- Responsive on mobile and desktop
- Form submission < 2 seconds

**Quality Criteria:**
- Component tested with React Testing Library
- Accessibility audit passed
- Design matches mockups

### Database Task

**Task:** Create users table

**Functional Criteria:**
- Table has columns: id, name, email, password_hash, created_at
- id is primary key with auto-increment
- email is unique
- password_hash stores bcrypt hash
- created_at defaults to current timestamp

**Non-Functional Criteria:**
- Migration reversible
- No data loss on rollback
- Index on email for query performance

**Quality Criteria:**
- Migration tested in development
- Rollback tested
- Database schema documented

## Edge Cases

### Input Edge Cases

- Empty input
- Null input
- Invalid format
- Extremely large input
- Special characters

### Behavior Edge Cases

- Concurrent operations
- Resource exhaustion
- Network failures
- Timeouts
- Rate limits

### State Edge Cases

- Empty database
- Full database
- Corrupted state
- Inconsistent state

## Integration Points

### Upstream Dependencies

What this task depends on:
- Database schema exists
- API endpoints available
- Third-party services accessible

### Downstream Dependencies

What depends on this task:
- Other tasks that consume output
- UI components that use API
- Monitoring that expects events

### External Integrations

Third-party systems:
- Authentication provider
- Payment gateway
- Email service
- Analytics platform

## Verification Methods

### Automated Verification

- Unit tests
- Integration tests
- End-to-end tests
- Linting
- Static analysis

### Manual Verification

- Manual testing
- Code review
- Design review
- User acceptance testing

### Monitoring Verification

- Metrics collection
- Logging
- Error tracking
- Performance monitoring

## Common Anti-Patterns

### Vague Criteria

**Pattern:** "Make it work" or "Fix the bug"
**Problem:** Not verifiable, subjective
**Fix:** Define specific, testable conditions

### Overly Complex Criteria

**Pattern:** 20+ criteria for simple task
**Problem:** Hard to verify, maintenance burden
**Fix:** Focus on essential criteria, split task if needed

### Implementation Details in Criteria

**Pattern:** "Use function X with parameter Y"
**Problem:** Locks implementation, reduces flexibility
**Fix:** Define what to achieve, not how to achieve it

### Missing Edge Cases

**Pattern:** Only happy path criteria
**Problem:** Edge cases cause failures in production
**Fix:** Include edge cases and error conditions

## Documentation

### In Task Description

Include acceptance criteria directly in task description for clarity.

### In Code Comments

Document criteria in code where verification occurs.

### In Test Files

Test names should reflect criteria being verified.

### In Documentation

Update API docs, user guides, or other documentation as part of criteria.

## Quality Checklist

### Criteria Quality

- [ ] Each criterion is verifiable
- [ ] Each criterion is specific
- [ ] Each criterion is testable
- [ ] Each criterion is binary (pass/fail)

### Coverage

- [ ] Functional requirements covered
- [ ] Non-functional requirements covered
- [ ] Quality requirements covered
- [ ] Edge cases covered

### Integration

- [ ] Upstream dependencies identified
- [ ] Downstream dependencies identified
- [ ] External integrations identified
- [ ] Integration points documented

### Verification

- [ ] Verification method defined for each criterion
- [ ] Automated tests planned where possible
- [ ] Manual verification defined where needed
- [ ] Monitoring defined for ongoing verification
