# Getting Started

## Requirements

- **Node.js 22 LTS** or later
- **pnpm 9+**
- **Docker** (for KB server — Neo4j, Meilisearch, Redis)

## Install

```bash
npx aix install
```

Tự động phát hiện provider (Claude Code, Cursor, Codex, Gemini CLI) và compile skills ra đúng format.

### Chỉ định provider cụ thể

```bash
npx aix install --provider claude
npx aix install --provider cursor
npx aix install --provider codex
npx aix install --provider gemini
```

## Khởi động KB Server

```bash
cd services/kb-server
cp .env.example .env
# Đặt KB_MASTER_PASSWORD thành secret mạnh
docker compose up -d
```

Kiểm tra kết nối:

```bash
npx aix doctor
```

Kết quả mong đợi:

```
✓ Provider     claude  (detected)
✓ Skills       163 loaded
✓ KB Server    connected  (neo4j ✓  meili ✓  redis ✓)
✓ Policy       redaction active
```

## Chạy lần đầu

### Guardrail mode (có người duyệt)

```bash
npx aix run "Add rate limiting to the auth API"
```

aix dẫn qua từng phase: `Start → Discuss → Plan → Run → Verify → Ship`, dừng lại chờ xác nhận ở mỗi bước.

### Autonomous mode

```bash
npx aix run "Add rate limiting to the auth API" --auto
```

LangGraph.js engine chạy tự động loop đến khi reviewer chấm ≥ 9/10 hoặc đụng budget limit.

## Tiếp theo

- [Architecture](./architecture) — hiểu cách các package kết nối
- [Skills & Progressive Disclosure](./skills) — cách SKILL.md hoạt động
- [CLI Reference](/reference/cli) — tất cả lệnh
