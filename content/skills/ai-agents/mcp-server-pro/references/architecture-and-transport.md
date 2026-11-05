# MCP Architecture and Transport

## Three transports

### stdio

- **Mechanism**: Parent process spawns server as child; JSON-RPC over stdin/stdout.
- **Use when**: Local CLI tools, IDE extensions, desktop apps.
- **Pros**: Zero network config, simple to debug, works offline.
- **Cons**: Single client, process lifecycle tied to parent, no remote access.
- **Auth**: Typically none (OS process boundary is the trust boundary).

### SSE (Server-Sent Events)

- **Mechanism**: HTTP endpoint accepts SSE connection; bidirectional JSON-RPC over SSE + POST.
- **Use when**: Remote access needed, single-tenant or internal services.
- **Pros**: Works over standard HTTP, firewall-friendly, real-time push.
- **Cons**: One connection per client, harder to load-balance (sticky sessions).
- **Auth**: API keys, Bearer tokens, or OAuth 2.1.

### Streamable HTTP

- **Mechanism**: Standard HTTP request/response with JSON-RPC body; supports headers, cookies, load balancers.
- **Use when**: Production SaaS, multi-tenant, behind CDN/load balancer.
- **Pros**: Stateless, horizontally scalable, CDN-friendly, full HTTP feature set.
- **Cons**: Slightly more complex client library support; requires HTTP infrastructure.
- **Auth**: OAuth 2.1, mTLS, API keys.

## Decision matrix

| Factor | stdio | SSE | Streamable HTTP |
|--------|-------|-----|-----------------|
| Local only | Best | No | No |
| Remote access | No | Yes | Yes |
| Load balancing | N/A | Sticky | Stateless |
| Auth complexity | None | Low-Medium | Medium-High |
| Debugging ease | High | Medium | Medium |
| Production SaaS | No | Possible | Best |

## SDK selection

- **TypeScript**: `@modelcontextprotocol/sdk` — most mature, best Inspector support.
- **Python**: `mcp` (official) or `fastmcp` — good for data science backends.
- **Java / Kotlin**: `modelcontextprotocol/java-sdk` — enterprise JVM stacks.
