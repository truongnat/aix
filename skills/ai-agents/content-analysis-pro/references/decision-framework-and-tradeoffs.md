# Decision framework and trade-offs

## Goal × depth matrix

| User goal | Default stance |
|-----------|----------------|
| **Executive summary** | Short bullets + optional “deep dive” section links |
| **Structured extraction** | Schema first (entities, dates); empty fields OK |
| **Compliance / risk scan** | Rubric + pass/fail per clause; cite clause ID or page |
| **Compare A vs B** | Alignment table + conflict list; same granularity for both sides |

## Coverage trade-offs

| Strategy | Upside | Downside |
|----------|--------|----------|
| **Full sequential read** | Max recall | Time/token cost |
| **Stratified sample** (every N pages / minutes) | Scales | Misses rare events — **document sample** |
| **Search-led** (keywords) | Fast | Misses implicit issues — disclose keywords used |

## Human-in-the-loop

- **Legal / medical / financial** — Analysis supports; **does not replace** licensed review — state in deliverable — **`reporting-and-limitations.md`**.

## Tooling vs model-only

- Prefer **repeatable** extraction steps (documented commands) for audits — **`reporting-and-limitations.md`** automation note.
