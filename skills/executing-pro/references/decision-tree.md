# Decision Tree for Executing Plans

## Overview

This decision tree guides key decisions during plan execution.

## Decision Tree

```
START
│
├─ Is progress on track?
│  ├─ YES → Continue execution
│  │  ├─ Is quality acceptable?
│  │  │  ├─ YES → Continue
│  │  │  └─ NO → Address quality issues, then continue
│  │  └─ Are blockers manageable?
│  │     ├─ YES → Continue
│  │     └─ NO → Address blockers, then continue
│  │
│  └─ NO → Is there a critical blocker?
│     ├─ YES → Stop execution
│     │  ├─ Can blocker be resolved quickly?
│     │  │  ├─ YES → Resolve, then continue
│     │  │  └─ NO → Replan
│     │  └─ Is plan still valid?
│     │     ├─ YES → Adjust execution approach
│     │     └─ NO → Replan
│
├─ What is the risk level?
│  ├─ HIGH RISK
│  │  ├─ Checkpoints: Frequent (daily)
│  │  ├─ Verification: Deep
│  │  └─ Intervention: Stop at first issue
│  │
│  ├─ MEDIUM RISK
│  │  ├─ Checkpoints: Moderate (task-based)
│  │  ├─ Verification: Standard
│  │  └─ Intervention: Adjust as needed
│  │
│  └─ LOW RISK
│     ├─ Checkpoints: Sparse (milestone-based)
│     ├─ Verification: Light
│     └─ Intervention: Continue unless major issue
│
└─ What is the criticality?
   ├─ CRITICAL (Production)
   │  ├─ Verification: Deep
   │  ├─ Checkpoints: Frequent
   │  └─ Rollback plan required
   │
   ├─ STANDARD (Staging)
   │  ├─ Verification: Standard
   │  ├─ Checkpoints: Moderate
   │  └─ Rollback plan recommended
   │
   └─ LOW (Development)
      ├─ Verification: Light
      ├─ Checkpoints: Sparse
      └─ Rollback plan optional
```

## Decision Questions

### Progress On Track Assessment

**On Track Indicators:**
- Tasks completing on schedule
- Estimates accurate
- No major blockers
- Quality acceptable

**Off Track Indicators:**
- Tasks behind schedule
- Estimates consistently wrong
- Major blockers present
- Quality issues

### Critical Blocker Assessment

**Critical Blocker Indicators:**
- Blocks all progress
- No clear resolution path
- External dependency failure
- Major technical issue

**Non-Critical Blocker Indicators:**
- Blocks some but not all progress
- Clear resolution path
- Internal issue
- Minor technical issue

### Plan Validity Assessment

**Plan Valid Indicators:**
- Requirements unchanged
- Constraints unchanged
- Approach still feasible
- Timeline achievable

**Plan Invalid Indicators:**
- Requirements changed significantly
- New constraints discovered
- Approach not feasible
- Timeline no longer achievable

### Risk Level Assessment

**High Risk Indicators:**
- New technology
- Critical system
- Tight deadline
- Complex dependencies

**Medium Risk Indicators:**
- Familiar technology
- Important system
- Reasonable deadline
- Standard dependencies

**Low Risk Indicators:**
- Well-understood technology
- Non-critical system
- Flexible deadline
- Simple dependencies

### Criticality Assessment

**Critical Indicators:**
- Production deployment
- Customer-facing
- Revenue impact
- Regulatory requirements

**Standard Indicators:**
- Staging deployment
- Internal system
- Operational impact
- Standard requirements

**Low Indicators:**
- Development environment
- Internal tool
- No operational impact
- Low requirements

## Quick Reference

### Standard Configuration (Most Common)

- **Decision:** Continue unless blocker or plan invalid
- **Checkpoints:** Moderate (task-based)
- **Verification:** Standard
- **Use when:** Standard execution, medium risk

### High-Risk Configuration

- **Decision:** Stop at first issue
- **Checkpoints:** Frequent (daily)
- **Verification:** Deep
- **Rollback:** Required
- **Use when:** Production deployment, critical system

### Low-Risk Configuration

- **Decision:** Continue with minimal intervention
- **Checkpoints:** Sparse (milestone-based)
- **Verification:** Light
- **Rollback:** Optional
- **Use when:** Development environment, internal tool
