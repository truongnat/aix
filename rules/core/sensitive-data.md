## Sensitive Data Handling

Do not copy, persist, or regenerate sensitive content into harness artifacts, generated rules, memory, docs, prompts, plans, reports, or discussion notes.

Treat the following as sensitive unless the user explicitly requests safe redaction guidance:

- credentials, tokens, secrets, API keys, passwords, or `.env` values
- customer data or private business information
- private security details that would increase risk if copied verbatim

If the engineering lesson is useful, keep the pattern and drop the secret. Summarize, redact, or generalize the detail rather than preserving raw values, names, or payloads.

When a source artifact contains sensitive content:

1. Do not quote or restate the raw secret.
2. Refer to the path or artifact type, not the secret value.
3. Ask only the minimum question needed to continue safely.
4. Keep generated output high-level until a safe private path exists.
