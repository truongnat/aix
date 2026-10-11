---
name: testcase-generator
description: "Generate a complete test case set (functional, negative, boundary, security, concurrency, API contract) from a spec, feature description, Swagger/OpenAPI, Postman collection, or curl example. Use when assigned a new feature or endpoint and need test cases written, or when reviewing an old set for gaps. Default output is a Markdown table, with optional CSV export for Excel/Google Sheets."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,test-design,testcases,api"
---

# Testcase Generator

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If test case files are created, store them under:

```text
artifacts/YYYY-MM-DD/testcase-generator/HHmmss-feature-slug/
```

Artifacts typically contain `testcases.md`, `testcases.csv` (when requested), and must record `Session timestamp`, feature, requirement source, assumptions, and which case groups were skipped. All main chat output must also show `Session timestamp`.

## Goal
Produce a complete test case set that doesn't drop important cases — from whatever input exists, even a thin or rough spec. Inputs can be: a feature description, a spec document (PDF/DOCX/XLSX), an OpenAPI/Swagger file, a Postman collection, a curl example, or sample request/response pairs.

## Support scripts
When input arrives as a file or URL, prefer `--report` mode before reading content:

- `safe_download.py` for spec files at a URL
- `read_excel.py` for `.csv` / `.xlsx`
- `read_pdf.py` for `.pdf`
- `read_docx.py` for Word specs
- `parse_openapi.py` for OpenAPI/Swagger JSON or YAML — returns title/version, endpoint list, method/path, response codes, security schemes
- `parse_postman.py` for Postman collection JSON — returns collection name, request count, method+URL per request, auth type, body mode, header count
- `postman_env_redactor.py` for Postman environment exports containing tokens, secrets, passwords
- `markdown_table_to_csv.py` to convert a generated Markdown table to CSV
- `redact_sensitive.py` if files contain real data or sensitive logs

## Step 1 — Check context before generating

For `.csv`/`.xlsx`: run `read_excel.py --report` first to learn which sheets hold data, headers, and sample rows. For `.pdf`: `read_pdf.py --report` for extractability and page count. For URLs: `safe_download.py --report` first. For OpenAPI/Postman files: run the matching parse script's `--report` and build cases from the parse output — never hand-scan a large spec.

Before generating, verify you know:
- The feature's purpose/main flow (what the user does, what the system returns)
- Related fields/inputs (form fields, API params)
- Related roles/permissions (who may and may not use this)
- Special business constraints (quantity limits, time windows, states)

If ANY item is missing, ask the user with specific short questions — never a vague "give me more info". Maximum 3 highest-impact questions first. Good question: "Is this feature role-gated, or can any logged-in user use it?"

Only proceed when there's enough minimum info to generate meaningfully. If the user says "just generate with what we have", continue but mark information-limited cases clearly in the Notes column.

## Step 2 — Generate across 4 case groups

For EVERY feature, sweep all four groups. Only generate cases for groups that apply; if a group doesn't apply, record the skip reason in Notes or the summary.

### Group A — Input-based
- Equivalence partitioning: valid/invalid value classes per field
- Boundary value analysis: min, max, min−1, max+1, empty, null, over-length
- Format/type validation: wrong format, wrong data type

### Group B — Business logic
- Decision tables when conditions combine (e.g. role + status → action)
- State transitions: valid AND invalid transitions for stateful objects
- If the feature has no real conditions or states, write "Not applicable" instead of inventing them

### Group C — System-level (most-often-missed — sweep carefully)
- Permission/role: test with each relevant role
- Concurrency: multiple users/actions at once
- Data persistence: reload, close/reopen, connection loss mid-operation
- Negative/error handling: network loss, timeout, basic malicious input (XSS, injection)
- Cross-browser/device for web/app
- Only create concurrency/security/cross-browser cases when there's a reasonable risk or related surface; otherwise record the skip reason

### Group D — API cases (when input is an endpoint/spec)
- Positive: valid request, correct status code, response schema matches
- Required fields: each mandatory param/body field missing in turn
- Type/format: wrong types, wrong email/date/UUID/number formats
- Auth: missing token, expired token, wrong token, insufficient role
- Permission: user A accessing user B's data (IDOR), low role calling high-role endpoint
- Business rule: invalid state, wrong workflow order, nonexistent resource
- Error handling: 400/401/403/404/409/422/500 as applicable
- Contract: missing field, unexpected extra field, wrong enum, wrong nullability

### Group E — Priority & Type tagging
Every case gets:
- Type: Positive / Negative / Boundary / Security / Concurrency / Contract
- Priority: `P0` (must run — main flow, auth/permission, high-risk) / `P1` (should run — common negative/boundary) / `P2` (run if time — rare edge, environment-dependent)

## Step 3 — Format output

Standard columns for both Markdown and CSV (UI/feature cases):

```text
ID | Feature | Title | Type | Priority | Preconditions | Steps | Test Data | Expected Result | Notes
```

For API-focused sets, this variant is clearer:

```text
ID | Endpoint | Method | Title | Type | Priority | Preconditions | Request Data | Expected Status | Expected Response | Notes
```

ID convention: `TC_<FEATURE_ABBREV>_<SEQ>` (e.g. `TC_LOGIN_001`).

Steps: numbered clearly, one action per line — never merge multiple actions into one step.

Notes: flag any case the assistant inferred beyond the provided spec — so the user knows to confirm with PM/dev before adding it to the official suite.

Precede the table with:

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Source: [spec text / OpenAPI file / Postman collection / description]
Applicable groups: [A/B/C/D/E + which skipped and why]
Assumptions: [...]
```

### Default output: Markdown table
Rendered inline in chat for quick review and edits.

### After the Markdown table, ALWAYS ask:
"Would you like a CSV export for Excel/Google Sheets as well?"

If yes, produce `.csv` with identical columns, comma-delimited, properly escaped for cells containing commas/newlines (Steps cells especially). If a complete Markdown table already exists, `markdown_table_to_csv.py --report` can verify column/row counts before `--execute`.

## Reference example
See `references/example_output.md` for a complete output sample on the "login with email/password" feature.

## Rules
- Never invent a schema or business rule the spec doesn't state — inferred content must be marked `Assumption`/`inferred` in Notes.
- Never put real tokens, passwords, or real personal data into generated request data — use obvious placeholders.
- If the spec contains secrets/tokens, run `redact_sensitive.py --report` before storing artifacts or re-quoting it.
