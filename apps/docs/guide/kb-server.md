# KB Server

KB Server là NestJS backend chạy ở `services/kb-server`, port 4000.

## Stack

| Component | Role |
|-----------|------|
| **Neo4j** | Graph store — Memory nodes, SKILL relationships |
| **Meilisearch** | Full-text search — index `memory` |
| **Redis** | Cache tầng 1 — TTL 300s, best-effort |
| **NestJS** | HTTP API, DI, lifecycle hooks |

## Khởi động

```bash
cd services/kb-server
cp .env.example .env

# Bắt buộc: đặt password mạnh
KB_MASTER_PASSWORD=your-strong-secret-here

docker compose up -d
```

## Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Status neo4j, redis, meili |
| `POST` | `/api/keys` | Tạo API key mới |
| `POST` | `/kb/push` | Ghi memory (qua policy.redact) |
| `GET` | `/kb/search?q=...` | Tìm kiếm (cache → Meili → Neo4j) |
| `GET` | `/kb/:id` | Lấy memory theo ID (cache → Neo4j) |

## Health check

```bash
curl http://localhost:4000/health
```

```json
{
  "status": "ok",
  "neo4j": true,
  "redis": true,
  "meili": true
}
```

Nếu một service down, `status` trả về `"degraded"` — server vẫn hoạt động.

## Security

- API keys được bcrypt-hash trước khi lưu DB
- Raw key chỉ hiển thị một lần khi tạo
- Server từ chối khởi động nếu `KB_MASTER_PASSWORD` chưa set
- Mọi memory write phải qua `policy.redact()` — không bao giờ ghi secret thô
- Cypher queries dùng parameterized `$param`, không string interpolation
