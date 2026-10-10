# Semgrep rule reference

Use this reference when designing custom Semgrep rules. Keep rules narrow, explain the security impact, and validate them against positive and negative examples.

## Rule shape

```yaml
rules:
  - id: hardcoded-jwt-secret
    languages: [python]
    message: JWT signing material must come from a protected configuration source.
    severity: ERROR
    patterns:
      - pattern: jwt.encode($PAYLOAD, "...", ...)
      - pattern-not-inside: |
          def test_...(...):
            ...
    metadata:
      category: security
      confidence: medium
      technology: [jwt]
```

## Authoring workflow

1. State the vulnerability and the intended scope.
2. Start with the smallest pattern that demonstrates the risk.
3. Add language and framework constraints where available.
4. Add negative examples for safe code and test fixtures.
5. Record severity, confidence, and a remediation message.
6. Review false positives before making the rule blocking.

## Guardrails

- Do not encode credentials, tokens, or production identifiers in rules.
- Prefer taint mode for source-to-sink flows and a focused pattern for local anti-patterns.
- Keep suppressions explicit, reviewed, and limited to the smallest safe scope.
