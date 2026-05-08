---
name: nextjs-15-pro
description: Expert-level implementation of Next.js 15 features including Server Actions, Partial Prerendering (PPR), React 19 hooks, and Turbopack.
---

# Next.js 15 Pro

## Boundary
This skill is strictly limited to Next.js 15 App Router (`app/` directory) and React 19 features. It does NOT cover the legacy Pages Router (`pages/`) or older React versions.

## When to use
- Building fullstack web applications using Next.js 15.
- Implementing React 19 Server Actions for data mutations.
- Configuring Partial Prerendering (PPR) or streaming UI.
- Upgrading a Next.js 14 project to Next.js 15.

## Workflow
1. **Analyze Requirements**: Determine if the feature requires Server Components (default), Client Components (`"use client"`), or a mix.
2. **Data Fetching**: Use standard `fetch` with caching configurations (`force-cache`, `no-store`) or the new `use cache` directive.
3. **Data Mutation**: Create Server Actions for form submissions.
4. **Optimistic UI**: Use `useOptimistic` hook for immediate feedback during Server Actions.
5. **Streaming**: Wrap slow components in React `<Suspense>` boundaries to enable streaming and PPR.

### Operating principles
- **Server-First**: Always default to Server Components. Only use `"use client"` when interactivity (hooks, event listeners) is strictly required.
- **Action-Driven**: Prefer Server Actions over custom API routes (`route.ts`) for data mutations unless building a public REST API.
- **Progressive Enhancement**: Ensure forms work without JavaScript where possible.
- **Streaming over Blocking**: Never block the entire page load for slow data. Use `Suspense` aggressively.
- **Karpathy Principles Apply**: Think before coding, keep it simple, make surgical changes, and define success criteria.

## Suggested response format
Provide concise Next.js code snippets using the App Router structure. Highlight where `use client` or `use server` boundaries are placed.

## Resources in this skill
- Next.js 15 App Router Documentation
- React 19 Hooks (`use`, `useOptimistic`, `useFormStatus`)
- Server Actions Best Practices

## Quick example
```tsx
import { revalidatePath } from 'next/cache';

// Server Action
async function createPost(formData: FormData) {
  'use server';
  const title = formData.get('title');
  // ... database insertion ...
  revalidatePath('/posts');
}

// Server Component Form
export default function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Checklist before calling the skill done
- [ ] Are we using Server Components by default?
- [ ] Are Server Actions properly typed and secured?
- [ ] Is there appropriate error handling and loading UI via `error.tsx` and `loading.tsx`?
- [ ] Has PPR/streaming been considered for slow data fetches?
- [ ] Does the solution adhere to the 4 Karpathy coding principles?
