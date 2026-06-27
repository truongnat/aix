# CLI Reference

## `aix install`

Compile canonical skills ra provider artefacts.

```bash
aix install [--provider <name>] [--dry-run]
```

| Flag | Default | Mô tả |
|------|---------|-------|
| `--provider` | auto-detect | `claude` \| `cursor` \| `codex` \| `gemini` |
| `--dry-run` | false | Preview changes không ghi file |

## `aix run`

Chạy task với AI agent.

```bash
aix run "<task>" [--auto] [--budget <usd>] [--provider <name>]
```

| Flag | Default | Mô tả |
|------|---------|-------|
| `--auto` | false | Autonomous mode (LangGraph.js engine) |
| `--budget` | `2.0` | USD budget hard limit |
| `--provider` | auto-detect | Provider để dùng cho coder/reviewer |

**Guardrail mode** (default): dừng tại mỗi phase `Start → Discuss → Plan → Run → Verify → Ship`.

**Autonomous mode** (`--auto`): chạy loop tự động đến khi score ≥ 9/10 hoặc hết budget.

## `aix skills`

Quản lý skills catalog.

```bash
aix skills list [--category <name>]
aix skills search "<query>"
aix skills show <name>
```

## `aix context`

Phân tích codebase.

```bash
aix context build [--path <dir>] [--lang <language>]
aix context query "<question>"
aix context wiki [--out <dir>]
```

## `aix memory`

Đọc/ghi memory qua KB server.

```bash
aix memory push "<content>"
aix memory search "<query>"
aix memory get <id>
```

## `aix kb`

Quản lý KB server connection.

```bash
aix kb status
aix kb connect --url <url> --key <api-key>
```

## `aix doctor`

Kiểm tra toàn bộ setup.

```bash
aix doctor
```

Kiểm tra: provider detection, skills loaded, KB server health, policy redaction.

## `aix eval`

Chạy A/B eval harness.

```bash
aix eval run --variants a.md,b.md --cases cases.json
aix eval report
```

## `aix verify`

Verify output của run trước.

```bash
aix verify [--session <id>]
```

## `aix ship`

Mark session hoàn thành và sync memory.

```bash
aix ship [--session <id>]
```
