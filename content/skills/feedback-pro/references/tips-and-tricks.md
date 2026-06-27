# Feedback — tips and tricks

## Order of presentation

- Lead with **highest user/system impact** first (security, data loss, broken contracts), then quality, then style.

## Neutral phrasing

- Describe **observed behavior** and **consequence**, not character: “This path skips authz” not “You forgot security.”

## Scope of recommendation

- Match fix depth to severity: do not demand a refactor for a typo-level issue.

## Example fix path

- For non-trivial issues, add a **minimal** direction: file/symbol to touch, pattern to apply — still let the implementer own details.

## Unresolved questions block

- End with explicit **open questions** so triage can assign owners.

## Example — single finding (markdown)

```markdown
### F1 — Missing authz on DELETE /api/items/:id
- **Severity:** High
- **Evidence:** `items.controller.ts:42` — `delete()` calls service with only `id`; no role or ownership check.
- **Impact:** Any authenticated user can delete any item.
- **Recommendation:** Enforce resource ownership or role in `ItemsService.delete` or guard; add regression test for cross-tenant delete.
- **Verify:** Attempt delete as user A on user B’s item → expect 403.
```

## Example — PR summary table

| ID | Severity | Must fix before merge? | Owner hint |
|----|----------|-------------------------|------------|
| F1 | High | Yes | Backend |
| F2 | Low | No | Nice follow-up |

## Example — review comment (concise)

```text
In `parseUserInput()` (L28): unescaped HTML reaches `innerHTML`.
Suggestion: use `textContent` or sanitize; see OWASP XSS cheat sheet.
Blocking: yes for production-facing path.
```

## Cross-links

- [finding-structure-and-evidence.md](finding-structure-and-evidence.md), [severity-and-prioritization.md](severity-and-prioritization.md), [action-planning-and-closure.md](action-planning-and-closure.md).
