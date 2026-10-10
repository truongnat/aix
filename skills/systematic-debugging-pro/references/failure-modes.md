# Failure Modes in Systematic Debugging

## Overview

Systematic debugging can fail in predictable ways. Recognizing these patterns allows mitigation and recovery.

## Primary Failure Modes

### 1. Symptom Chasing

**Pattern:** Fixing symptoms without identifying root cause.

**Symptoms:**
- Fix addresses immediate error but issue recurs
- Multiple fixes applied to same symptom
- Issue keeps coming back in different forms
- No understanding of why fix works

**Causes:**
- Time pressure to "just fix it"
- Skipping Analyze phase
- Treating proximate cause as root cause
- Lack of hypothesis-driven investigation

**Mitigation:**
- Follow four-phase process systematically
- Always ask "why" multiple times (5 Whys)
- Don't stop at first plausible explanation
- Document root cause, not just fix

**Recovery:**
- Stop applying symptom fixes
- Return to Analyze phase
- Form new hypotheses about deeper cause
- Trace from symptom to root cause

### 2. Confirmation Bias

**Pattern:** Only seeking evidence that supports initial hypothesis.

**Symptoms:**
- Ignoring contradictory evidence
- Designing experiments that can only confirm
- Dismissing data that doesn't fit hypothesis
- Sticking with first hypothesis despite evidence

**Causes:**
- Cognitive bias toward being right
- Emotional investment in hypothesis
- Time pressure to move quickly
- Overconfidence in initial assessment

**Mitigation:**
- Actively seek disconfirming evidence
- Test multiple hypotheses in parallel
- Have others review hypotheses
- Document all evidence, not just supporting

**Recovery:**
- Acknowledge bias may be present
- Review all evidence objectively
- Form alternative hypotheses
- Test with experiments that could disprove

### 3. Premature Fixes

**Pattern:** Implementing fixes before root cause is identified.

**Symptoms:**
- Fix applied without clear hypothesis
- Multiple simultaneous changes
- "Try this and see if it works" approach
- No verification that fix addresses root cause

**Causes:**
- Desire to appear productive
- Impatience with investigation
- Belief that trial-and-error is faster
- Pressure to resolve quickly

**Mitigation:**
- Require hypothesis before any code change
- Only one change at a time
- Verify each change individually
- Document rationale for each fix

**Recovery:**
- Roll back premature fixes
- Return to hypothesis formation
- Test hypotheses systematically
- Implement only after root cause confirmed

### 4. Incomplete Verification

**Pattern:** Fix verified only at symptom level, not comprehensive.

**Symptoms:**
- Original symptom gone but other issues appear
- Fix breaks related functionality
- Regression bugs introduced
- No regression tests added

**Causes:**
- Rushing to completion
- Testing only the happy path
- Not considering edge cases
- Lack of defense-in-depth thinking

**Mitigation:**
- Verify fix at multiple levels
- Test related functionality
- Add regression tests
- Monitor production after deployment

**Recovery:**
- Perform comprehensive verification
- Test for regressions
- Add missing regression tests
- Monitor for unintended consequences

### 5. Cargo Cult Debugging

**Pattern:** Applying fixes that worked in other contexts without understanding.

**Symptoms:**
- Using solutions from Stack Overflow blindly
- Applying patterns without understanding why they work
- Copying fixes from similar but different issues
- No adaptation to current context

**Causes:**
- Lack of deep understanding
- Time pressure to find quick fix
- Reliance on external solutions
- Not questioning why fix works

**Mitigation:**
- Understand why fix works before applying
- Adapt solution to current context
- Test hypothesis before implementing fix
- Document rationale for fix

**Recovery:**
- Remove cargo cult fixes
- Understand actual root cause
- Design appropriate fix for context
- Verify fix addresses actual issue

### 6. Shotgun Debugging

**Pattern:** Changing many things at once hoping something works.

**Symptoms:**
- Multiple simultaneous code changes
- Configuration changes without clear reason
- "Try everything" approach
- Unable to identify which change fixed issue

**Causes:**
- Frustration with investigation
- Belief that more changes = better chance
- Lack of systematic approach
- Time pressure

**Mitigation:**
- One change at a time
- Each change tied to hypothesis
- Test each change individually
- Document what each change does

**Recovery:**
- Revert all changes
- Return to systematic approach
- Form clear hypothesis
- Test one change at a time

### 7. Ignoring Context

**Pattern:** Debugging without considering environment, recent changes, or system state.

**Symptoms:**
- Fix works in dev but not production
- Missing environmental factors
- Not checking recent deployments
- Ignoring system metrics/logs

**Causes:**
- Focus only on code
- Not gathering context upfront
- Assuming environment is consistent
- Not checking system state

**Mitigation:**
- Always gather context first
- Check recent changes
- Review system metrics and logs
- Consider environment differences

**Recovery:**
- Gather missing context
- Compare environments
- Check recent changes
- Incorporate context into analysis

### 8. Not Documenting Learning

**Pattern:** Fixing issue without capturing what was learned.

**Symptoms:**
- Same issue occurs again later
- No record of root cause
- Team doesn't learn from debugging
- No regression tests added

**Causes:**
- Moving to next issue immediately
- Not valuing documentation
- Lack of process for capture
- No time allocated for documentation

**Mitigation:**
- Require documentation as part of Verify phase
- Add regression tests automatically
- Create post-mortem for significant issues
- Share learning with team

**Recovery:**
- Document root cause retroactively
- Add regression tests
- Create post-mortem if significant
- Share learning with team

## Detection Signals

### Early Warning Signs

- Fix applied without clear hypothesis
- Multiple changes made simultaneously
- Only symptom checked in verification
- Same issue recurring in different forms
- Team not learning from debugging

### Mid-Process Checkpoints

- Is hypothesis clear and testable?
- Are experiments controlled and repeatable?
- Is root cause identified, not just proximate cause?
- Is verification comprehensive?
- Is learning documented?

### Health Metrics

- **Root cause accuracy:** % of fixes addressing actual root cause
- **Regression rate:** % of fixes that break other things
- **Recurrence rate:** % of issues that happen again
- **Documentation rate:** % of issues with documented learning

## Recovery Strategies

### When Symptom Chasing Detected

1. Stop applying symptom fixes
2. Return to Analyze phase
3. Form new hypotheses about deeper cause
4. Trace from symptom to root cause
5. Implement fix targeting root cause

### When Confirmation Bias Detected

1. Acknowledge potential bias
2. Review all evidence objectively
3. Form alternative hypotheses
4. Design experiments that could disprove
5. Test all hypotheses systematically

### When Premature Fixes Detected

1. Roll back premature fixes
2. Return to hypothesis formation
3. Test hypotheses systematically
4. Implement only after root cause confirmed
5. Verify comprehensively

### When Incomplete Verification Detected

1. Perform comprehensive verification
2. Test for regressions
3. Add missing regression tests
4. Monitor production after deployment
5. Document verification results

## Prevention Checklist

### Before Starting Debugging

- [ ] Four-phase process understood
- [ ] Context gathered (environment, changes, state)
- [ ] Symptom clearly defined
- [ ] Commitment to systematic approach

### During Investigation

- [ ] Hypothesis formed before any changes
- [ ] Multiple hypotheses considered
- [ ] Experiments controlled and repeatable
- [ ] Evidence for and against each hypothesis

### During Fix Implementation

- [ ] One change at a time
- [ ] Each change tied to hypothesis
- [ ] Fix targets root cause, not symptom
- [ ] Fix rationale documented

### During Verification

- [ ] Original symptom resolved
- [ ] Related functionality tested
- [ ] Regression tests added
- [ ] Production monitoring if applicable

### After Completion

- [ ] Root cause documented
- [ ] Learning captured
- [ ] Team informed if significant
- [ ] Process reviewed for improvement
