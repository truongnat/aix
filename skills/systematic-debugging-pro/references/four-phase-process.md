# Four-Phase Debugging Process

## Overview

Systematic debugging follows four phases: Isolate → Reproduce → Analyze → Verify. This disciplined approach prevents symptom chasing and ensures root cause resolution.

## Phase 1: Isolate

**Goal:** Narrow the scope of the problem to a manageable area.

**Steps:**
1. Gather context: environment, stack, recent changes, error messages
2. Define the symptom clearly: what happens vs what should happen
3. Determine scope: which component, module, or system is affected
4. Identify boundaries: what works, what doesn't work
5. Eliminate unrelated factors through controlled tests

**Principles:**
- Don't assume scope; test boundaries
- Use binary search approach: is it in component A or B?
- Document what you've ruled out
- Keep scope as small as possible before proceeding

**Example:**
```
Symptom: API returns 500 error
Isolation:
- Is it all endpoints? No, only /api/users
- Is it all HTTP methods? No, only POST
- Is it all users? No, only new user creation
- Is it database related? Yes, error shows database timeout
Scope narrowed to: new user creation database operation
```

**Quality Gates:**
- Symptom clearly defined
- Scope narrowed to specific component/operation
- Ruled out at least one major subsystem
- Documented what works vs what doesn't

## Phase 2: Reproduce

**Goal:** Create a reliable, minimal reproducer for the issue.

**Steps:**
1. Attempt to reproduce in controlled environment
2. Identify conditions required for reproduction
3. Create minimal test case or script
4. Verify reproducibility is consistent
5. If intermittent, identify conditions that trigger it

**Principles:**
- Can't fix what you can't reproduce
- Minimal reproducer reduces complexity
- Document exact steps to reproduce
- If production-only, gather maximum telemetry

**Example:**
```
Issue: Null pointer in production
Reproduction:
1. Create test with same input data
2. Simulate same load conditions
3. Reproduce error in development
4. Minimal reproducer: single function call with specific input
```

**Quality Gates:**
- Issue reproduced consistently or conditions documented
- Minimal reproducer created
- Steps to reproduce documented
- Environment conditions captured

## Phase 3: Analyze

**Goal:** Identify root cause through hypothesis-driven investigation.

**Steps:**
1. Form hypotheses about potential causes
2. Design experiments to test each hypothesis
3. Execute experiments systematically
4. Trace through code/data flow
5. Identify the actual root cause

**Principles:**
- Hypothesis-driven, not trial-and-error
- Test one hypothesis at a time
- Use debugging tools strategically
- Trace from symptom back to cause

**Example:**
```
Hypothesis 1: Database connection pool exhausted
Experiment: Monitor pool usage during load
Result: Pool not exhausted, hypothesis rejected

Hypothesis 2: Race condition in user creation
Experiment: Add logging to identify timing
Result: Race condition confirmed, root cause found
```

**Quality Gates:**
- Multiple hypotheses considered
- Root cause identified, not just proximate cause
- Evidence supports conclusion
- Alternative explanations ruled out

## Phase 4: Verify

**Goal:** Confirm the fix resolves the issue without introducing new problems.

**Steps:**
1. Implement fix targeting root cause
2. Reproduce original issue to confirm it's fixed
3. Test related functionality for regressions
4. Add regression test to prevent recurrence
5. Monitor in production if applicable

**Principles:**
- Defense-in-depth: verify at multiple levels
- Test fix doesn't break other things
- Add regression tests for learning capture
- Monitor for unintended consequences

**Example:**
```
Fix: Add transaction to user creation
Verification:
1. Original issue no longer reproduces
2. Other user operations still work
3. Added integration test for transaction behavior
4. Monitored production for 24 hours
```

**Quality Gates:**
- Original issue resolved
- No regressions introduced
- Regression test added
- Production monitoring if applicable

## Phase Discipline

### Don't Skip Phases

- **Skipping Isolate:** Wasting time on wrong component
- **Skipping Reproduce:** Fixing without confirmation
- **Skipping Analyze:** Treating symptoms, not root cause
- **Skipping Verify:** Fix may not work or may break things

### Phase Boundaries

- **Isolate → Reproduce:** Only after scope is narrowed
- **Reproduce → Analyze:** Only after issue is reproducible
- **Analyze → Verify:** Only after root cause identified
- **Verify → Done:** Only after fix confirmed

### Iteration Between Phases

If a phase reveals new information:
- Return to earlier phase with new understanding
- Document what was learned
- Adjust approach based on findings
- Continue systematic progression

## Common Mistakes

### Starting with Fix

**Bad:** See error, immediately change code
**Good:** Follow phases systematically

### Treating Proximate Cause

**Bad:** Fix immediate symptom without tracing deeper
**Good:** Trace to root cause, even if it takes longer

### Skipping Verification

**Bad:** Deploy fix without testing
**Good:** Verify fix works and doesn't break things

### Not Documenting Learning

**Bad:** Fix and forget
**Good:** Document root cause and add regression test

## Time Management

### Phase Duration

- **Isolate:** 5-30 minutes
- **Reproduce:** 10-60 minutes
- **Analyze:** 30 minutes to several hours
- **Verify:** 15-60 minutes

If phase takes longer:
- Reassess scope
- Consider if hypothesis is wrong
- Ask for help if stuck
- Document what you've tried

### When to Break Discipline

- **Critical production incident:** Fix immediate symptom, then debug properly
- **Known issue with known fix:** Just implement the fix
- **Exploratory debugging:** Skip phases for investigation, then apply systematically

## Integration with Debugging Tools

### Logging

- Use in Isolate phase to gather context
- Use in Analyze phase to trace execution
- Use in Verify phase to confirm fix

### Breakpoints

- Use in Reproduce phase to inspect state
- Use in Analyze phase to trace flow
- Avoid over-reliance, can slow investigation

### Debuggers

- Use in Analyze phase for complex tracing
- Use for inspecting variable state
- Don't rely solely on debugger, also use logs

### Profilers

- Use in Isolate phase to identify bottlenecks
- Use in Analyze phase for performance issues
- Use in Verify phase to confirm performance improvement

## Metrics

### Phase Quality

- **Isolation accuracy:** % of issues where correct component identified
- **Reproduction rate:** % of issues successfully reproduced
- **Root cause accuracy:** % of fixes that address actual root cause
- **Verification completeness:** % of fixes with regression tests

### Time Metrics

- **Time to isolate:** Average time spent in Phase 1
- **Time to reproduce:** Average time spent in Phase 2
- **Time to analyze:** Average time spent in Phase 3
- **Time to verify:** Average time spent in Phase 4
