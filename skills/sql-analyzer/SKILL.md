---
name: sql-analyzer
description: "Translate natural-language data-check requests into SQL, run them through a read-only database MCP connection if available, and explain results in plain language for testers who aren't fluent in SQL. Use when the user needs to verify data in a DB, or when a dev hands them a SQL query they need to understand."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,sql,database,data-verification"
---

# SQL Analyzer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If result files are created, store them under:

```text
artifacts/YYYY-MM-DD/sql-analyzer/HHmmss-short-topic/
```

Every artifact must record `Session timestamp`, the original question, the SQL run, the conclusion, and data limitations. All main chat output must also show `Session timestamp`.

## Prerequisite
This skill needs a **read-only database MCP connection** already set up in the session. If none is available, do NOT fabricate results — tell the user a database MCP connection is needed first and suggest finding a suitable connector. Writing a query draft for the user to run themselves is still allowed in this case.

## Two modes

### Mode 1 — User describes what to check; assistant writes and runs SQL

1. Read the request (e.g. "check whether user X's order shows as paid").
2. If details needed for a correct query are missing — table name, field name, the exact criterion — ask briefly: *"Do you know which table stores orders, or should I discover it from the schema?"*
3. **Explore the schema before guessing**: list tables, inspect columns of candidates — never guess table/column names when a schema lookup is possible.
4. Write the SQL — **read-only only** (`SELECT` or the equivalent for the database). Never any write/delete/schema statement.
5. Run it, get results.
6. Explain the result in plain language, no SQL jargon — answer the original question directly (yes/no, correct/incorrect, count).
7. Attach the executed SQL so the user can save it for later reference.

Example flow:

```text
User: "check if order 1289 is actually paid"

Discovered schema: orders(id, status, paid_at), payments(order_id, amount, state)

Query run:
SELECT o.id, o.status, o.paid_at, p.state AS payment_state, p.amount
FROM orders o LEFT JOIN payments p ON p.order_id = o.id
WHERE o.id = 1289;

Conclusion: No — the order exists but status is 'pending' and there is
no successful payment row attached (payments row shows state='failed').
```

### Mode 2 — Dev hands over a SQL query; user wants to understand it

1. Read the provided SQL.
2. Explain each part in plain language: what data it fetches, from which tables, what the filters mean, what each JOIN is for.
3. For complex queries (multiple joins, subqueries), break the explanation into stages rather than explaining the whole thing at once.
4. Only run it if it's read-only. If the query contains writes/deletes/schema changes, explain what it does and its risk — do not execute.

## Safety rules
- NEVER execute write/delete/schema statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `MERGE`, stored procedures with side effects) — even if the user confirms.
- If the user needs write statements for test data setup, only draft the SQL for a dev/DBA to review and run.
- When unsure whether a statement is read-only, don't run it — ask.
- If results contain PII (customer names, emails, phones), show only what's needed to answer the question; don't dump extra sensitive columns.
- Common QA read patterns worth knowing: verify status after an action, count rows matching criteria, check for orphaned duplicates, confirm a record doesn't exist.

## Output format
Answer the question first, details after:

```text
Conclusion: [Yes/No/Specific numbers]

Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

SQL executed:
[query]

Explanation: [plain-language interpretation of the result]

Limitations: [e.g. "checked staging DB only" / "result is a point-in-time snapshot"]
```

## Anti-patterns
- Guessing table names instead of inspecting the schema.
- Dumping a 200-row result — summarize to answer the question, attach the query for reproduction.
- Answering with the SQL but no plain-language conclusion — the conclusion IS the deliverable.
- Running `UPDATE … WHERE id=…` "just to fix test data" — that's what the safety rules prohibit; draft it for the dev instead.
