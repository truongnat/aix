# Feedback — anti-patterns (support tier)

1. **Severity inflation** — Labeling every comment “critical” trains the team to ignore real risk.

2. **Vague adjectives** — “This is messy” without **behavior + consequence**; replace with observable facts.

3. **Feedback on the person** — “You always…” / “Why didn’t you…” — focus on the artifact and the next action.

4. **No verification path** — “Add tests” without specifying **which scenario** or **failure mode**.

5. **Bikeshedding** — Long debates on naming while security bugs sit unaddressed; order by impact.

6. **Silent approval** — LGTM without reading critical paths; if you only skim, say what you reviewed.

7. **Scope creep in review** — Demanding unrelated refactors in the same PR; use a follow-up ticket.

8. **Inconsistent standards** — Same pattern approved in one PR and blocked in another without team agreement.

**When NOT to demand perfection:** Hotfix window — minimal fixes; capture debt in a **tracked** follow-up.
