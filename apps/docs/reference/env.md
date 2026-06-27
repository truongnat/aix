# Environment Variables

## KB Server (`services/kb-server`)

| Variable | Required | Default | Mô tả |
|----------|----------|---------|-------|
| `KB_MASTER_PASSWORD` | **Yes** | — | Admin password, bcrypt-hash cho API key generation. Server từ chối start nếu thiếu. |
| `PORT` | No | `4000` | HTTP port |
| `NEO4J_URI` | No | `bolt://localhost:7687` | Neo4j connection URI |
| `NEO4J_USER` | No | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | No | `password` | Neo4j password |
| `MEILI_HOST` | No | `http://localhost:7700` | Meilisearch host |
| `MEILI_MASTER_KEY` | No | `masterKey` | Meilisearch master key |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL |

## CLI (`aix`)

| Variable | Mô tả |
|----------|-------|
| `AIX_KB_URL` | KB server URL (default: `http://localhost:4000`) |
| `AIX_KB_KEY` | API key cho KB server |
| `AIX_PROVIDER` | Override auto-detect provider (`claude`\|`cursor`\|`codex`\|`gemini`) |
| `AIX_BUDGET_USD` | Default budget limit cho `aix run --auto` |

## Template

```bash
cp services/kb-server/.env.example services/kb-server/.env
# Chỉnh sửa .env — đặt KB_MASTER_PASSWORD bắt buộc
```

::: warning Bảo mật
Không bao giờ commit `.env` vào git. Chỉ commit `.env.example` với placeholder values.
:::
