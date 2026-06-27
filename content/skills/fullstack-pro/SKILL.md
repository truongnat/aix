---
name: fullstack-pro
description: >
  Comprehensive Fullstack development in ••••: Next.js 15, Server Actions,
  shadcn/ui, and AI integration.

  Use this skill to architect, implement, and review end-to-end fullstack
  features.
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# Fullstack Pro ••••

Expert-level orchestration of modern fullstack applications. Follows the strict •••• tech stack: Next.js 15, Server Actions, Tailwind CSS, shadcn/ui, and Vercel AI SDK.

## Boundary

**`fullstack-pro`** owns the **entire feature lifecycle**. It coordinates between frontend (`react-pro`), backend (`nextjs-15-pro`), database (`prisma-postgres` or `sql-data-access-pro`), and AI integration (`fullstack-rag-pro`).

## When to use

- Building a new feature from database schema to UI components.
- Architecting a complex module (Auth, Payment, Dashboard).
- Reviewing an entire feature for consistency, performance, and security.
- Integrating AI capabilities into an existing application.

## Workflow

Follow the **Pro Fullstack Workflow**:

1. **Planning**: Define System Design, Database Schema, and API/Action Design.
2. **Database**: Implement Prisma/Drizzle schema and migrations.
3. **Backend**: Implement Server Actions with Zod validation and error handling.
4. **Frontend**: Build UI components using shadcn/ui and Radix.
5. **Integration**: Connect UI to Server Actions with `useOptimistic` and `Suspense`.
6. **Review**: Audit for performance, security, and accessibility.

### Operating principles

1. **Server-First**: Default to Server Components. Add `"use client"` only for interactivity.
2. **Action-Driven**: Prefer Server Actions over custom API routes for all mutations.
3. **Type-Safe**: Enforce strict TypeScript across the entire boundary.
4. **Clean Components**: Reusable, accessible, and inclusive of loading/error states.
5. **AI Native**: Use Vercel AI SDK for streaming and intelligent features.
6. **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Fullstack Developer (10+ years experience).
</Role>

<Feature>
[Feature Name & Brief Description]
</Feature>

<Planning>
- Architecture: [Brief description]
- Schema: [Required changes]
- Actions: [List of Server Actions]
</Planning>

<Implementation>
1. **Database**: [Code/Steps]
2. **Backend**: [Server Actions code]
3. **Frontend**: [UI Components code]
</Implementation>

<Verification>
- [Step 1] -> verify: [Check]
- [Step 2] -> verify: [Check]
</Verification>

<Risks>
- [Potential issues/trade-offs]
</Risks>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Next.js 15 App Router | [nextjs.org/docs](https://nextjs.org/docs) |
| Server Actions | [nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com) |
| Vercel AI SDK | [sdk.vercel.ai](https://sdk.vercel.ai/docs) |

## Quick example

**Feature:** Create a todo list with optimistic updates.

1. **Plan**: Prisma `Todo` model -> `createTodo` Action -> `TodoList` Component.
2. **DB**: `model Todo { id String @id @default(cuid()); text String; completed Boolean @default(false) }`
3. **Action**: `'use server'; async function createTodo(text: string) { ...; revalidatePath('/') }`
4. **Frontend**: Use `useOptimistic` to show the new todo immediately.

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Architecture and data flow planned before implementation.
- [ ] **Simplicity First**: Minimum necessary code; Server Components used by default.
- [ ] **Surgical Changes**: Only touched files relevant to the feature.
- [ ] **Goal-Driven Execution**: Feature verified with success criteria.
- [ ] Next.js 15 App Router best practices followed.
- [ ] Server Actions used for mutations instead of API routes.
- [ ] UI components are clean, reusable, and accessible.
- [ ] Error handling and loading states implemented.
