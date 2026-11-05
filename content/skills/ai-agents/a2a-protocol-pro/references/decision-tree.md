# A2A Decision Tree

```
How many agents?
├── 1 → Use MCP-only (no A2A needed)
├── 2-3 → Gateway pattern
├── 3-10 → Gateway or Pipeline
└── 10+ or dynamic → Mesh (with strong observability)

What is the work distribution?
├── Predictable, sequential → Pipeline
├── Predictable, parallelizable → Gateway
└── Unpredictable, emergent → Mesh

Auth requirements?
├── Same trust domain → mTLS or API keys
├── Cross-organization → OAuth 2.1 with scoped capabilities
└── Public internet → OAuth 2.1 + mTLS
```
