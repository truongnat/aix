---
name: test-plan-writer
description: "Write a test plan for a sprint, release, or feature group from scope lists, requirements, timeline, and QA capacity. Use when a tester or QA lead must define test scope, out-of-scope, approach, environments, data, risks, entry/exit criteria, and effort estimates — not for a single feature's test cases."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,test-plan,release,strategy"
---

# Test Plan Writer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If test plan files are created, store them under:

```text
artifacts/YYYY-MM-DD/test-plan-writer/HHmmss-release-or-sprint/
```

Every artifact must record `Session timestamp`, scope source, assumptions, outstanding gaps, and the final plan.

## Goal
A compact, usable test plan at sprint/release level — what gets tested, what doesn't, by whom, when it's done — not a disguised test-case list.

## Support scripts
If scope arrives via file or URL, prefer `--report` mode first:

- `safe_download.py` for scope documents at a URL
- `read_excel.py` for feature/test-scope lists in CSV/XLSX
- `read_pdf.py` for BRD/spec PDFs
- `read_docx.py` for BRD/spec Word documents

## Process

### Step 1 — Collect scope
- Feature list in Excel/CSV → `read_excel.py --report` first for sheets, headers, sample rows.
- BRD in `.docx` → `read_docx.py --report` for paragraph/table structure before summarizing.

Determine:
- Features/changes in the sprint or release.
- What must be tested AND what is explicitly out of scope.
- Timeline, deadline, participants, environments.
- Known risks, dependencies, test data, accounts/roles.
- Test types needed: smoke, functional, regression, API, UI, compatibility, exploratory.

If key info is missing, ask the top 3 highest-impact questions first.

### Step 2 — Analyze risk and effort per feature
Assess each item on: user/business impact, usage frequency, change complexity, dependencies, bug history, and estimated test effort. This is a lightweight version of `risk-based-prioritizer` — reuse its scoring if the user wants a formal ranking.

### Step 3 — Write the plan
The plan must make four things unambiguous: WHAT is tested, WHAT is not, WHO owns it, WHEN it's done (exit criteria). Keep it short — a plan nobody reads is worthless.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

# Test Plan: [Sprint/Release/Feature group]

## 1. Objective
## 2. Test scope          (features + test types, tied to risk)
## 3. Out of scope        (explicit — prevents scope-creep disputes)
## 4. Test approach       (levels: API/UI/exploratory; who does what)
## 5. Environment & test data
## 6. Resources & timeline (people, days, milestones)
## 7. Risks & mitigations
## 8. Entry criteria       (what must be true before testing starts:
                           e.g. build deployed, test data ready, critical blockers fixed)
## 9. Exit criteria        (what defines "done":
                           e.g. all P0/P1 cases run, no open Critical bugs,
                           coverage % for new features)
## 10. Deliverables        (reports, test case docs, sign-off)
## 11. Open questions
```

## Guidance on the hard parts
- **Entry criteria** are the gate to START; **exit criteria** the gate to STOP — the most-often-missing sections, and the ones that prevent "are we done yet?" debates.
- **Out of scope** must name items explicitly ("payment gateway sandbox only", "no performance testing this sprint") — implicit exclusions cause release-day surprises.
- **Risks** need an owner and a mitigation, not just a list ("env unstable → mitigation: smoke-run nightly, owner: DevOps").
- If the timeline is tight, state clearly which scope would shrink first — tie back to the risk analysis.

## Anti-patterns
- Writing a test plan that is secretly a list of test cases — cases live in `testcase-generator` output.
- Vague criteria: "testing is complete when all tests pass" — pass of WHAT set? Define it.
- Sections copied from a template with placeholder-ish content — drop sections that genuinely don't apply rather than leaving filler.
