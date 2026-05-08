# Fullstack Pro Prompt Templates (2026)

Use these templates to get the highest quality code from AI agents.

## 1. Feature Creation (End-to-End)

```xml
<Role>
You are Senior Fullstack Developer 10 years experience, specialized in Next.js 15.
</Role>

<Feature>
[DESCRIBE YOUR FEATURE HERE, e.g. Order management page with filter, search, pagination]
</Feature>

<Requirements>
- Use Server Components + Server Actions
- Use shadcn/ui components
- TypeScript strict
- Include loading state, error handling, empty state
- Responsive mobile-first
- Integrated optimistic updates (useOptimistic)
</Requirements>

<Context>
Project Stack: Next.js 15 App Router, Prisma + PostgreSQL, Tailwind + shadcn/ui.
</Context>

<Output Format>
1. File structure to create/modify
2. Complete code for each file (using Artifacts)
3. Database migration steps (if any)
4. Verification & Testing steps
</Output Format>
```

## 2. Review & Improve Code

```xml
Review the following code across these dimensions:
- Performance (hydration, bundle size, cache)
- Security (secret boundaries, auth checks)
- Best practices (Next.js 15, React 19)
- Accessibility (Aria labels, keyboard navigation)
- Maintainability (Clean code, types)
- Type safety (Strict TS)

Provide the best improved version as an Artifact.
```

## 3. Module Architecture (System Design)

```xml
Architect a full module for [MODULE NAME, e.g. Subscription System].

1. Database Schema (Prisma/Drizzle)
2. API / Server Action definitions
3. UI Component hierarchy
4. State management approach
5. External integrations (e.g. Stripe)

Focus on scalability and separation of concerns.
```

## 4. AI Integration

```xml
Integrate AI capabilities into [FEATURE].
- Use Vercel AI SDK
- Implement streaming responses
- Add feedback loops for prompt improvement
- Ensure cost-efficient token usage
```
