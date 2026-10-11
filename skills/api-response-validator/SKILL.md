---
name: api-response-validator
description: "Compare an actual API response against an expected response, JSON schema, OpenAPI contract, or a plain-language expectation. Use when a tester pastes a JSON response, expected output, Swagger schema, or sample payload and needs concrete findings: missing fields, extra fields, wrong types, wrong formats, wrong values, or broken error contracts."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,api,contract,json,validation"
---

# API Response Validator

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If output files are created, store them under:

```text
artifacts/YYYY-MM-DD/api-response-validator/HHmmss-endpoint-or-case/
```

Every artifact must record `Session timestamp`, the actual response, the expected/schema used, the comparison result, and any redacted portions of sensitive data.

## Goal
Let a tester validate an API response field-by-field without eyeballing raw JSON manually, and produce findings that are actionable enough to file as bugs or contract questions.

## Support scripts
If input arrives as files or URLs, prefer running support scripts in `--report` mode first:

- `safe_download.py` to fetch a remote response/spec URL
- `compare_json.py` to diff actual vs expected JSON when both are files
- `json_to_markdown_table.py` to turn a JSON diff or small response into a readable table
- `redact_sensitive.py` before storing logs/responses containing tokens, emails, phones, or sensitive data

## Process

### Step 1 — Establish the comparison source
Accept one or more inputs:
- Actual response JSON (required)
- Expected response JSON
- JSON Schema or OpenAPI schema section
- A plain-language expectation ("user should get 200 and a list of orders")
- Expected status code, headers, or error format

If both actual and expected exist as files, run `compare_json.py --report` first for a path-level diff, then interpret that diff in analysis instead of scanning the JSON by hand.

If there is **no** expected/schema, ask what the response should be compared against. If the user only wants a sanity review of the actual response, label every finding as "suspect — needs contract confirmation", never as a confirmed contract violation.

If actual response is very large, extract only the relevant sections and state clearly that the output was truncated.

### Step 2 — Structured comparison
Work through these layers in order:

1. **Status code** — matches expectation for the scenario (including error scenarios, not just 200).
2. **Required fields** — every contract-required field present; distinguish carefully between:
   - field **missing** (key absent)
   - field **null** (present with null value)
   - field **empty** (`""`, `[]`, `{}`)
   These are three different defects with different fixes.
3. **Extra fields** — unexpected fields may leak data (internal IDs, hashed passwords, debug info). Flag them as suspects, not automatic failures.
4. **Types** — `string` vs `number` vs `boolean` vs `object` vs `array` vs `null`. Watch the classic traps:
   - `"1"` (string) where a number is expected
   - `true`/`"true"` confusion
   - large integers losing precision in JSON (`9007199254740993`)
   - array vs single object for the same field depending on count
5. **Formats** — date/datetime (timezone? ISO-8601?), email, UUID, money (amount + currency together? string vs float?), phone, enum values.
6. **Business values** — status, role, amount, currency, owner, permission flags — a type-correct field can still carry a wrong value.
7. **Nested structure** — array items share the expected shape; nested objects have their required fields; polymorphic fields (e.g. `payment.type` determines sibling fields) are consistent.
8. **Error format** — for 4xx/5xx, the error body matches the documented error contract (code, message, request ID), not an HTML error page or a stack trace.
9. **Headers** — only if provided/expected: `content-type`, `cache-control`, rate-limit headers, correlation/request ID.

### Step 3 — Rate severity
- `BLOCKER` — breaks the main flow or leaks sensitive data (tokens, PII, other users' data).
- `HIGH` — contract violation a client will hit: wrong type, missing required field, broken error format.
- `MEDIUM` — wrong secondary field; partial impact.
- `LOW` — naming/format nitpick needing confirmation.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Endpoint: [method + path if known]
Verdict: [Pass / Fail / Needs confirmation]
Compared against: [expected JSON | schema | plain-language description | actual-only review]

| Field/Path | Actual | Expected | Issue | Severity | Note |
|---|---|---|---|---|---|
| $.data.orders[0].total | "100.5" | number 100.5 | String instead of number | HIGH | breaks JSON.parse consumers |
| $.data.orders[0].user.email | (present) | not in contract | Possible PII leak | BLOCKER | confirm with dev |

Summary:
- Missing fields: [...]
- Extra fields (suspect): [...]
- Wrong type/format/value: [...]
- Questions for dev/BA: [...]
```

## Anti-patterns and edge cases
- Do not quote tokens, passwords, secrets, or unnecessary PII verbatim — truncate or mask (`"token": "eyJ…"`) and note that redaction was applied.
- `"missing"` and `"null"` are not the same bug; keep them distinct in the table.
- Do not flag optional fields as missing; if requiredness is unknown, mark `Needs confirmation`.
- For array responses, check at least: empty array, single item, and whether item shape is uniform across items.
- If only the actual response exists, produce a **suspect list**, not a verdict — e.g. "field `internal_id` present, confirm whether this should be exposed."
- Before persisting a response to artifacts, run `redact_sensitive.py --report`; only `--execute` after the user accepts the redacted version.
