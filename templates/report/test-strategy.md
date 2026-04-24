# Test Strategy — {{scope}}

> **Date:** {{date}}  
> **Author:** {{author}}  
> **Reviewers:** {{reviewers}}  
> **Status:** Draft | In Review | Approved  
> **Version:** {{version}}  
> **Target Release:** {{release}}

---

## Executive Summary

<!-- 3-5 sentences: scope, risk posture, test pyramid shape, exit criteria, key recommendations -->

**Overall Test Coverage Target:** {{percentage}}%  
**Risk Level:** 🔴 High | 🟡 Medium | 🔵 Low  
**Confidence in Strategy:** High | Medium | Low

---

## Scope Definition

### In Scope
- **Features:** {{features}}
- **Components:** {{components}}
- **Platforms:** {{platforms}}
- **Integration points:** {{integrations}}
- **User flows:** {{flows}}

### Out of Scope
- {{exclusion_1}}
- {{exclusion_2}}
- {{exclusion_3}}

**Rationale:** {{why_out_of_scope}}

---

## Risk Assessment

| Risk / Hotspot | Probability | Impact | Test Layer | Owner | Mitigation |
|----------------|-------------|--------|------------|-------|------------|
| {{risk_1}} | High / Medium / Low | Critical / High / Medium / Low | Unit / Integration / E2E | {{owner}} | {{mitigation}} |
| {{risk_2}} | High / Medium / Low | Critical / High / Medium / Low | Unit / Integration / E2E | {{owner}} | {{mitigation}} |
| {{risk_3}} | High / Medium / Low | Critical / High / Medium / Low | Unit / Integration / E2E | {{owner}} | {{mitigation}} |

---

## Test Pyramid

| Layer | What to Automate | Approximate Share | Target Coverage | Rationale |
|-------|------------------|-------------------|-----------------|-----------|
| Unit Tests | Pure functions, business logic, utilities | 70-80% | {{percentage}}% | Fast, reliable, cheap |
| Integration Tests | API contracts, database interactions, external services | 15-20% | {{percentage}}% | Validate integration points |
| E2E Tests | Critical user journeys, happy paths | 5-10% | {{percentage}}% | Validate end-to-end flows |
| Manual Tests | Exploratory testing, UX validation, edge cases | 5% | N/A | Human intuition needed |

**Current Pyramid:** {{current_state}}  
**Target Pyramid:** {{target_state}}

---

## Test Categories

### Functional Testing
- **Happy path testing:** {{scope}}
- **Edge case testing:** {{scope}}
- **Error handling:** {{scope}}
- **Boundary conditions:** {{scope}}
- **Data validation:** {{scope}}

### Non-Functional Testing
- **Performance testing:** {{scope}}
- **Security testing:** {{scope}}
- **Accessibility testing:** {{scope}}
- **Compatibility testing:** {{scope}}
- **Reliability testing:** {{scope}}

### Testing by Component
| Component | Test Type | Coverage Target | Status |
|-----------|-----------|-----------------|--------|
| {{component_1}} | Unit / Integration / E2E | {{percentage}}% | Planned / In Progress | Complete |
| {{component_2}} | Unit / Integration / E2E | {{percentage}}% | Planned / In Progress | Complete |
| {{component_3}} | Unit / Integration / E2E | {{percentage}}% | Planned / In Progress | Complete |

---

## Explicitly Not Testing

| Exclusion | Rationale | Risk Mitigation |
|-----------|-----------|-----------------|
| {{exclusion_1}} | {{reason}} | {{mitigation}} |
| {{exclusion_2}} | {{reason}} | {{mitigation}} |
| {{exclusion_3}} | {{reason}} | {{mitigation}} |

---

## CI/CD Integration

### Required Checks
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Security scan passes
- [ ] Code coverage ≥ {{percentage}}%

### Artifacts on Failure
- **Test reports:** {{location}}
- **Screenshots:** {{location}}
- **Logs:** {{location}}
- **Coverage reports:** {{location}}

### Flake Policy
- **Flake threshold:** {{threshold}} failures
- **Retry strategy:** {{strategy}}
- **Quarantine process:** {{process}}

### Test Execution Time
- **Target:** {{duration}}
- **Current:** {{duration}}
- **Optimization plan:** {{plan}}

---

## Tooling and Infrastructure

### Test Frameworks
- **Unit testing:** {{framework}} ({{version}})
- **Integration testing:** {{framework}} ({{version}})
- **E2E testing:** {{framework}} ({{version}})
- **Performance testing:** {{framework}} ({{version}})

### Test Data Management
- **Test data source:** {{source}}
- **Data refresh strategy:** {{strategy}}
- **PII handling:** {{approach}}
- **Data isolation:** {{approach}}

### Test Environment
- **Environment:** {{env}}
- **Database:** {{database}} ({{version}})
- **Mock services:** {{services}}
- **Configuration:** {{config}}

---

## Quality Metrics (Quality, Not Theater)

| Signal | Target | How Measured | Current | Trend |
|--------|--------|--------------|---------|-------|
| Code coverage | {{percentage}}% | {{method}} | {{value}}% | ↑ / ↓ / → |
| Test pass rate | {{percentage}}% | {{method}} | {{value}}% | ↑ / ↓ / → |
| Flaky test rate | <{{percentage}}% | {{method}} | {{value}}% | ↑ / ↓ / → |
| Test execution time | <{{duration}} | {{method}} | {{value}} | ↑ / ↓ / → |
| Defect escape rate | <{{percentage}}% | {{method}} | {{value}}% | ↑ / ↓ / → |

---

## Exit Criteria

### Release Readiness
- [ ] All critical tests passing
- [ ] Code coverage ≥ {{percentage}}%
- [ ] No P0/P1 bugs in scope
- [ ] Performance tests meet SLO
- [ ] Security tests pass
- [ ] Accessibility tests pass
- [ ] Documentation updated
- [ ] Test execution time within SLA

### Quality Gates
- **Gate 1 (Commit):** {{criteria}}
- **Gate 2 (PR):** {{criteria}}
- **Gate 3 (Staging):** {{criteria}}
- **Gate 4 (Production):** {{criteria}}

---

## Residual Risks

Even with this strategy, the following risks remain:

1. **Risk:** {{risk_1}}
   - **Probability:** High / Medium / Low
   - **Impact:** Critical / High / Medium / Low
   - **Mitigation:** {{mitigation}}

2. **Risk:** {{risk_2}}
   - **Probability:** High / Medium / Low
   - **Impact:** Critical / High / Medium / Low
   - **Mitigation:** {{mitigation}}

3. **Risk:** {{risk_3}}
   - **Probability:** High / Medium / Low
   - **Impact:** Critical / High / Medium / Low
   - **Mitigation:** {{mitigation}}

---

## Timeline and Milestones

| Milestone | Target Date | Owner | Status |
|-----------|-------------|-------|--------|
| Test plan approved | {{date}} | {{owner}} | Planned / Complete |
| Test infrastructure ready | {{date}} | {{owner}} | Planned / Complete |
| Unit tests complete | {{date}} | {{owner}} | Planned / Complete |
| Integration tests complete | {{date}} | {{owner}} | Planned / Complete |
| E2E tests complete | {{date}} | {{owner}} | Planned / Complete |
| Performance tests complete | {{date}} | {{owner}} | Planned / Complete |
| Test strategy review | {{date}} | {{owner}} | Planned / Complete |

---

## Appendix

### Test Case Inventory
- **Total test cases:** {{count}}
- **Automated:** {{count}} ({{percentage}}%)
- **Manual:** {{count}} ({{percentage}}%)
- **Test case repository:** {{link}}

### References
- **Test standards:** {{link}}
- **Industry best practices:** {{link}}
- **Team guidelines:** {{link}}

---

## Related

- Workflow: [`workflows/dev/test-strategy.md`](../../workflows/dev/test-strategy.md)
- Conventions: [`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)

