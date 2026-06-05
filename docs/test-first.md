# Test-First Discipline

Test-first discipline ensures that code changes are validated by tests before implementation.

## Policy

### Test-First Discipline

Source file edits require corresponding test file with failing assertion

**When enforced:** file_pattern matches src/**/*
**Action:** block - Test-first discipline violated: editing source without corresponding test

## Requirements

1. Create or update test file before editing source code
2. Test file must have a failing assertion (test should fail initially)
3. Implement the feature to make the test pass
4. Run tests to verify the implementation
