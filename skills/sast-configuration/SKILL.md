---
name: sast-configuration
description: Configure Static Application Security Testing (SAST) tools for automated vulnerability detection in application code. Use when setting up security scanning, implementing DevSecOps practices, or automating code vulnerability detection.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "security,testing,reliability"
  roles: "security-engineer,qa-engineer"
  compatible: "claude,cursor,codex,gemini"

---

# SAST Configuration

## Boundary

**`sk-sast-configuration`** owns **SAST policy and rule-design guidance, baseline triage, false-positive handling, and security quality gates**. It does not own **running repository-specific automation or owning a CI platform as the primary deliverable**; route those concerns to the appropriate specialist skill.


Static Application Security Testing (SAST) tool setup, configuration, and custom rule creation for comprehensive security scanning across multiple programming languages.

## Overview

This skill provides comprehensive guidance for setting up and configuring SAST tools including Semgrep, SonarQube, and CodeQL. Use this skill when you need to:

- Set up SAST scanning in CI/CD pipelines
- Create custom security rules for your codebase
- Configure quality gates and compliance policies
- Optimize scan performance and reduce false positives
- Integrate multiple SAST tools for defense-in-depth

## Core Capabilities

### 1. Semgrep Configuration

- Custom rule creation with pattern matching
- Language-specific security rules (Python, JavaScript, Go, Java, etc.)
- CI/CD integration (GitHub Actions, GitLab CI, Jenkins)
- False positive tuning and rule optimization
- Organizational policy enforcement

### 2. SonarQube Setup

- Quality gate configuration
- Security hotspot analysis
- Code coverage and technical debt tracking
- Custom quality profiles for languages
- Enterprise integration with LDAP/SAML

### 3. CodeQL Analysis

- GitHub Advanced Security integration
- Custom query development
- Vulnerability variant analysis
- Security sk-research workflows
- SARIF result processing

## Orientation

### Initial Assessment

1. Identify primary programming languages in your codebase
2. Determine compliance requirements (PCI-DSS, SOC 2, etc.)
3. Choose SAST tool based on language support and integration needs
4. Review baseline scan to understand current security posture

### Basic Setup


## Integration Patterns

### CI/CD Pipeline Integration

```yaml
# GitHub Actions example
- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/owasp-top-ten
```

### Pre-commit Hook


## Best Practices

1. **Start with Baseline**
   - Run initial scan to establish security baseline
   - Prioritize critical and high severity findings
   - Create remediation roadmap

2. **Incremental Adoption**
   - Begin with security-focused rules
   - Gradually add code quality rules
   - Implement blocking only for critical issues

3. **False Positive Management**
   - Document legitimate suppressions
   - Create allow lists for known safe patterns
   - Regularly sk-review suppressed findings

4. **Performance Optimization**
   - Exclude test files and generated code
   - Use incremental scanning for large codebases
   - Cache scan results in CI/CD

5. **Team Enablement**
   - Provide security training for developers
   - Create internal documentation for common patterns
   - Establish security champions program

## Common Use Cases

### New Project Setup


### Custom Rule Development

```yaml
# See references/semgrep-rules.md for detailed examples
rules:
  - id: hardcoded-jwt-secret
    pattern: jwt.encode($DATA, "...", ...)
    message: JWT secret should not be hardcoded
    severity: ERROR
```

### Compliance Scanning


## Troubleshooting

### High False Positive Rate

- Review and tune rule sensitivity
- Add path filters to exclude test files
- Use nostmt metadata for noisy patterns
- Create organization-specific rule exceptions

### Performance Issues

- Enable incremental scanning
- Parallelize scans across modules
- Optimize rule patterns for efficiency
- Cache dependencies and scan results

### Integration Failures

- Verify API tokens and credentials
- Check network connectivity and proxy settings
- Review SARIF output format compatibility
- Validate CI/CD runner permissions

## Related Skills

- `OWASP Top 10 Checklist`
- `Container Security`
- `Dependency Scanning`

## Tool Comparison

| Tool      | Best For                 | Language Support | Cost            | Integration   |
| --------- | ------------------------ | ---------------- | --------------- | ------------- |
| Semgrep   | Custom rules, fast scans | 30+ languages    | Free/Enterprise | Excellent     |
| SonarQube | Code quality + security  | 25+ languages    | Free/Commercial | Good          |
| CodeQL    | Deep analysis, sk-research  | 10+ languages    | Free (OSS)      | GitHub native |

## Next Steps

1. Complete initial SAST tool setup
2. Run baseline security scan
3. Create custom rules for organization-specific patterns
4. Integrate into CI/CD pipeline
5. Establish security gate policies
6. Train development team on findings and remediation

## Output

Produce a reusable sast configuration artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## When not to use

- When the request is outside `sk-sast-configuration`'s boundary or another specialist is the primary owner.
- When the user needs an attestation, exploit authorization, or production claim that requires separate human approval or evidence.

## Required inputs

- languages, compliance needs, baseline findings, acceptable false-positive policy, and reporting audience.

## Cross-skill handoffs

- sk-security-pro for threat/control intent; sk-ci-cd-pro for pipeline wiring; sk-testing-pro for quality feedback; stack skills for language-specific patterns.
