# Hypothesis-Driven Investigation

## Overview

Hypothesis-driven investigation forms testable explanations for bugs, then systematically validates or rejects them through experiments. This prevents random troubleshooting and ensures efficient debugging.

## Hypothesis Formation

### Characteristics of Good Hypotheses

**Testable:** Can be proven true or false
**Specific:** Makes a clear prediction
**Falsifiable:** There's evidence that would disprove it
**Actionable:** If true, leads to specific fix

**Example:**
- **Bad:** "Something is wrong with the database"
- **Good:** "The database connection pool is exhausted under load, causing timeouts"

### Hypothesis Sources

**Error Messages:** Parse error text for clues
**Code Inspection:** Identify suspicious patterns
**Data Flow:** Trace where data could be corrupted
**Recent Changes:** Look at what changed
**System State:** Check logs, metrics, environment

**Example Process:**
```
Observation: API returns 500 error
Hypothesis 1: Database connection exhausted (from error log)
Hypothesis 2: Memory leak causing OOM (from metrics)
Hypothesis 3: Race condition in concurrent requests (from code review)
```

### Hypothesis Prioritization

Rank hypotheses by:
1. **Likelihood:** How probable based on evidence
2. **Testability:** How easy to validate
3. **Impact:** If true, how severe
4. **Speed:** How fast to test

**Prioritization Matrix:**
```
High Likelihood + Easy to Test → Test first
High Likelihood + Hard to Test → Plan test, maybe defer
Low Likelihood + Easy to Test → Quick test to rule out
Low Likelihood + Hard to Test → Defer or skip
```

## Experiment Design

### Experiment Structure

1. **Objective:** What hypothesis are you testing?
2. **Method:** How will you test it?
3. **Expected Result:** What if hypothesis is true?
4. **Actual Result:** What actually happened?
5. **Conclusion:** Hypothesis confirmed or rejected?

### Types of Experiments

**Code Instrumentation:** Add logging to validate assumptions
**Controlled Input:** Test with specific data
**Environment Variation:** Change configuration
**Load Testing:** Simulate production conditions
**Code Modification:** Temporarily change behavior

**Example:**
```
Hypothesis: Database connection pool exhausted
Experiment: Monitor pool metrics under load
Expected: Pool usage reaches max under load
Actual: Pool usage at 50% under load
Conclusion: Hypothesis rejected
```

### Experiment Quality

**Controlled:** Only one variable changes
**Repeatable:** Same conditions produce same results
**Measurable:** Clear pass/fail criteria
**Documented:** Results recorded for analysis

## Hypothesis Testing

### Testing Process

1. **Set up experiment:** Prepare environment/data
2. **Execute experiment:** Run test
3. **Observe results:** Collect data
4. **Analyze results:** Compare to expected
5. **Draw conclusion:** Confirm or reject hypothesis

### Decision Rules

**Confirm Hypothesis:**
- Results match expected outcome
- Evidence strongly supports hypothesis
- Alternative explanations ruled out

**Reject Hypothesis:**
- Results contradict expected outcome
- Evidence clearly against hypothesis
- Alternative explanation more likely

**Inconclusive:**
- Results unclear or ambiguous
- Need more data or better experiment
- Refine hypothesis or experiment

### Iteration

If hypothesis rejected:
1. Form new hypothesis based on findings
2. Design new experiment
3. Repeat testing process

If hypothesis confirmed:
1. Proceed to root cause analysis
2. Design fix targeting hypothesis
3. Verify fix resolves issue

## Common Pitfalls

### Confirmation Bias

**Pattern:** Only looking for evidence that supports hypothesis
**Mitigation:** Actively seek disconfirming evidence

**Example:**
- **Bad:** "I think it's X, let me check if X happened"
- **Good:** "I think it's X, let me check if X could NOT have happened"

### Multiple Hypotheses Tested Simultaneously

**Pattern:** Changing multiple things at once
**Mitigation:** Test one variable at a time

**Example:**
- **Bad:** Change code and config together
- **Good:** Change code first, test; then change config, test

### Untestable Hypotheses

**Pattern:** Hypothesis too vague to test
**Mitigation:** Make hypothesis specific and measurable

**Example:**
- **Bad:** "Performance is slow"
- **Good:** "Response time > 2s under 100 concurrent requests"

### Sticking to First Hypothesis

**Pattern:** First hypothesis must be right
**Mitigation:** Test multiple hypotheses in parallel or sequence

**Example:**
- **Bad:** "It's X, let me prove it's X"
- **Good:** "It might be X, Y, or Z; let me test each"

## Documentation

### Hypothesis Log

Track hypotheses and experiments:
```
Hypothesis 1: Database pool exhausted
Experiment: Monitor pool metrics
Result: Pool at 50%, not exhausted
Conclusion: Rejected

Hypothesis 2: Race condition
Experiment: Add logging for timing
Result: Timing shows race condition
Conclusion: Confirmed
```

### Learning Capture

Document what was learned:
- Which hypotheses were tested
- What experiments revealed
- What didn't work (to avoid repeating)
- Root cause identified

## Integration with Four-Phase Process

### In Analyze Phase

Hypothesis-driven investigation is the core of Phase 3 (Analyze):
- Form hypotheses based on isolation and reproduction
- Design and execute experiments
- Confirm or reject systematically
- Identify root cause

### With Other Phases

- **Isolate:** Hypotheses about scope
- **Reproduce:** Hypotheses about conditions
- **Verify:** Hypotheses about fix effectiveness

## Advanced Techniques

### Binary Search Debugging

Use binary search approach with hypotheses:
- Split problem space in half
- Test which half contains issue
- Repeat until narrow enough

### Differential Debugging

Compare working vs non-working states:
- Hypothesis: Difference X causes issue
- Test: Remove difference, see if issue resolves

### Fault Injection

Introduce faults to test hypotheses:
- Hypothesis: System handles condition X poorly
- Test: Inject condition X, observe behavior

## Metrics

### Hypothesis Quality

- **Confirmation rate:** % of hypotheses that are correct
- **Test coverage:** % of possible hypotheses tested
- **Iteration count:** Average hypotheses tested per issue
- **Time per hypothesis:** Average time to test each hypothesis

### Investigation Quality

- **Root cause accuracy:** % of issues where root cause correctly identified
- **Time to root cause:** Average time from hypothesis to root cause
- **Experiment success rate:** % of experiments that produce clear results
