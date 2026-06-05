# Đột phá về Core — `ai-engineering-harness`

> Người đánh giá: Senior AI / Harness Engineer
> Ngày: 2026-06-05
> Loại tài liệu: Đánh giá chiến lược về *core mechanism* (không phải defect, không phải hygiene).
> Bộ tài liệu liên quan: `REVIEW_REPORT_VI.md` (sửa lỗi) · `IMPROVEMENTS_EVALUATION_VI.md` (nâng tầm vệ tinh) · **tài liệu này** (đột phá lõi).

---

## 0. Mục đích

Hai báo cáo trước nói về *vệ tinh*: eval, CI, docs, telemetry — làm dự án chỉn chu hơn nhưng **không làm nó khác biệt hơn**. Tài liệu này tấn công thẳng vào **core mechanism**: thứ quyết định dự án là "một bộ rule markdown hay" hay "một sản phẩm engineering có moat".

---

## 1. Chẩn đoán core hiện tại

Bóc hết lớp vỏ (CLI, installer, provider adapter, docs), **core thực chất là: inject markdown tĩnh vào context của AI agent.**

Ba đặc tính bản chất của cơ chế này:

| Đặc tính | Mô tả | Hệ quả |
|----------|-------|--------|
| **Advisory** (khuyên nhủ) | Rule là markdown = *gợi ý*; LLM có thể phớt lờ | "Guardrail" chỉ là biển báo, không phải rào chắn |
| **Open-loop** (vòng hở) | Viết một lần → nhét vào → hết. Không quan sát, không học | Harness là config chết, không tiến hóa |
| **Generic** (đại trà) | Cùng workflow feature/bugfix/refactor cho mọi repo & agent | Không khai thác đặc thù repo đích |

**Kết luận chẩn đoán:** cả ba đặc tính đều **commoditized**. Nội dung rule markdown ai cũng viết được (superpowers, GSD, cursor rules… cùng mô hình). **Moat không nằm ở nội dung rule — phải nằm ở cơ chế.**

> Ranh giới cốt lõi cần vượt qua:
> **Từ "Context Engineering" (nhét chữ vào prompt) → "Execution Governance" (cưỡng chế hành vi qua hook).**

---

## 2. Ba reframe đột phá về core

### 2.1. 🥇 Advisory → **Deterministic Enforcement Engine** (cược chính)

**Luận điểm:** Đừng *bảo* agent kỷ luật. Hãy làm cho việc vi phạm **bất khả thi về mặt cấu trúc**.

**Hiện trạng:** repo đã có mầm mống `hooks/core/guard-phase.js` nhưng hook chỉ là *sidecar*. Markdown là chính.

**Đột phá — lật ngược kiến trúc:** Hooks (policy-as-code) trở thành **sản phẩm chính**; markdown chỉ là **docs sinh ra TỪ policy** (để con người đọc), không phải nguồn enforcement.

**Ví dụ cụ thể về sự dịch chuyển:**

| Discipline | Cơ chế cũ (advisory) | Cơ chế mới (deterministic) |
|------------|----------------------|----------------------------|
| Test-first | Markdown viết "hãy viết test trước" | Hook **chặn** tool `Edit` lên `src/` cho tới khi tồn tại test file có assertion đang FAIL |
| Không skip phase | Docs mô tả phase discipline | State machine; gate verify bằng máy; agent **không gọi được** `ship` khi `verify` chưa pass |
| Không lạc scope | Rule nhắc "bám sát goal" | Hook đối chiếu diff với goal artifact → **reject** edit ngoài scope |
| Không xóa bừa | Rule nhắc cẩn thận | Hook chặn `rm`/overwrite file mà agent chưa đọc/không tạo ra |

**Vì sao đột phá:** chuyển discipline từ **xác suất** ("LLM *có thể* tuân") sang **đảm bảo** ("hệ thống *cưỡng chế*"). Đây là khác biệt giữa *linter cảnh báo* và *compiler từ chối build*. Một file markdown không nhái được điều này.

---

### 2.2. 🥈 Generic → **Codebase-derived Guardrails** (harness như một compiler)

**Luận điểm:** Thay vì 4 workflow đại trà giống nhau, core nên **đọc chính repo đích** và **sinh guardrails riêng cho repo đó**.

**Input để sinh luật:** kiến trúc thư mục, convention đặt tên, pattern test hiện có, **lịch sử bug trong git** (các fix gần đây hé lộ lớp lỗi hay tái diễn).

**Ví dụ luật được sinh tự động:**
> - "Repo này mọi truy cập DB đi qua `repository/` → chặn raw SQL trong handler."
> - "3 bug gần nhất đều do quên invalidate cache → thêm gate ở chỗ ghi cache."
> - "Module `payments/` luôn đi kèm test → chặn sửa `payments/` mà không cập nhật test tương ứng."

**Vì sao đột phá:** harness trở thành **trình biên dịch từ codebase → luật cưỡng chế**. Output phụ thuộc repo của từng người → **bản chất không thể nhái** bằng prompt pack tĩnh. Đây là moat phòng thủ thật sự.

---

### 2.3. 🥉 Open-loop → **Closed-loop Self-tuning** (harness như hệ điều khiển)

**Luận điểm:** `events.jsonl` không phải để làm report — nó là **tín hiệu phản hồi** của một control system.

**Cơ chế:**
1. Đo tần suất vi phạm từng rule từ event stream.
2. Rule bị vi phạm/bỏ qua thường xuyên → tín hiệu rule đó *viết yếu/sai*.
3. Harness **tự đề xuất**: nâng rule thành hook cứng, hoặc viết lại cho rõ.
4. Chạy lại eval → đo cải thiện → khép vòng lặp.

**Vì sao đột phá:** harness **tự tiến hóa** theo agent thật + repo thật, thay vì là config chết. Chất lượng rule tăng theo thời gian sử dụng — một dạng *flywheel*.

---

## 3. Tầm nhìn hợp nhất: **Agent Discipline Kernel**

Gộp ba reframe: định nghĩa **một capability/permission model trung lập provider** (tool nào, được phép khi nào, với state ra sao) → **compile xuống cơ chế cưỡng chế native của từng provider** (Claude hooks, Cursor rules, Codex, Gemini…).

> Viết discipline **một lần** → cưỡng chế **native ở mọi nơi**.

**Dịch chuyển định vị:**
`"Bộ rule cho AI agent"` → `"Kernel/OS quản trị thực thi cho AI agent"`.

Đây mới là moat đa-provider thật — khác hẳn "markdown nói cùng một điều bằng 4 thứ tiếng".

**Quan hệ nền móng:** Policy-as-code (2.1) là nền chung. Codebase-derived (2.2) *sinh ra* policy. Closed-loop (2.3) *tinh chỉnh* policy. → Cả ba hội tụ về một **policy engine** duy nhất.

```
        Codebase-derived (2.2)            Closed-loop (2.3)
        sinh policy mới        ┐      ┌   tinh chỉnh policy
                               ▼      ▼
                    ┌──────────────────────────┐
                    │   POLICY ENGINE (2.1)     │  ← nền móng
                    │   deterministic hooks     │
                    └──────────────────────────┘
                               │ compile
                ┌──────────┬───┴───┬──────────┐
              Claude     Cursor   Codex     Gemini   (native enforcement)
```

---

## 4. Cược chính & lý do

**Đặt cược vào 2.1 — Deterministic Enforcement Engine.**

| Lý do | Giải thích |
|-------|-----------|
| Biến guardrail thành guardrail thật | Thứ duy nhất chuyển discipline từ xác suất sang đảm bảo |
| Rủi ro kỹ thuật thấp | Mầm mống đã có (`hooks/core/guard-phase.js`) |
| Tự nhiên buộc có Eval | Phải đo để chứng minh enforcement đúng → khớp với P0 Eval ở tài liệu vệ tinh |
| Là nền móng cho 2.2 & 2.3 | Codebase-derived sinh *policy*; closed-loop tinh chỉnh *policy*; policy-as-code là chung |

---

## 5. Lộ trình di trú (từ kiến trúc hiện tại)

| Giai đoạn | Việc | Kết quả |
|-----------|------|---------|
| **G0 — Trích policy** | Định nghĩa **policy schema** (điều kiện → hành động: allow/block/warn). Chọn 3–5 discipline quan trọng nhất (test-first, phase gate, scope guard) viết thành policy thực thi | Có "ngôn ngữ luật" + vài luật cứng đầu tiên |
| **G1 — Hook làm chủ** | Nâng `hooks/core/*` thành **policy runtime** đọc schema và *thực sự block* tool call vi phạm | Enforcement deterministic cho 3–5 luật |
| **G2 — Markdown từ policy** | Đảo chiều: generate docs/rule markdown **TỪ** policy (single source of truth) | Hết tình trạng docs ≠ hành vi thực |
| **G3 — Eval enforcement** | Eval A/B chứng minh: có engine → tỷ lệ vi phạm giảm về ~0 cho luật cứng | Bằng chứng moat |
| **G4 — Codebase-derived** | Bộ phân tích repo (git history + cấu trúc) → đề xuất policy riêng repo | Moat phòng thủ (2.2) |
| **G5 — Closed-loop** | Dùng `events.jsonl` đo vi phạm → tự đề xuất nâng/sửa policy | Flywheel tự tiến hóa (2.3) |
| **G6 — Kernel đa provider** | Tách policy model trung lập → compiler xuống enforcement native từng provider | Định vị "Agent Discipline Kernel" (mục 3) |

---

## 6. Một câu kết

> Chuyển core từ **"context engineering"** (nhét chữ vào prompt — commoditized) sang **"execution governance"** (cưỡng chế hành vi qua policy-as-code — có moat).
> Đó là ranh giới giữa *một repo rule hay* và *một sản phẩm dẫn đầu*.

---

*Bước tiếp đề xuất: phác thảo spec chi tiết cho Policy Engine (policy schema, hook contract, cơ chế generate markdown từ policy, đường di trú G0→G2). Yêu cầu khi sẵn sàng triển khai.*
