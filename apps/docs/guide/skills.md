# Skills & Progressive Disclosure

## SKILL.md là gì?

`SKILL.md` là format chuẩn xuyên-provider — chạy trên Claude Code, Cursor, Codex, Gemini CLI và 8+ agent framework khác.

```
.claude/skills/
└── api-design/
    ├── SKILL.md          ← L1 (luôn load) + L2 (khi kích hoạt)
    └── references/
        ├── patterns.md   ← L3 (lazy load khi cần)
        └── examples.md
```

## Progressive Disclosure 3 tầng

| Tầng | Khi nào load | Chi phí | Nội dung |
|------|-------------|---------|----------|
| **L1 · Metadata** | Luôn (khởi động) | ~100 token/skill | `name` + `description` frontmatter |
| **L2 · Instructions** | Khi skill được kích hoạt | < 5k token | Thân SKILL.md |
| **L3 · Resources** | Khi cần (đọc qua bash) | Không giới hạn | `references/`, `scripts/`, `assets/` |

→ Cho phép cài **163+ skill mà không phình context**, vì L1 chỉ ~100 token.

## Cấu trúc SKILL.md

```yaml
---
name: api-design-pro          # ≤ 64 ký tự, kebab-case, không chứa "claude"/"anthropic"
description: |                # ≤ 1024 ký tự, phải nêu CÁI GÌ + KHI NÀO dùng
  Expert API design guidance covering REST, GraphQL, and gRPC.
  Use when designing new APIs or reviewing existing contracts.
---

# API Design Pro

## Principles
...
```

## Catalog

```bash
# Xem tất cả skills
npx aix skills list

# Tìm kiếm
npx aix skills search "rate limiting"

# Chi tiết một skill
npx aix skills show api-design-pro
```

## Categories trong catalog

aix có 163 SKILL.md phân vào các nhóm:

- **Domain skills** — api-design, database, security, performance, testing...
- **Process skills** — code-review, debug, incident-response, release...
- **Reference** — system-design, ADR, anti-patterns, SRE, multi-tenancy...
