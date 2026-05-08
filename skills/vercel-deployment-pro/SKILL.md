---
name: vercel-deployment-pro
description: Best practices for deploying fullstack applications to Vercel, including Edge Functions, ISR/SSG strategies, and caching.
metadata:
  short-description: Vercel — Edge Functions, Caching, ISR, Runtime optimization
  content-language: en
  domain: devops
  level: professional
---

# Vercel Deployment Pro

## Boundary
This skill covers deployment and configuration specific to the Vercel platform, including `vercel.json`, Vercel CLI, Edge Runtime, and Vercel Postgres/KV integrations.

## When to use
- Deploying a Next.js or React app to Vercel.
- Optimizing Serverless Function execution times.
- Configuring Edge Functions for middleware or fast data fetching.
- Setting up Vercel Data products (KV, Postgres, Blob).

## Workflow
1. **Analyze Requirements**: Determine if the app needs SSR, ISR, or Edge capabilities.
2. **Configure `vercel.json`**: Set headers, redirects, rewrites, and cron jobs.
3. **Optimize Runtime**: Switch heavy functions to Serverless and fast middleware to Edge.
4. **Environment Variables**: Configure preview vs. production environment variables.
5. **Caching Strategy**: Implement Vercel Data Cache and Full Route Cache properly.

### Operating principles
- **Push to Edge**: Move analytics, authentication checks, and A/B testing to Edge Middleware.
- **Cache aggressively**: Use `stale-while-revalidate` (ISR) for data that doesn't need to be strictly real-time.
- **Fail Gracefully**: Provide fallback UI for serverless timeouts (10s on hobby, 60s on pro).
- **Karpathy Principles Apply**: Think before coding, keep it simple, make surgical changes, and define success criteria.

## Suggested response format
Your response MUST use the professional XML-style format:

```xml
<Role>
Senior DevOps/Fullstack Engineer (Vercel Expert).
</Role>

<Feature>
[Brief description of the Vercel configuration]
</Feature>

<Implementation>
[vercel.json or code snippets]
</Implementation>

<Verification>
[Step-by-step verification plan]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |
| Caching in Next.js | [nextjs.org/docs/app/building-your-application/caching](https://nextjs.org/docs/app/building-your-application/caching) |
| Vercel CLI | [vercel.com/docs/cli](https://vercel.com/docs/cli) |

## Quick example
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "crons": [
    {
      "path": "/api/cron/sync-data",
      "schedule": "0 0 * * *"
    }
  ]
}
```

```tsx
// Force Edge Runtime for a specific route
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ message: 'Hello from Edge!' });
}
```

## Checklist before calling the skill done
- [ ] **Think Before Coding**: Hosting target and runtime constraints confirmed.
- [ ] **Simplicity First**: Optimized bundle size and minimized middleware overhead.
- [ ] **Surgical Changes**: Minimal environment variable changes and targeted route updates.
- [ ] **Goal-Driven Execution**: Cache behavior and Edge function execution verified.
- [ ] Are environment variables correctly mapped for production vs. preview?
- [ ] Is the correct runtime (Node vs Edge) used for API routes?
- [ ] Are Cache-Control headers optimized?
