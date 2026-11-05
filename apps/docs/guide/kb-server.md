# KB Server

The NestJS service uses Node's built-in **SQLite/FTS5**, not Neo4j, Meilisearch or Redis.
Use a current Node 22 release (22.13 or newer) or Node 24. The default data directory is
`~/.aix/kb`; `memory.db` stores records/search data and `api-keys.json` stores bcrypt key hashes.
Search/get caching is process-local, bounded to 1000 entries with a default 300-second TTL.

## Local CLI-managed service

From a built checkout:

```bash
node packages/cli/dist/index.js kb ensure
node packages/cli/dist/index.js kb status
node packages/cli/dist/index.js kb list
node packages/cli/dist/index.js kb search "decision"
node packages/cli/dist/index.js kb stop
```

CLI-managed startup creates a stable random management credential in a private data directory
with a mode-0600 credential file; it does not use a fixed development password. An explicit
`KB_MASTER_PASSWORD` overrides that credential. Set `KB_API_KEY` to access an existing service
without creating local management credentials. API keys cannot shut down the service.
Automatic `run` cleanup only stops a service started by that CLI process. Explicit `kb stop`
requires the service's management credential; do not stop a shared service casually.

## Standalone service

Set `KB_MASTER_PASSWORD` in the process environment, then start the built service:

```bash
pnpm --filter @x/kb-server... build
pnpm --filter @x/kb-server start
```

The standalone process refuses to start without the password. It defaults to
`127.0.0.1:4000`; `KB_HOST`, `PORT` and `KB_DATA_DIR` override listener/data settings.
Use a strong unique password; do not place it in source, logs or committed shell commands.

## Docker Compose

```bash
cp services/kb-server/.env.example services/kb-server/.env
# Edit .env: set KB_MASTER_PASSWORD to a strong unique value.
docker compose --env-file services/kb-server/.env -f services/kb-server/docker-compose.yml up --build -d
```

Compose builds from the workspace root, includes the service's workspace policy dependency,
persists SQLite/key data in the `kb_data` volume, and publishes only on host loopback.
The container listens on `0.0.0.0` internally. No external database/search/cache containers
are needed. `KB_PORT` selects the published host port.

## HTTP contract

| Method | Path | Authorization / behavior |
|---|---|---|
| `GET` | `/health` | Public; `{status, sqlite, cache}` |
| `POST` | `/api/v1/memory` | API key or master password; record body |
| `GET` | `/api/v1/memory/search?q=...&k=10` | API key or master password; full-text search |
| `GET` | `/api/v1/memory/:id` | API key or master password; record or null |
| `GET` | `/api/v1/memory?kind=decision` | API key or master password; optional kind filter |
| `POST` | `/shutdown` | Master password only; ordinary API keys denied |

Memory calls accept `x-api-key` or `x-master-password`. There is currently no public HTTP
key-issuance route; `AuthService.generateKey` is the programmatic issuance interface.
`KbStore(url, fallbackDirectory, credentials)` accepts `{apiKey}` or `{masterPassword}`.
HTTP 401/403 raises an authorization error and never silently switches storage. Network/server
failures retain the Markdown fallback behavior; it is not a substitute for fixing credentials.

## Persistence security

Direct service writes redact string fields before SQLite/FTS/cache persistence. Session and
Markdown persistence also sanitize sensitive content, while identity/path fields are rejected
when unsafe rather than renamed. Generated source with recognized secrets is rejected before
writing to avoid producing silently altered code. Redaction is pattern-based, not a guarantee
that arbitrary confidential material is recognized; do not send real secrets to model prompts.
