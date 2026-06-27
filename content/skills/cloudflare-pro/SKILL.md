---
name: cloudflare-pro
description: >-
  Expert Cloudflare development covering Workers, R2 Storage, D1 Database, KV,
  Pages, and Edge computing architecture.
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

# Cloudflare Pro

Expert-level orchestration of Cloudflare's edge platform. Focuses on low-latency computing, serverless databases, and global scalability.

## Boundary

**`cloudflare-pro`** covers the entire Cloudflare ecosystem for developers: Workers (Serverless functions), R2 (Object storage), D1 (SQLite at the edge), KV (Key-Value storage), Durable Objects (Stateful edge), and Pages (Static hosting). It does NOT cover general DNS management unless related to the application.

## When to use

- Building globally distributed, low-latency applications at the edge.
- implementing serverless backends using Cloudflare Workers and D1/R2.
- Designing stateful edge applications with Durable Objects.
- Deploying frontend applications via Cloudflare Pages with edge functions.

## Workflow

1. **Project Init**: Initialize with `wrangler`.
2. **Database Design**: Set up D1 (SQL) or KV (NoSQL) for the edge.
3. **Storage Setup**: Configure R2 buckets for object storage.
4. **Worker Logic**: Write edge functions using TypeScript and standard Web APIs.
5. **Deployment**: Deploy via `wrangler publish` or GitHub Actions.
6. **Monitoring**: Analyze logs and performance via Cloudflare Dashboard.

### Operating principles

- **Edge-First**: Design for execution as close to the user as possible.
- **Statelessness (Mostly)**: Use Durable Objects only when state is absolutely required.
- **Web Standards**: Leverage standard Web APIs (Fetch, Streams, Crypto) available in the Worker runtime.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Cloudflare Edge Engineer.
</Role>

<Feature>
[Edge Component/Worker Description]
</Feature>

<Implementation>
[Clean TypeScript code for Cloudflare Worker/Config Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan with Wrangler examples]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Cloudflare Roadmap | [roadmap.sh/cloudflare](https://roadmap.sh/cloudflare) |
| Workers Documentation | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| Wrangler CLI | [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler/) |
| D1 Database | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |

## Quick example

**Feature:** A Cloudflare Worker that fetches data from D1.

```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { results } = await env.DB.prepare(
      "SELECT * FROM users LIMIT 10"
    ).all();
    return Response.json(results);
  },
};
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Data placement and cold start impact analyzed.
- [ ] **Simplicity First**: Simple KV or Workers used unless D1/Durable Objects required.
- [ ] **Surgical Changes**: Only updated necessary Worker code or `wrangler.toml`.
- [ ] **Goal-Driven Execution**: Verified with `wrangler dev` and local D1 testing.
- [ ] TypeScript types correctly defined for `Env` and Bindings.
- [ ] Performance optimized (efficient use of `fetch`, caching headers).
- [ ] Security headers and CORS policies correctly configured.
