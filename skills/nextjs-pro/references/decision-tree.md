# Decision tree — Next.js

## App Router vs Pages Router (greenfield)

```
Greenfield Next.js?
├── Prefer App Router (app/) for layouts, RSC, modern data APIs
└── Legacy Pages (pages/) only when constrained by ecosystem or gradual migration
```

## Server Action vs Route Handler

```
Mutation from browser?
├── Form / progressive enhancement / same-origin POST → Server Action (validate on server)
├── Third-party webhook / non-browser client / custom verbs → Route Handler
└── Heavy streaming or binary protocol needs → Route Handler or dedicated service
```

## Caching: static vs dynamic

```
Need per-request user/session data on this segment?
├── Yes → avoid static assumptions; `cookies()`/`headers()` imply dynamic — expect `dynamic` behavior
└── No — marketing content, shared for all users
    └── Prefer static/ISR with explicit `revalidate`
```

## `use cache` (when available in your version)

```
Read-heavy segment with expensive pure computation?
├── Consider `use cache` / documented cache APIs for your Next major (see official docs)
└── Always validate invalidation story (tags, revalidatePath)
```

## Self-hosted vs Vercel

```
Need fine-grained edge region control or non-Vercel infra?
├── Map features to runtime (OpenNext, Docker, K8s) — validate Node vs Edge per route — **`edge-cases.md`**
└── Vercel-managed — simpler defaults; still watch env + region — **`deployment-pro`**
```
