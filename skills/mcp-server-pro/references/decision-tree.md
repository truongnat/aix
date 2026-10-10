# MCP Decision Tree

## Transport selection

```
Is the server local-only (same machine)?
├── Yes → stdio
└── No → Remote access needed?
    ├── No → stdio (e.g., Docker sidecar)
    └── Yes → Single-tenant or multi-tenant?
        ├── Single-tenant → SSE + API key
        └── Multi-tenant → Streamable HTTP + OAuth 2.1
```

## Primitive selection

```
What is the agent trying to do?
├── Call a function with arguments → Tool
├── Read structured data by URI → Resource
├── Use a reusable instruction template → Prompt
└── Combination → All three, justified per use case
```

## Auth selection

```
What is the deployment context?
├── Local CLI / IDE → No auth (OS process boundary)
├── Internal single-tenant → API key
├── Multi-tenant SaaS → OAuth 2.1
└── Service mesh / K8s → mTLS
```
