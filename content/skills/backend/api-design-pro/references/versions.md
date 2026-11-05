# API design — versioning notes

## Strategies

- **URL prefix** (`/v1/`) — simple for caches and docs; duplicate routes during transition.
- **Header** (`Accept-Version`) — cleaner URLs; harder for humans and some proxies.
- **Query** — avoid for caching reasons unless CDN rules are explicit.

## Deprecation

- Publish **sunset** date; return `Deprecation` + `Link` headers where applicable.
- Measure traffic before removal; keep one major overlap window when possible.

## OpenAPI

- Single spec per major version or use `servers` + tags; never silently change field meaning in-place.
