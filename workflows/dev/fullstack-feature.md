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

### Step 1 — `planning`
- **Type:** skill
- **Skill:** `fullstack-pro` + `senior-architect`
- **Input:** `feature_spec`
- **Output:** System Design, Database Schema, and Server Action definitions.

### Step 2 — `database-implementation`
- **Type:** skill
- **Skill:** `prisma-postgres` or `sql-data-access-pro`
- **Input:** Database Schema from Step 1.
- **Output:** Migration files or updated schema models.

### Step 3 — `backend-implementation`
- **Type:** skill
- **Skill:** `fullstack-pro` (Backend) + `nextjs-15-pro`
- **Input:** Server Action definitions from Step 1.
- **Output:** Server Actions with Zod validation and error handling.

### Step 4 — `frontend-implementation`
- **Type:** skill
- **Skill:** `fullstack-pro` (Frontend) + `shadcn-mastery-pro`
- **Input:** UI requirements + completed Server Actions.
- **Output:** Responsive UI components using shadcn/ui.

### Step 5 — `integration-and-polish`
- **Type:** skill
- **Skill:** `fullstack-pro` + `react-pro`
- **Input:** UI + Backend components.
- **Output:** Feature integrated with optimistic updates and loading states.

### Step 6 — `review-and-verify`
- **Type:** skill
- **Skill:** `fullstack-pro` + `code-review`
- **Input:** Completed feature code.
- **Output:** Code audited for performance, security, and accessibility.
