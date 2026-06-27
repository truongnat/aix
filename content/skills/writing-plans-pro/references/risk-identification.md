# Risk Identification

## Overview

Risk identification surfaces potential blockers, uncertainties, and issues that could impact plan execution. Early identification enables mitigation and contingency planning.

## Risk Categories

### Technical Risks

**Technology Risks:**
- Unfamiliar technology or framework
- Technology limitations
- Performance bottlenecks
- Security vulnerabilities
- Compatibility issues

**Integration Risks:**
- API changes or deprecation
- Third-party service failures
- Integration complexity
- Data migration issues
- System interdependencies

### Process Risks

**Planning Risks:**
- Incomplete requirements
- Changing requirements
- Unrealistic timelines
- Resource constraints
- Scope creep

**Execution Risks:**
- Knowledge gaps
- Communication breakdowns
- Quality issues
- Testing gaps
- Deployment issues

### External Risks

**Dependency Risks:**
- Dependencies on other teams
- Third-party dependencies
- Vendor delays
- Regulatory changes
- Market changes

**Environmental Risks:**
- Infrastructure limitations
- Tool availability
- Process constraints
- Organizational changes
- Resource availability

## Risk Identification Process

### Step 1: Brainstorm Risks

**Approach:** Generate comprehensive list of potential risks

**Techniques:**
- Brainstorming session with team
- Review historical project risks
- Consult subject matter experts
- Analyze similar past projects
- Use risk checklists

### Step 2: Categorize Risks

**Approach:** Group risks by category for systematic analysis

**Categories:**
- Technical
- Process
- External
- Resource
- Schedule
- Scope

### Step 3: Assess Impact

**Approach:** Evaluate potential impact of each risk

**Impact Dimensions:**
- Schedule impact (delay)
- Cost impact (overrun)
- Quality impact (defects)
- Scope impact (reduction)
- Reputation impact (stakeholder trust)

**Impact Levels:**
- Critical: Would prevent project success
- High: Significant impact on project goals
- Medium: Moderate impact, manageable
- Low: Minimal impact

### Step 4: Assess Probability

**Approach:** Estimate likelihood of risk occurrence

**Probability Levels:**
- Very High: >70% likely
- High: 50-70% likely
- Medium: 30-50% likely
- Low: 10-30% likely
- Very Low: <10% likely

### Step 5: Prioritize Risks

**Approach:** Focus on highest-priority risks

**Priority Matrix:**
- High probability + High impact = Critical priority
- High probability + Medium impact = High priority
- Medium probability + High impact = High priority
- Other combinations = Medium or Low priority

## Risk Documentation

### Risk Register Template

```
Risk ID: [Unique identifier]
Risk Description: [Clear description]
Category: [Technical/Process/External/Resource]
Probability: [Very High/High/Medium/Low/Very Low]
Impact: [Critical/High/Medium/Low]
Priority: [Critical/High/Medium/Low]
Owner: [Person responsible]
Mitigation Strategy: [How to reduce likelihood or impact]
Contingency Plan: [What to do if risk occurs]
Status: [Open/Mitigated/Closed/Accepted]
```

### Example Risk Entry

```
Risk ID: R001
Risk Description: Third-party API rate limiting may prevent testing
Category: External
Probability: Medium
Impact: High
Priority: High
Owner: QA Lead
Mitigation Strategy: Implement rate limiting in test environment, request higher limits
Contingency Plan: Use mock API for testing, stagger test execution
Status: Open
```

## Mitigation Strategies

### Avoidance

**Approach:** Change plan to eliminate risk

**Examples:**
- Choose different technology
- Remove risky feature
- Change timeline to avoid constraint
- Use alternative approach

**When to Use:** When avoidance cost is less than risk impact

### Reduction

**Approach:** Reduce likelihood or impact of risk

**Examples:**
- Add buffer time
- Implement safeguards
- Increase testing
- Add redundancy

**When to Use:** When risk cannot be avoided but can be managed

### Transfer

**Approach:** Shift risk to third party

**Examples:**
- Use insurance
- Outsource risky component
- Use SLA with vendor
- Use managed service

**When to Use:** When third party can better manage risk

### Acceptance

**Approach:** Accept risk and plan for consequences

**Examples:**
- Document risk
- Plan contingency
- Set trigger conditions
- Allocate contingency budget

**When to Use:** When mitigation cost exceeds risk impact

## Common Risk Patterns

### Common Technical Risks

- Performance not meeting requirements
- Security vulnerabilities discovered late
- Integration failures
- Data quality issues
- Scalability problems

### Common Process Risks

- Requirements not clearly defined
- Scope creep
- Resource constraints
- Communication breakdowns
- Quality issues

### Common External Risks

- Third-party service failures
- Regulatory changes
- Vendor delays
- Market changes
- Competitor actions

## Risk Monitoring

### Ongoing Monitoring

**Activities:**
- Regular risk review meetings
- Update risk register
- Track risk triggers
- Monitor risk indicators
- Assess new risks

### Risk Triggers

**Definition:** Conditions that indicate risk is materializing

**Examples:**
- API response time degrading
- Team member leaves project
- Requirement changes requested
- Test failures increasing

### Risk Response

**When Trigger Occurs:**
1. Activate contingency plan
2. Inform stakeholders
3. Adjust plan as needed
4. Update risk register
5. Document lessons learned

## Quality Checklist

### Risk Identification

- [ ] Comprehensive risk list generated
- [ ] Risks categorized systematically
- [ ] Impact assessed for each risk
- [ ] Probability assessed for each risk
- [ ] Priorities assigned

### Risk Documentation

- [ ] Risk register created
- [ ] Each risk clearly described
- [ ] Mitigation strategies defined
- [ ] Contingency plans defined
- [ ] Owners assigned

### Risk Management

- [ ] Monitoring process defined
- [ ] Risk triggers identified
- [ ] Response process defined
- [ ] Communication plan in place
- [ ] Lessons learned process defined
