# Policy Documentation

**Version:** 1.0.0
**Total Rules:** 5

This documentation is automatically generated from `.harness/policies.json`. Do not edit manually.

## Phase Gate Policies

### Plan Approval Required

**ID:** `phase-gate-plan`
**Severity:** error

harness-run requires an approved plan before implementation can begin

#### Conditions

| Type | Operator | Value |
|------|----------|-------|
| command | equals | `harness-run` |
| state | not_exists | `current_plan:approved` |

#### Action

**Type:** block
**Message:** Plan must be approved before implementation
**Next Command:** `harness-plan`
**Questions:**
- Which plan should be approved before implementation?


### Verification Required Before Ship

**ID:** `phase-gate-verify`
**Severity:** error

harness-ship requires verified VERIFY.md with explicit status and evidence

#### Conditions

| Type | Operator | Value |
|------|----------|-------|
| command | equals | `harness-ship` |
| state | not_exists | `verify:approved` |

#### Action

**Type:** block
**Message:** Verification must be completed and approved before shipping
**Next Command:** `harness-verify`
**Questions:**
- What verification evidence is still missing?


### Implementation Evidence Required

**ID:** `phase-gate-implementation-evidence`
**Severity:** error

harness-verify requires implementation evidence (completed tasks or tool runs)

#### Conditions

| Type | Operator | Value |
|------|----------|-------|
| command | equals | `harness-verify` |
| state | not_exists | `implementation_evidence` |

#### Action

**Type:** block
**Message:** No implementation evidence found for verification
**Next Command:** `harness-run`
**Questions:**
- What implementation work should be verified?

## Test-First Policies

### Test-First Discipline

**ID:** `test-first-enforcement`
**Severity:** error

Source file edits require corresponding test file with failing assertion

#### Conditions

| Type | Operator | Value |
|------|----------|-------|
| file_pattern | matches | `src/**` |

#### Action

**Type:** block
**Message:** Test-first discipline violated: editing source without corresponding test
**Questions:**
- Create or update the corresponding test file first

## Scope Guard Policies

### Scope Guard

**ID:** `scope-guard`
**Severity:** warning

Edits must stay within scope defined in goal artifact or plan

#### Conditions

| Type | Operator | Value |
|------|----------|-------|
| file_pattern | matches | `**` |

#### Action

**Type:** warn
**Message:** Edit may be outside approved scope
**Questions:**
- Is this edit within the approved goal scope?
