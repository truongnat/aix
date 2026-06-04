# Security Policy

## Artifact Content Restrictions

**All harness artifacts (`.harness/`, `docs/`, `AGENTS.md`, etc.) MUST NOT contain:**

- Credentials, tokens, secrets, API keys, or `.env` values
- Customer data or private business information
- Credentials or credentials in `.env` files
- Temporary logs or transient discussion noise

**Rationale:** These artifacts are intended for durability and reuse. If a lesson is useful but sensitive, summarize the pattern or approach without preserving the sensitive details.

---

## Reporting Security Issues

Do not report public secrets in issues.

Do not store secrets, tokens, API keys, customer data, or private business data in issue reports or public discussions.

If private security contact information is available later, use that private channel for sensitive reports.

If no private contact exists yet, do not disclose sensitive details publicly. Instead, open a minimal issue asking for a private contact channel and keep the report content high-level until a private path is available.
