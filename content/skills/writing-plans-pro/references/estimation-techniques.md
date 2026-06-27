# Estimation Techniques

## Overview

Estimation provides realistic time and effort forecasts for tasks. Range-based estimates with assumptions reduce uncertainty and improve planning accuracy.

## Range-Based Estimation

### Three-Point Estimation

Use three estimates for each task:

**Optimistic (O):** Best case scenario, everything goes perfectly
**Likely (L):** Most probable scenario, typical conditions
**Pessimistic (P):** Worst case scenario, significant issues

**Formula:** (O + 4L + P) / 6

**Example:**
- Optimistic: 2 hours
- Likely: 4 hours
- Pessimistic: 8 hours
- Expected: (2 + 16 + 8) / 6 = 4.3 hours

### Range Presentation

Present estimates as ranges, not single numbers:

**Format:** "2-6 hours (expected: 4 hours)"

**Benefits:**
- Communicates uncertainty
- Sets realistic expectations
- Allows for risk planning

## Estimation Factors

### Complexity Factors

**Technical Complexity:**
- New technology or unfamiliar domain
- Complex algorithms or data structures
- Integration with multiple systems
- Performance requirements

**Business Complexity:**
- Ambiguous requirements
- Stakeholder conflicts
- Regulatory constraints
- Business rule complexity

### Risk Factors

**Known Risks:**
- Dependencies on other teams
- Third-party API changes
- Legacy system integration
- Data migration complexity

**Unknown Risks:**
- Unexpected technical issues
- Requirement changes
- Resource availability
- External factors

### Resource Factors

**Team Factors:**
- Team experience with technology
- Team size and availability
- Skill gaps
- Communication overhead

**Environmental Factors:**
- Development environment stability
- Tool availability
- Process overhead
- Organizational constraints

## Estimation Techniques

### Historical Data

**Approach:** Use historical data from similar tasks

**Process:**
1. Find similar completed tasks
2. Compare complexity and scope
3. Adjust for differences
4. Apply to current task

**Best For:** Routine, well-understood tasks

**Limitations:** Requires good historical tracking

### Expert Judgment

**Approach:** Leverage team expertise

**Process:**
1. Have multiple experts estimate independently
2. Compare estimates
3. Discuss differences
4. Converge on consensus

**Best For:** Novel tasks, unique requirements

**Limitations:** Subject to bias, requires experienced team

### Decomposition

**Approach:** Break down into smaller, estimable units

**Process:**
1. Decompose task into subtasks
2. Estimate each subtask
3. Sum subtask estimates
4. Add coordination overhead

**Best For:** Large, complex tasks

**Limitations:** Time-consuming, may miss integration overhead

### Planning Poker

**Approach:** Consensus-based estimation

**Process:**
1. Present task to team
2. Each team member selects estimate privately
3. Reveal estimates simultaneously
4. Discuss differences
5. Re-estimate if needed
6. Continue until consensus

**Best For:** Team estimation, collaborative planning

**Limitations:** Requires team availability, can be time-consuming

## Assumption Documentation

### Required Assumptions

For each estimate, document:

**Technical Assumptions:**
- Technology stack assumed
- Frameworks and libraries available
- Development tools in place
- Infrastructure available

**Process Assumptions:**
- Team availability
- Review process
- Testing approach
- Deployment process

**Dependency Assumptions:**
- Dependencies on other tasks
- External service availability
- Third-party API stability
- Data availability

### Assumption Format

**Example:**
```
Estimate: 4-8 hours (expected: 6 hours)

Assumptions:
- Using familiar React patterns
- API endpoints already exist
- No major requirement changes
- Code review within 24 hours
- Testing environment available
```

## Common Mistakes

### Single-Point Estimates

**Pattern:** Providing only one number

**Problem:** Doesn't communicate uncertainty, sets unrealistic expectations

**Fix:** Always provide ranges with expected value

### Optimism Bias

**Pattern:** Underestimating complexity and issues

**Problem:** Estimates consistently too low, timeline overruns

**Fix:** Use three-point estimation, consider pessimistic case

### Padding Without Rationale

**Pattern:** Adding arbitrary buffers

**Problem:** Inconsistent, doesn't address actual risks

**Fix:** Document assumptions and risk factors, justify buffers

### Ignoring Non-Development Work

**Pattern:** Only estimating coding time

**Problem:** Misses testing, review, deployment, documentation

**Fix:** Include all work: coding, testing, review, deployment, documentation

### Not Updating Estimates

**Pattern:** Initial estimate never revisited

**Problem:** New information not incorporated, estimates become stale

**Fix:** Re-estimate as new information emerges

## Estimation Accuracy

### Tracking Estimates

Track actual vs estimated to improve future estimates:

**Metrics:**
- Estimate accuracy (actual / estimated)
- Estimation bias (systematic over/under estimation)
- Estimation variance (consistency of estimates)

### Calibration

Use historical data to calibrate estimates:

**Process:**
1. Collect actual vs estimated data
2. Identify patterns of over/under estimation
3. Adjust estimation process
4. Apply calibration factors

### Continuous Improvement

Regularly review and improve estimation:

**Activities:**
- Post-mortem on estimation accuracy
- Identify estimation patterns
- Refine estimation techniques
- Train team on best practices

## Quality Checklist

### Before Estimating

- [ ] Task requirements clear
- [ ] Dependencies identified
- [ ] Complexity factors considered
- [ ] Risk factors identified
- [ ] Resource factors understood

### During Estimating

- [ ] Use range-based estimation
- [ ] Document assumptions
- [ ] Consider multiple estimation techniques
- [ ] Involve appropriate experts
- [ ] Account for non-development work

### After Estimating

- [ ] Estimates reviewed by team
- [ ] Assumptions validated
- [ ] Risks documented
- [ ] Contingency plans defined
- [ ] Estimates communicated with rationale
