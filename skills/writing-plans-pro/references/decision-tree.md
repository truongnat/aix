# Decision Tree for Writing Plans

## Overview

This decision tree guides key decisions when writing detailed implementation plans.

## Decision Tree

```
START
│
├─ What is the project risk level?
│  ├─ HIGH RISK
│  │  ├─ Granularity: Fine-grained (subtasks)
│  │  ├─ Estimation: Range-based with buffers
│  │  ├─ Checkpoints: Frequent (daily)
│  │  └─ Criteria: Detailed
│  │
│  ├─ MEDIUM RISK
│  │  ├─ Granularity: Medium-grained (1-3 day tasks)
│  │  ├─ Estimation: Range-based
│  │  ├─ Checkpoints: Milestone-based
│  │  └─ Criteria: Standard
│  │
│  └─ LOW RISK
│     ├─ Granularity: Coarse-grained (features)
│     ├─ Estimation: Range-based or single-point
│     ├─ Checkpoints: Sparse (major gates)
│     └─ Criteria: Minimal
│
├─ What is the team experience level?
│  ├─ NEW TEAM
│  │  ├─ Increase task detail
│  │  ├─ Add more checkpoints
│  │  └─ Provide detailed criteria
│  │
│  └─ EXPERIENCED TEAM
│     ├─ Standard task detail
│     ├─ Standard checkpoints
│     └─ Standard criteria
│
├─ What is the timeline pressure?
│  ├─ TIGHT TIMELINE
│  │  ├─ More frequent checkpoints
│  │  ├─ Clear dependencies
│  │  └─ Buffer time for risks
│  │
│  └─ FLEXIBLE TIMELINE
│     ├─ Standard checkpoints
│     ├─ Standard dependency management
│     └─ Standard risk buffers
│
└─ What is the stakeholder visibility need?
   ├─ HIGH VISIBILITY
   │  ├─ Detailed progress reporting
   │  ├─ More checkpoints
   │  └─ Detailed documentation
   │
   └─ STANDARD VISIBILITY
      ├─ Standard reporting
      ├─ Standard checkpoints
      └─ Standard documentation
```

## Decision Questions

### Risk Level Assessment

**High Risk Indicators:**
- New technology or unfamiliar domain
- Complex integrations
- Tight timeline
- Critical system
- Regulatory requirements

**Medium Risk Indicators:**
- Familiar technology
- Standard integrations
- Reasonable timeline
- Important but not critical
- Standard requirements

**Low Risk Indicators:**
- Well-understood technology
- Simple integrations
- Flexible timeline
- Non-critical system
- Internal tool

### Team Experience Assessment

**New Team Indicators:**
- Team formed recently
- New to technology stack
- New to domain
- Mixed experience levels

**Experienced Team Indicators:**
- Team stable and established
- Experienced with technology
- Experienced with domain
- Consistent experience levels

### Timeline Pressure Assessment

**Tight Timeline Indicators:**
- Fixed deadline
- External dependencies with deadlines
- Market opportunity window
- Regulatory deadline

**Flexible Timeline Indicators:**
- No fixed deadline
- Internal project
- Can adjust scope
- No external pressure

### Visibility Need Assessment

**High Visibility Indicators:**
- Executive stakeholder interest
- Customer-facing project
- High budget
- Strategic importance

**Standard Visibility Indicators:**
- Standard internal project
- Routine maintenance
- Lower budget
- Operational importance

## Quick Reference

### Standard Configuration (Most Common)

- **Granularity:** Medium-grained (1-3 day tasks)
- **Estimation:** Range-based (min/likely/max)
- **Checkpoints:** Milestone-based
- **Criteria:** Standard detail
- **Use when:** Standard development work, medium risk

### High-Risk Configuration

- **Granularity:** Fine-grained (subtasks)
- **Estimation:** Range-based with 50% buffer
- **Checkpoints:** Daily
- **Criteria:** Detailed
- **Use when:** New technology, tight deadline, critical system

### Low-Risk Configuration

- **Granularity:** Coarse-grained (features)
- **Estimation:** Range-based or single-point
- **Checkpoints:** Major gates only
- **Criteria:** Minimal
- **Use when:** Internal tool, experienced team, flexible timeline

### New Team Configuration

- **Granularity:** Medium to fine-grained
- **Estimation:** Range-based with assumptions documented
- **Checkpoints:** Milestone-based with daily check-ins
- **Criteria:** Standard to detailed
- **Use when:** New team, standard risk level
