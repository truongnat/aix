# Workflow: fullstack-feature

End-to-end execution of a fullstack feature, coordinating frontend, backend, and database changes using bundled skills.

**Domain:** `dev` — this file lives under **`workflows/dev/`**.
**Invoke:** `/fullstack-feature`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `fullstack-feature` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `feature_spec` | Yes | Path to the feature requirement or user prompt |
| `tech_stack` | No | Target stack (e.g., Next.js 15, Prisma, Postgres) |

## Output format

Follow **`OUTPUT_CONVENTIONS.md`**. Ensure clear separation between frontend and backend changes.

## Steps

### Step 1 — `plan-architecture`
- **Type:** skill
- **Skill:** `planning-pro` + `senior-architect`
- **Input:** `feature_spec`
- **Output:** Database schema updates, API route design, UI component tree.

### Step 2 — `backend-implementation`
- **Type:** skill
- **Skill:** `nextjs-15-pro` (Server Actions) or `nestjs-pro` + `prisma-postgres`
- **Input:** API design from Step 1.
- **Output:** Database migrations and backend handlers.

### Step 3 — `frontend-implementation`
- **Type:** skill
- **Skill:** `react-pro` + `shadcn-mastery-pro`
- **Input:** UI component tree + created backend handlers.
- **Output:** Interactive UI components connected to backend data.

### Step 4 — `testing-and-deployment`
- **Type:** skill
- **Skill:** `testing-pro` + `vercel-deployment-pro`
- **Input:** Completed feature code.
- **Output:** Tests run, Edge/Node config optimized, deployment readiness check.
