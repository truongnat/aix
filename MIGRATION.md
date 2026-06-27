# aix — Migration to the Superpowers Plugin Model

> Chuyển aix từ *"CLI compile + LangGraph engine"* sang *"plugin Claude Code: methodology spine
> (process skills) + domain library, kích hoạt bằng SessionStart hook + dispatcher skill, thực thi
> bằng subagent native của host."* Tham chiếu: [obra/superpowers](https://github.com/obra/superpowers).

Trạng thái: `[ ]` chưa · `[~]` đang · `[x]` xong.

---

## Cơ chế superpowers (đã nghiên cứu)

1. **`.claude-plugin/plugin.json`** — manifest đơn (name, version, description, author, license, keywords).
   Không nhúng hooks/commands ở đây.
2. **`hooks/hooks.json`** — `SessionStart`, matcher `startup|clear|compact`, chạy
   `${CLAUDE_PLUGIN_ROOT}/hooks/<script>` (sync).
3. **`hooks/session-start`** — đọc `skills/using-superpowers/SKILL.md`, inject inline với framing
   *"You have superpowers… for all other skills, use the 'Skill' tool"*. Đây là toàn bộ cơ chế dispatch.
4. **Subagent** dùng Task tool native của host — không tự build executor.
5. Marketplace repo riêng để `/plugin marketplace add`.

---

## Phase A — Plugin packaging + dispatch ✅ (xong)

- [x] `.claude-plugin/plugin.json` — manifest aix ở repo root.
- [x] `.claude-plugin/marketplace.json` — để `/plugin marketplace add` cài được.
- [x] `hooks/hooks.json` — SessionStart hook (startup|clear|compact).
- [x] `hooks/session-start.sh` — inject meta-skill `using-aix` + framing dùng Skill tool.
- [x] `content/skills/using-aix/SKILL.md` — meta-skill entry point: giới thiệu xương sống
  methodology + cách gọi skill khác qua `router-pro` / `tool-discovery`.

**Acceptance:** ✅ verify cục bộ — `using-aix` validate (164 skills); hook emit JSON
`SessionStart.additionalContext` (2784 chars, chứa "Using aix"); 3 config JSON hợp lệ.
Còn lại: test cài thật vào Claude Code qua `/plugin marketplace add truongnat/aix`.

---

## Phase B — Methodology spine (xương sống process) ✅ (xong)

- [x] Định nghĩa workflow top-level → `content/workflows/engineering-spine.md`
  (9 bước: discussing-goals → brainstorming → writing-plans → worktrees → TDD →
  executing-plans → code-review → verification → remembering).
- [x] Surface process skills hiện có làm backbone — chúng đã có sẵn từ
  `ai-engineering-harness` + `agentic-sdlc` đã merge; spine map đúng tên skill thật.
- [x] `using-aix` trỏ tới spine với **tên skill thật** (verify: hook inject 3374 chars,
  chứa `discussing-goals`, `executing-plans`).

Phát hiện: aix **đã có sẵn** toàn bộ methodology skills từ repo merge — Phase B chủ yếu là
*wiring*, không phải viết mới.

---

## Phase C — Commit per-provider artifacts (như superpowers)

- [ ] Commit `.claude-plugin/` (skills đã compile) thay vì chỉ sinh runtime.
- [ ] (Tùy chọn) `.cursor/`, `.codex/`, `.gemini/` compiled output cho đa nền tảng.
- [ ] Giữ `aix install` làm đường phụ (dev/local), không phải đường chính.

---

## Phase D — Demote `@x/engine`

- [ ] Đổi định vị: engine = "headless/CI runner cho non-interactive", không phải core.
- [ ] Cập nhật README/ASSESSMENT: host agent (Claude Code) là runtime; engine optional.
- [ ] Cân nhắc gỡ hẳn nếu không có use-case CI rõ ràng.

---

## Phase E — Tách content (sau)

- [ ] Tách `content/` thành layer cộng đồng sửa được (như `superpowers-skills`).
- [ ] Marketplace repo riêng.

---

## Thứ tự

A (làm ngay) → B → C → D → E.
