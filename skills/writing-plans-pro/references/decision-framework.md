# Decision Framework for Writing Plans

## Overview

This framework helps make key decisions when writing detailed implementation plans: granularity level, estimation approach, checkpoint frequency, and acceptance criteria detail.

## Decision 1: Granularity Level

### Question

How detailed should the task breakdown be?

### Options

**Fine-Grained (Subtasks)**
- Break down to subtasks (hours)
- More detailed tracking
- Better visibility
- Higher overhead

**Medium-Grained (Tasks)**
- Break down to tasks (1-3 days)
- Balanced detail and overhead
- Standard approach
- Most common

**Coarse-Grained (Features)**
- Break down to features (weeks)
- Less overhead
- Less visibility
- More flexibility

### Decision Factors

**Choose Fine-Grained When:**
- Task is complex or unfamiliar
- High risk of failure
- Need detailed tracking
- Team is large and distributed

**Choose Medium-Grained When:**
- Standard development work
- Balanced needs
- Team is co-located
- Most common scenario

**Choose Coarse-Grained When:**
- Work is well-understood
- Team is small and experienced
- Flexibility needed
- Low risk

### Trade-offs

| Granularity | Visibility | Overhead | Flexibility | Best For |
|------------|-----------|----------|------------|----------|
| Fine | High | High | Low | Complex, high-risk |
| Medium | Medium | Medium | Medium | Standard work |
| Coarse | Low | Low | High | Simple, low-risk |

## Decision 2: Estimation Approach

### Question

How should estimates be provided?

### Options

**Range-Based (Recommended)**
- Provide min, likely, max
- Communicates uncertainty
- Enables risk planning
- Industry best practice

**Single-Point**
- Provide single number
- Simpler communication
- Doesn't communicate uncertainty
- Not recommended

**Relative (Story Points)**
- Use relative sizing
- Team-based estimation
- Requires calibration
- Good for agile teams

### Decision Factors

**Choose Range-Based When:**
- Uncertainty exists
- Need to communicate risk
- Traditional planning
- Most common scenario

**Choose Relative When:**
- Agile team with velocity
- Historical data available
- Team experienced in estimation
- Continuous delivery

**Choose Single-Point Only When:**
- Work is well-understood
- Low risk
- Stakeholder preference
- Not recommended

### Trade-offs

| Approach | Accuracy | Communication | Complexity | Best For |
|----------|----------|----------------|------------|----------|
| Range | High | Clear | Medium | Most cases |
| Relative | Medium | Requires context | High | Agile teams |
| Single-Point | Low | Misleading | Low | Rare cases |

## Decision 3: Checkpoint Frequency

### Question

How often should verification checkpoints occur?

### Options

**Frequent (Daily)**
- Checkpoints every day
- Early issue detection
- High overhead
- Good for high-risk projects

**Moderate (Milestone-Based)**
- Checkpoints at major milestones
- Balanced overhead and visibility
- Standard approach
- Most common

**Sparse (Major Gates Only)**
- Checkpoints only at major gates
- Low overhead
- Later issue detection
- Good for low-risk projects

### Decision Factors

**Choose Frequent When:**
- High risk of failure
- Complex dependencies
- Inexperienced team
- Critical timeline

**Choose Moderate When:**
- Standard development work
- Balanced needs
- Team is experienced
- Most common scenario

**Choose Sparse When:**
- Low risk work
- Experienced team
- Simple dependencies
- Flexible timeline

### Trade-offs

| Frequency | Detection | Overhead | Risk | Best For |
|-----------|-----------|----------|------|----------|
| Frequent | Early | High | Low | High-risk |
| Moderate | Mid | Medium | Medium | Standard |
| Sparse | Late | Low | High | Low-risk |

## Decision 4: Acceptance Criteria Detail

### Question

How detailed should acceptance criteria be?

### Options

**Detailed**
- Comprehensive criteria for all scenarios
- Clear verification
- Higher upfront effort
- Less ambiguity

**Standard**
- Criteria for main scenarios
- Balanced detail
- Standard approach
- Most common

**Minimal**
- Criteria only for critical paths
- Low upfront effort
- More ambiguity
- Requires trust in team

### Decision Factors

**Choose Detailed When:**
- Critical functionality
- Regulatory requirements
- High quality required
- New team

**Choose Standard When:**
- Standard development work
- Balanced needs
- Experienced team
- Most common scenario

**Choose Minimal When:**
- Low-risk work
- Experienced team
- Time pressure
- Internal tools

### Trade-offs

| Detail | Clarity | Effort | Ambiguity | Best For |
|--------|---------|--------|-----------|----------|
| Detailed | High | High | Low | Critical |
| Standard | Medium | Medium | Medium | Standard |
| Minimal | Low | Low | High | Low-risk |

## Decision Tree

### Start

1. **What is the risk level?**
   - High risk → Frequent checkpoints, detailed criteria, fine-grained tasks
   - Medium risk → Moderate checkpoints, standard criteria, medium-grained tasks
   - Low risk → Sparse checkpoints, minimal criteria, coarse-grained tasks

2. **What is the team experience?**
   - New team → More detail, more checkpoints
   - Experienced team → Standard detail, standard checkpoints

3. **What is the timeline pressure?**
   - Tight timeline → More checkpoints to stay on track
   - Flexible timeline → Standard checkpoints

4. **What is the stakeholder need?**
   - High visibility need → More detail, more frequent reporting
   - Standard visibility need → Standard detail and reporting

## Default Recommendations

### For Standard Development Work

- **Granularity:** Medium-grained (1-3 day tasks)
- **Estimation:** Range-based with assumptions
- **Checkpoints:** Milestone-based
- **Criteria:** Standard detail

### For High-Risk Projects

- **Granularity:** Fine-grained (subtasks)
- **Estimation:** Range-based with buffers
- **Checkpoints:** Frequent (daily)
- **Criteria:** Detailed

### For Low-Risk Work

- **Granularity:** Coarse-grained (features)
- **Estimation:** Range-based or single-point
- **Checkpoints:** Sparse (major gates only)
- **Criteria:** Minimal

## Quality Checklist

### Decision Quality

- [ ] Decision factors considered
- [ ] Trade-offs evaluated
- [ ] Stakeholder input obtained
- [ ] Decision documented with rationale

### Plan Quality

- [ ] Granularity appropriate for context
- [ ] Estimation approach selected
- [ ] Checkpoint frequency defined
- [ ] Criteria detail level set
