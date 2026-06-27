# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Severity inflation** | Reviewer ego or vague worry | Everything “High” | Impact chain to user/system — **`severity-and-prioritization.md`** |
| **Opinion disguised as fact** | No repro, no link | “I don’t like it” wording | Demand evidence or downgrade confidence — **`finding-structure-and-evidence.md`** |
| **Ping-pong rewrite** | Conflicting reviewers | Circular comments | Consolidate owner decision — **`edge-cases.md`** |
| **Nit avalanche** | Style mixed with safety | Huge comment count, few severities | Summary table; batch polish — **`edge-cases.md`** |
| **LGTM without reading** | Throughput pressure | Missed obvious defect later | Spot-check high-risk paths; checklist for security areas — **`anti-patterns.md`** |
| **Blocking without criteria** | Unclear merge bar | Author stuck | Explicit must-fix list or ticket template — **`action-planning-and-closure.md`** |
| **Deferred debt silent** | “We’ll fix later” no ticket | Lost work | Ticket ID + owner or risk note — **`action-planning-and-closure.md`** |
| **Tone escalation** | Personal framing | HR-sensitive threads | Critique artifact; assume good intent — **`tips-and-tricks.md`** |
| **Scope creep in review** | New requirements in PR | PM not looped | Separate **product question** from code feedback — **`edge-cases.md`** |
| **AI review spam** | Low-signal bulk suggestions | Noise hides blockers | Human triage; severity-first summary — **`quality-validation-and-guardrails.md`** |
