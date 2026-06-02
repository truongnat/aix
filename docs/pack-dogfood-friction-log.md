# Pack Dogfood Friction Log

Structured log for `v0.8.0` real capability pack dogfood. Add one entry per friction observed.

Do not paste secrets, tokens, customer data, or private business details. Summarize patterns and redact sensitive names.

## Entries

| Date | Scenario | Friction | Severity | Evidence | Proposed Fix | Classification |
|---|---|---|---|---|---|---|
| 2026-06-02 | A | Install summary prints absolute target path | low | Scenario A install output | Prefer relative path in summary or document redaction for reports | v0.8.x fix |
| 2026-06-02 | A | validate.js runs from source pack only, not installed into target | low | Scenario A validation flow | Add prominent callout in install next-steps and target-repo-validation | v0.8.x fix |
| 2026-06-02 | A | No blocking friction beyond minor doc/output clarity | none | Profile and goal validation passed | No action required | no action |
| 2026-06-02 | B | flutter-google-login example SKILLS/HARNESS shape differs from validator `.harness/` contract | medium | Scenario B artifact drafting | Add bridge doc or tighten example to validator headings | v0.8.x fix |
| 2026-06-02 | B | Example goals under examples/ path vs `.harness/goals/` in target repos | low | Scenario B report | Clarify in harness-build README | v0.8.x fix |
| 2026-06-02 | B | Install summary absolute target path (repeat) | low | Scenario B install | Same as Scenario A | v0.8.x fix |
| 2026-06-02 | B | No blocking friction for install or validation | none | Profile and goal validation passed | No action required | no action |

### Severity

- **low**: annoyance; workaround exists
- **medium**: slows adoption; docs or small doc fix likely
- **high**: blocks scenario completion without manual intervention

### Classification

- **v0.8.x fix**: address in dogfood patch docs or small clarifications before `v0.8.0` ships
- **v0.9 contract candidate**: may require contract freeze or validator change in `v0.9.0`
- **v1 blocker**: must resolve before `v1.0.0`
- **later optional work**: automation, adapters, marketplace—explicitly deferred
