# Agentic Goal CLI — Plan

> Trạng thái: **Draft, chờ approve.** Snapshot dự án Rust cũ ở commit `42968b5` (trước khi xoá).

## 1. Mục tiêu

Một CLI tối giản chỉ có hai command user-facing:

- `/goal "<idea>"` — nhận ý tưởng, chạy toàn bộ pipeline agentic SDLC tới khi hoàn thành goal.
- `/continue` — resume goal đang dở nếu hết quota / lỗi / interrupt.

Pipeline gồm 4 giai đoạn lớn, mỗi giai đoạn **loop tới khi user approve**:

1. **Plan** — model tier-1 lập plan chi tiết → `plan.md`.
2. **Rules & Stack** — hỏi user các quyết định (tech stack, clean code, conventions) → `rules.md`.
3. **Tasks** — model tier-2 phân rã plan thành ticket theo phase → `tasks.md` + `kanban.md`.
4. **Execution loop** — với mỗi ticket: ticket-planner → **coder (model A)** → **reviewer (model B, BẮT BUỘC khác model A)** chấm điểm 9/10 → commit. Lặp tới hết backlog.
   - **Coder** và **Reviewer** là hai agent độc lập, dùng **hai model khác nhau** (khác provider càng tốt) để tránh bias tự-review.
   - Coder không bao giờ được tự chấm điểm code của mình; chỉ Reviewer có quyền approve commit.

## 2. Stack

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Harness | **LangGraph (Python)** | State graph + checkpointing + human-in-the-loop |
| Language | Python 3.11+ | |
| CLI | **Typer** + **Rich** | UX đẹp, render kanban/markdown trong terminal |
| LLM routing | LangChain `init_chat_model` + **OpenRouter** | 1 key, đủ tier; có thể fallback OpenAI/Anthropic native |
| State | `langgraph.checkpoint.sqlite.SqliteSaver` | File `.goal/<goal-id>/state.db` |
| Sandbox | `git worktree` | Mỗi goal isolate ở `.goal/workspaces/<goal-id>/` |
| Tools (coder) | LangChain `@tool` | read_file, write_file, run_shell, git_* |
| Tests | pytest + LangGraph in-memory checkpointer | |
| Lint/format | ruff + mypy | |
| Package mgr | uv hoặc poetry | |

## 3. Model tiers

Cấu hình mặc định trong `.env`, override được qua `rules.md`.

| Vai trò | Tier | Default model |
|---|---|---|
| Planner (`plan.md`) | **Top-1** | `anthropic/claude-opus-4` hoặc `openai/gpt-5` |
| Rules advisor | Top-1 | same as planner |
| Task decomposer | **Second** | `anthropic/claude-sonnet-4` |
| Ticket planner | Normal | `openai/gpt-4.1-mini` |
| Coder | Normal | same as ticket planner |
| Reviewer | **Top tier, khác coder** | bắt buộc khác provider/model coder để giảm bias |
| Resume analyzer | Second | sonnet/gpt-5-mini |

Constraint cứng: `reviewer.model != coder.model`.

## 4. Graph topology

```
START
 └─► plan_node ──interrupt(approve?)──┐
        ▲                             │
        └─────── feedback ────────────┘ (loop tới khi approve)
        │
        ▼  ghi plan.md
   rules_node ── sinh câu hỏi ──interrupt(answers)──► ghi rules.md
        │                                  ▲
        └──── user yêu cầu sửa ────────────┘
        │
        ▼
   tasks_node ──interrupt(approve?)──► ghi tasks.md + init kanban.md
        │
        ▼
   ┌── ticket_loop (Send API, mỗi ticket = 1 subgraph) ──┐
   │                                                     │
   │   pick_ticket                                       │
   │       │                                             │
   │       ▼                                             │
   │   ticket_plan_node ──► ghi tickets/ticket-N-plan.md │
   │       │                                             │
   │       ▼                                             │
   │   coder_node (tools: fs, shell, git)                │
   │       │                                             │
   │       ▼                                             │
   │   reviewer_node ── score < 9 ── feedback ──┐        │
   │       │                                    │        │
   │       │ score ≥ 9                          │        │
   │       ▼                                    ▼        │
   │   git commit ─► update kanban.md ◄── coder_node     │
   │       │                                             │
   │       ▼                                             │
   └── còn ticket? ──yes──► pick_ticket                  │
         │                                               │
         └── no ─────────────────────────────────────────┘
        │
        ▼
       END
```

## 5. CLI surface

User-facing chính:

```bash
goal "<idea>"           # alias: goal start
goal start "<idea>"     # tạo .goal/<goal-id>/, init graph mới
goal continue           # resume goal mới nhất, hoặc --id <goal-id>
```

Phụ trợ:

```bash
goal status [--watch]   # in kanban + phase hiện tại (live update nếu --watch)
goal list               # liệt kê goals đã chạy
goal logs [--id <goal>] [--follow]   # xem lại agent transcript
```

Quản lý cấu hình model (xem §5a):

```bash
goal config show                              # in config hiệu lực + nguồn
goal config set <role> <model> [--provider X] # ví dụ: goal config set reviewer anthropic/claude-opus-4
goal config unset <role>                      # về default
goal config models                            # liệt kê model registry + giá
goal config validate                          # check ràng buộc (reviewer != coder, có API key, …)
goal config edit                              # mở $EDITOR với file YAML
```

Flag chung:
- `--verbose / -v` (lặp được: `-vv`, `-vvv`) — tăng độ chi tiết log.
- `--quiet / -q` — chỉ in kết quả cuối.
- `--no-color`, `--json` — output mode cho CI/script.
- `--model-override <role>=<model>` — override 1 lần cho command hiện tại.

## 5a. Model configuration

Mỗi **role** (planner, rules_advisor, task_decomposer, ticket_planner, coder, reviewer, resume_analyzer) config độc lập. Resolution order (cao → thấp):

1. `--model-override` flag trên CLI.
2. `rules.md` (do LLM + user chốt trong Phase 2 của pipeline, có frontmatter YAML).
3. `.goal/<goal-id>/config.yaml` — config riêng cho goal đó.
4. `~/.config/agentic-goal/config.yaml` — config user global.
5. `.env` variables (ví dụ `GOAL_MODEL_CODER=...`).
6. Defaults bake-in trong code.

**File format** (`~/.config/agentic-goal/config.yaml`):

```yaml
default_provider: openrouter
providers:
  openrouter:
    api_key_env: OPENROUTER_API_KEY
    base_url: https://openrouter.ai/api/v1
  anthropic:
    api_key_env: ANTHROPIC_API_KEY
  openai:
    api_key_env: OPENAI_API_KEY

roles:
  planner:
    model: anthropic/claude-opus-4
    temperature: 0.2
    max_tokens: 8000
  rules_advisor:
    model: anthropic/claude-opus-4
  task_decomposer:
    model: anthropic/claude-sonnet-4
  ticket_planner:
    model: openai/gpt-4.1-mini
  coder:
    model: openai/gpt-4.1-mini
    temperature: 0.1
    tools_enabled: [read_file, write_file, run_shell, git]
  reviewer:
    model: anthropic/claude-opus-4   # constraint: != coder.model
    temperature: 0.0
  resume_analyzer:
    model: anthropic/claude-sonnet-4

budgets:
  per_goal_usd: 5.00
  per_ticket_usd: 0.50
  warn_at_pct: 80
  hard_stop: true
```

**Constraint validation** (chạy lúc `goal start` và `goal config validate`):
- `roles.reviewer.model != roles.coder.model` → lỗi cứng.
- API key của provider tương ứng phải tồn tại.
- Model có trong registry (`goal config models`) → cảnh báo nếu chưa biết.

## 5b. Logging & live agent transcript

Yêu cầu: khi chạy, CLI phải **stream toàn bộ step** như đang chat với agent, không phải spinner câm.

**3 sink song song**:

| Sink | Định dạng | Mục đích |
|---|---|---|
| **Terminal (Rich)** | Live panel + colored stream | UX trực tiếp cho user |
| `events.jsonl` | 1 dòng JSON/event | Audit, replay, debug |
| `transcript.md` | Markdown chat-style | Đọc lại sau, share, dán vào issue |

**Event schema** (`events.jsonl`):

```json
{
  "ts": "2026-05-25T22:17:03.412+07:00",
  "goal_id": "g_2026_…",
  "phase": "execution",
  "ticket_id": "ticket-007",
  "node": "coder",
  "role": "coder",
  "model": "openai/gpt-4.1-mini",
  "event_type": "llm_chunk",       // start|llm_chunk|llm_end|tool_call|tool_result|file_write|git|interrupt|approval|error|score
  "data": { "delta": "…" },
  "tokens": { "in": 0, "out": 12 },
  "cost_usd": 0.00021,
  "latency_ms": 87
}
```

**Terminal layout** (Rich):

```
┌─ Goal g_2026_0525_2217 · Phase: execution · Ticket 007/23 ─────────┐
│ Kanban:  Backlog 16  ·  In Progress 1  ·  Review 0  ·  Done 6     │
│ Budget:  $0.84 / $5.00  (16.8%)                                    │
├────────────────────────────────────────────────────────────────────┤
│ 🧠 coder · gpt-4.1-mini  (12.3s, 1,204 tok, $0.0021)               │
│ > Tôi sẽ tạo file `src/api/users.ts` với 3 handler…                │
│ 🔧 tool: write_file(src/api/users.ts, 84 lines)  ✓                 │
│ 🔧 tool: run_shell("npm test")  …                                  │
│ ✓ exit 0 · 23 passed                                               │
│                                                                    │
│ 🔍 reviewer · claude-opus-4                                        │
│ > Score: 7/10. Thiếu test cho edge case empty body…                │
│ ↩ feedback → coder (vòng 2/5)                                      │
└────────────────────────────────────────────────────────────────────┘
```

**Verbosity levels**:
- Default: header + tool calls + reviewer scores + interrupts.
- `-v`: + reasoning của agent (LLM message bodies).
- `-vv`: + token-level streaming, full tool args/results.
- `-vvv`: + raw HTTP requests (debug).

**`goal logs`**: render lại `transcript.md`, có filter `--phase`, `--ticket`, `--role`, `--since`.

**Implementation**: dùng LangGraph `astream_events()` v2, map mỗi event → 3 sink qua một `EventBus`. Mỗi LLM call wrap bằng callback handler để bắt token usage + cost (tra giá từ model registry).

## 6. Artifacts (per goal)

```
.goal/<goal-id>/
├── plan.md
├── rules.md
├── tasks.md
├── kanban.md              # Backlog / In Progress / Review / Done
├── tickets/
│   ├── ticket-001-plan.md
│   ├── ticket-001-review.md  # lịch sử scoring + feedback
│   └── ...
├── config.yaml            # model config riêng cho goal (override global)
├── state.db               # LangGraph checkpoint
├── events.jsonl           # log mọi event (LLM chunk, tool call, score, …)
├── transcript.md          # agent transcript chat-style để đọc/share
└── workspaces/            # git worktree riêng cho goal này
```

## 7. Resume (`/continue`)

1. Load `state.db`, lấy thread_id mới nhất.
2. Chạy `resume_analyzer_node`:
   - Đọc `kanban.md`, ticket plans, `git log`, diff WIP của worktree.
   - So sánh với LangGraph state. Nếu lệch (user sửa tay) → patch state, log diff.
3. Gọi `graph.invoke(None, config)` → LangGraph tự tiếp tục từ checkpoint.
4. Nếu interrupt đang chờ user input → re-prompt.

## 8. Quota / error handling

- Mọi LLM call wrap qua `tenacity` (exponential backoff) + circuit breaker.
- Bắt `RateLimitError` / `InsufficientQuotaError` / `APIError` → graph raise `QuotaExceeded`.
- CLI catch → in hướng dẫn `goal continue` + exit code `75` (EX_TEMPFAIL).
- Mỗi node check budget trong state trước khi gọi (cumulative token & USD cost).
- `events.jsonl` lưu mọi call để audit + tính cost.

## 9. Review scoring rubric

Reviewer trả JSON:

```json
{
  "score": 0-10,
  "per_criterion": {
    "correctness_vs_plan": 0-2,
    "style_vs_rules": 0-2,
    "test_coverage": 0-2,
    "no_regressions": 0-2,
    "no_dead_code": 0-2
  },
  "blocking_issues": ["..."],
  "suggestions": ["..."]
}
```

- `score >= 9` → commit.
- `score < 9` → feed `blocking_issues + suggestions` ngược cho coder.
- Max **5 vòng** coder↔reviewer cho 1 ticket → escalate (interrupt hỏi user).

## 10. Implementation roadmap (high-level)

> Các phase này sẽ được CLI tự sinh thành ticket khi tự build chính nó (dogfood). Đây là outline để bắt đầu thủ công phase 0–1.

**Phase 0 — Bootstrap**
- Init `pyproject.toml` (uv), package `agentic_goal/`
- Setup ruff, mypy, pytest, pre-commit, CI (GitHub Actions)
- README skeleton

**Phase 1 — CLI shell + config**
- Typer app với 4 command stub
- `.env` loader (pydantic-settings)
- Model registry: load tier config, validate `reviewer != coder`
- OpenRouter client wrapper qua `init_chat_model`

**Phase 2 — Planning subgraph**
- State schema (TypedDict)
- `plan_node` + system prompt cho planner
- Interrupt approval flow + diff render
- Atomic write `plan.md`

**Phase 3 — Rules subgraph**
- LLM sinh ra list câu hỏi dựa trên `plan.md`
- CLI prompt user (Rich) → thu thập answers
- Sinh `rules.md`

**Phase 4 — Task decomposition**
- `tasks_node` chia phase + ticket (schema rõ: id, title, deps, acceptance criteria)
- Ghi `tasks.md` + init `kanban.md`

**Phase 5 — Ticket execution loop**
- Ticket subgraph (planner → coder → reviewer)
- Tool definitions cho coder: fs, shell, git
- Git worktree setup per goal
- Update kanban sau mỗi state change

**Phase 6 — `/continue` + resume analyzer**
- SqliteSaver wiring
- `resume_analyzer_node` + state reconciliation
- Quota exception handling

**Phase 7 — Polish**
- Rich live kanban view (`goal status --watch`)
- Cost dashboard
- E2E demo: cho CLI tự build một project nhỏ (ví dụ: todo CLI)

## 11. Open questions (cần trả lời trước Phase 1)

- [ ] Có dùng **LangSmith** để trace không? (free tier đủ dev)
- [ ] CLI có hỗ trợ **multi-goal song song** không, hay strict single-goal?
- [ ] Reviewer khi đạt 9/10 có cần user double-check trước commit, hay auto-commit?
- [ ] Strategy cho ticket có **dependency**: topo-sort tự động hay user chọn thứ tự?
- [ ] Budget cap (USD) per goal — hard stop hay chỉ warn?

## 12. Risks

| Risk | Mitigation |
|---|---|
| Coder agent hallucinate path / phá repo | Chạy trong git worktree, mọi shell call qua allowlist + timeout |
| Reviewer thiên vị (same provider) | Hard constraint khác model + có thể yêu cầu khác provider |
| Infinite loop coder↔reviewer | Cap 5 vòng + escalate user |
| State drift sau `/continue` | resume_analyzer reconcile với git + kanban |
| Cost runaway | Budget tracker per goal, exit khi vượt cap |
| LangGraph API changes | Pin version, abstract qua thin wrapper |

---

**Bước tiếp theo**: review plan này, trả lời các open questions ở §11, sau đó approve để bắt đầu Phase 0.
