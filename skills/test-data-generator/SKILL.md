---
name: test-data-generator
description: "Generate fake test data for forms, API requests, or database seeding. Use when a manual tester needs names, emails, phone numbers, addresses, codes, dates — valid, invalid, boundary, Unicode, extra-long, or locale-specific sets — without using anyone's real personal information."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,test-data,faker,data-generation"
---

# Test Data Generator

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If data files are created, store them under:

```text
artifacts/YYYY-MM-DD/test-data-generator/HHmmss-data-purpose/
```

Every artifact must record `Session timestamp`, data purpose, field list, rules, and the generated data.

## Goal
Produce clearly-fake, purpose-labeled test data — covering valid, invalid, boundary, and locale-specific shapes — with zero real personal information.

## Process

### Step 1 — Identify fields and rules
Ask or extract from input:
- Field names, data types, required/optional.
- Format, min/max, enum values, uniqueness constraints.
- **Locale** — default `vi-VN` if the user doesn't specify, but always state which locale was assumed.
- How many records.
- Purpose: form testing, API request bodies, boundary checks, negative testing, CSV import, DB seed.

If the target system has specific rules (e.g. "phone must start with 09x"), get them — fake data that violates the real format is useless for valid-path testing.

### Step 2 — Generate by group
- **Valid**: well-formed, readable, varied.
- **Invalid**: wrong format, missing required, wrong type, over limits.
- **Boundary**: min, max, min−1, max+1, empty, extremely long.
- **Locale**: Vietnamese names with diacritics, fake VN phone numbers, fake VN addresses.
- **Unicode/special**: emoji, special characters, leading/trailing whitespace, accented characters.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Purpose: [form / API / import / ...]
Locale: [vi-VN / en-US / ...]
Rules applied: [key constraints used]

| Case | Field | Value | Valid? | Purpose |
|---|---|---|---|---|
| valid-01 | email | nguyen.an@example.com | yes | happy path |
| invalid-03 | email | not-an-email | no | format validation |
| boundary-01 | age | 17 (min-1) | no | boundary below |
| unicode-01 | fullName | Nguyễn Thị Hồng Nhung 🌸 | yes | diacritics + emoji |
```

When the user needs CSV or JSON, produce the matching file in the artifact folder — CSV with proper escaping for commas/quotes/newlines.

## Safety rules
- Never generate data that could be a real person's actual info — no real phone numbers, ID numbers, or plausible full identity sets.
- Emails: use safe domains — `example.com`, `example.org`, `*.test`.
- Phones/addresses/ID numbers: visibly fake (e.g. `0900000xxx` patterns, fictional streets) and labeled as fake.
- If the user asks for data that mimics a specific real person/record, decline that part and offer structurally-equivalent fake data instead.

## Anti-patterns
- Generating only valid data — the invalid/boundary rows are usually the point of the request.
- Data that looks real but doesn't match the system's actual constraints (e.g. 10-digit phone when the system requires 11).
- Mixing valid and invalid rows without labeling — the `Valid?`/`Purpose` columns are what make the set usable.
- "Sample" strings like `test test test` or `asdf` — lazy data can't exercise real validation or expose display bugs.
