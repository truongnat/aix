# Quality Gates

The harness uses simple gates to prevent low-discipline execution.

For phase-by-phase entry, evidence, completion, and escalation criteria, use [Quality Gates Matrix](quality-gates-matrix.md).

## Planning Gate

- active goal is explicit
- relevant artifacts were read
- scope is understood
- a plan exists before implementation starts

## Execution Gate

- work follows the approved plan
- tasks stay small
- scope drift is surfaced instead of hidden
- unrelated changes are avoided

## Review Gate

- findings are captured when risk or ambiguity exists
- missing tests or missing evidence are treated as real issues
- unresolved questions are explicit

## Verification Gate

- fresh checks were run
- evidence supports the claim being made
- anything not run is documented
- residual risk is stated honestly

## Shipping Gate

- work is implemented in scope
- verification exists
- summary matches reality
- follow-ups are listed if needed

## Remembering Gate

- the lesson is durable
- the memory is useful for future work
- see [SECURITY.md](../SECURITY.md#artifact-content-restrictions) — no secrets, credentials, customer data, or private business data
