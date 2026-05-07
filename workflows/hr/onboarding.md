# Workflow: onboarding

Structured **onboarding** for new engineers or agents: repo layout, build/test commands, conventions, and a short path to a first meaningful contribution.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `onboarding.md`.

**Invoke:** `/onboarding`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `onboarding` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `onboarding_role` | Yes | e.g. backend, frontend, full-stack, agent, contractor |
| `time_budget` | No | e.g. "2h today", "first week" |
| `focus_area` | No | Optional: area to prioritize (CI, API, UI, data) |

## Outputs

| Variable | Description |
|----------|-------------|
| `orientation_summary` | What the system is; key directories |
| `first_tasks` | Ordered checklist with estimates |
| `support_map` | Where docs live; who to ask for what (if known) |

## Decision paths

- **Agent vs human:** Agents — emphasize `AGENTS.md`, `skills/`, `workflows/`, and slash commands; humans — add local tooling (IDE, secrets, SSO).
- **Empty repo / sparse docs:** Step 1 produces **inventory from tree** + explicit gaps list.
- **Security-sensitive project:** Add `security-pro` hygiene in Step 2 (no secrets in chat, env pattern).

## Error handling

- **Cannot run build:** Document exact error + environment; do not assume green CI.
- **Conflicting READMEs:** Prefer root **README** + `docs/` or `knowledge-base/` index; flag contradictions.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)**.  
Use a **progress table** for the first-week checklist.  
Optional: link new KB notes to **[`templates/kb-document/knowledge-doc.md`](../../templates/kb-document/knowledge-doc.md)**.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Tour + first issue | 1–2 h |
| **Standard** | First PR-sized contribution | 2–5 days |
| **Deep** | Full domain ownership ramp | > 2 weeks |

## Escalation

- **Human:** Access requests (repos, cloud, secrets), HR/process.
- **Autonomous:** Doc pointers, command lists, convention summaries.

## Steps

### Step 1 — `map-repository`

- **Type:** skill
- **Skill:** `repo-tooling-pro` + `planning-pro`
- **Input:** Repo root, `onboarding_role`
- **Output:** Directory map; build/test entrypoints; config files to know.

### Step 2 — `conventions-and-safety`

- **Type:** skill
- **Skill:** `security-pro` (lightweight) + `git-operations-pro`
- **Input:** Contribution guide if any
- **Output:** Branch/PR conventions; secret handling; review expectations.

### Step 3 — `skills-and-workflows`

- **Type:** skill
- **Skill:** `planning-pro`
- **Input:** This repo’s `skills/`, `workflows/dev/`
- **Output:** Which workflows apply to daily work; recommended slash commands.

### Step 4 — `first-contribution-plan`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Steps 1–3, `time_budget`, `focus_area`
- **Output:** `orientation_summary`, `first_tasks`, `support_map`.

## Notes

- For **this** template repo, point readers at **`knowledge-base/INDEX.md`** and **`skills/README.md`**.
