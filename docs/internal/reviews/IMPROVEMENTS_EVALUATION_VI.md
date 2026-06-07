# Đánh giá Improvements — Nâng `ai-engineering-harness` lên tầm "Pro"

> Người đánh giá: Senior AI / Harness Engineer
> Ngày: 2026-06-05
> Bổ sung cho `REVIEW_REPORT_VI.md` (báo cáo trước tập trung vào *gaps/defects*; tài liệu này tập trung vào *cải tiến chiến lược* để nâng tầm dự án).

---

## 0. Khung đánh giá

Báo cáo trước trả lời câu hỏi *"có gì hỏng?"*. Tài liệu này trả lời câu hỏi quan trọng hơn:
**"Làm sao biến nó từ một bộ prompt/markdown có kỷ luật → một sản phẩm engineering thực sự, đo lường được, có moat?"**

Đánh giá theo 7 trục, mỗi trục chấm mức độ trưởng thành hiện tại (1–5) và đề xuất nâng cấp.

| # | Trục | Hiện tại | Mục tiêu |
|---|------|:--------:|:--------:|
| A | Chứng minh hiệu quả (Evals) | **1/5** 🔴 | 4/5 |
| B | Observability / Telemetry | **2/5** 🟠 | 4/5 |
| C | Kiến trúc & Code | **3/5** 🟡 | 4/5 |
| D | CI/CD & Release maturity | **3/5** 🟡 | 5/5 |
| E | Tài liệu & Knowledge | **2/5** 🟠 | 4/5 |
| F | Sản phẩm / Adoption / Moat | **2/5** 🟠 | 4/5 |
| G | DX cho Contributor | **3/5** 🟡 | 4/5 |

---

## A. 🔴 Chứng minh hiệu quả bằng Eval — ĐÂY LÀ CẢI TIẾN QUAN TRỌNG NHẤT

**Vấn đề cốt lõi:** Dự án bán "engineering discipline & guardrails cho AI agent" nhưng **không có một eval/benchmark nào** chứng minh harness thực sự thay đổi hành vi agent theo hướng tốt hơn.

```
$ find . -iname "*eval*" -o -iname "*bench*"   → (trống)
```

Không có eval thì toàn bộ giá trị của dự án là **niềm tin (faith-based)**: "cài cái này vào, agent sẽ kỷ luật hơn" — không có số liệu. Đây là khác biệt lớn nhất giữa một "bộ rules markdown" và một "harness pro".

**Đề xuất — xây dựng Eval Harness (chính dự án nên tự dogfood eval):**

1. **Bộ task chuẩn (golden tasks):** 15–30 task lập trình thật (bugfix, feature nhỏ, refactor) trên repo mẫu, có tiêu chí pass/fail rõ ràng.
2. **A/B comparison:** chạy cùng agent + cùng task, **có** vs **không có** harness. Đo:
   - Tỷ lệ hoàn thành đúng (correctness).
   - Tỷ lệ tuân thủ quy trình (có viết test trước? có dừng đúng phase? có hỏi đúng lúc?).
   - Số bước/thao tác dư thừa (efficiency).
   - Tỷ lệ "agent đi sai hướng rồi tự sửa".
3. **LLM-as-judge** chấm output theo `RESPONSE_CONTRACT.md` / `OUTPUT_PATTERNS.md` đã có sẵn — biến chính các contract đó thành rubric chấm điểm.
4. **Regression eval trong CI:** mỗi PR sửa rules/workflows chạy một subset eval nhẹ → chặn việc "sửa prompt làm agent tệ đi" mà không ai biết.

> Đây vừa là tính năng (người dùng cũng cần eval harness của họ), vừa là bằng chứng marketing mạnh nhất ("harness này giúp tăng X% correctness, giảm Y% bước thừa").

---

## B. 🟠 Tận dụng Telemetry đã có sẵn nhưng đang bỏ phí

**Quan sát:** Repo đã có hạ tầng ghi sự kiện rất tốt nhưng **không dùng để học/đo**:
```
hooks/core/record-tool-output.js
hooks/core/record-skill-run.js
hooks/core/record-subagent-result.js   → ghi vào events.jsonl (gitignored, local)
```
Tức đã có "hộp đen" ghi lại agent làm gì, nhưng **không có lớp phân tích** phía trên. Dữ liệu vàng đang bị vứt đi.

**Đề xuất:**
1. **Lệnh `aih report` / `aih insights`:** đọc `events.jsonl` → tổng hợp: skill nào hay chạy, hook nào hay chặn, phase nào hay bị vi phạm, tool nào tốn nhiều lần thử. (`scripts/generate-report-context.js` đã có — mở rộng thành analytics).
2. **Opt-in anonymized telemetry:** cho phép người dùng (tự nguyện) gửi metric tổng hợp → đội ngũ biết feature nào thực sự được dùng, rule nào hay bị bỏ qua. Đây là cách duy nhất để cải tiến rules dựa trên dữ liệu thật thay vì cảm tính.
3. **Đóng vòng lặp với mục A:** dữ liệu telemetry chính là input cho eval ("rule X bị vi phạm 40% lần → rule viết chưa rõ → sửa → đo lại").

---

## C. 🟡 Kiến trúc & Code

**Điểm tốt:** Tách `lib/` gọn, có provider-adapter abstraction, dependency tối giản.

**Cải tiến:**
1. **Tách "god module" `runtime-command-catalog.js` (843 dòng, 6 SECTION).** Hiện chỉ đánh dấu section bằng comment — đó là "che giấu" chứ chưa "giải quyết". Tách thật theo trách nhiệm: `catalog-data.js` (metadata) / `catalog-query.js` / `catalog-render.js` / `catalog-install.js`. Mỗi file < 250 dòng, test riêng được.
2. **Provider abstraction → khai báo (declarative):** hiện mỗi provider (claude/cursor/codex/gemini) là code + markdown rải rác. Nên tiến tới một **schema khai báo cho provider** (1 file JSON/YAML mô tả: hỗ trợ slash command? format rule? vị trí cài? hook native?) + 1 renderer duy nhất. Thêm provider mới = thêm 1 file khai báo, không sửa code. Đây là moat kỹ thuật thật sự cho một "multi-agent harness".
3. **Tách "rules engine" khỏi "nội dung rules":** engine (compose/render/validate) nên là code có version riêng; nội dung rules (markdown) là data có version riêng. Hiện hai thứ trộn lẫn khiến mỗi lần sửa câu chữ lại đụng vào contract.

---

## D. 🟡 CI/CD & Release Maturity

**Điểm tốt:** CI ma trận đa OS × Node, có publish/pages workflow.

**Cải tiến để đạt "pro":**
1. **Branch protection + required checks** trên `main` (lint/format/test/validate phải xanh mới merge) — điều này sẽ tự động ngăn đúng lỗi 1.1 trong báo cáo trước (release fail chính gate của nó).
2. **Release automation:** dùng `changesets` hoặc `release-please` → version bump + CHANGELOG + tag + npm publish tự động từ commit theo Conventional Commits. Sẽ chấm dứt cảnh 21 bộ release-notes thủ công và lệch version giữa các file (mục 3.2 báo cáo trước).
3. **Code coverage gate:** thêm `c8`/`node --experimental-test-coverage`, đặt ngưỡng tối thiểu (vd 70% cho `lib/`). Hiện 97 test nhưng không biết phủ bao nhiêu code.
4. **Dependabot/Renovate:** chưa có (`.github/dependabot.yml` không tồn tại). Thêm để tự cập nhật `eslint`/`prettier`/`@clack/prompts` an toàn.
5. **Smoke test cài đặt thật trong CI:** chạy `npx . install --provider claude --yes` vào thư mục tạm trên cả 3 OS → đảm bảo đường cài đặt khuyến nghị không bao giờ vỡ.
6. **CI/coverage badge trong README** — tín hiệu tin cậy cho dự án bán "discipline".

---

## E. 🟠 Tài liệu & Knowledge Management

**Vấn đề:** 157 file docs cho ~4.000 dòng code lib là **mất cân đối nghiêm trọng**. Phần lớn là nhật ký quá trình (dogfood, readiness, plan, 21 release-notes, 8 frozen-contract) bị ship thẳng cho người dùng.

**Cải tiến:**
1. **Tách 3 tầng tài liệu rõ ràng:**
   - `docs/` (ship): chỉ docs hướng người dùng — cài, dùng, lệnh, provider.
   - `docs/internal/` hoặc wiki (không ship): process, dogfood, plan, readiness.
   - `docs/architecture/` (ADR): quyết định kiến trúc dạng Architecture Decision Record thay vì "frozen contract" rải rác.
2. **Diátaxis framework:** chia docs theo Tutorial / How-to / Reference / Explanation. Hiện đang trộn cả 4 → khó tìm.
3. **Single source of truth cho version:** version chỉ nên ở `package.json`; docs/site đọc từ đó (build-time) thay vì hard-code rồi cần test `release-version.test.js` để canh.
4. **Dọn root** (mục 3.4 báo cáo trước): chỉ giữ README/LICENSE/CHANGELOG/CONTRIBUTING/SECURITY.

---

## F. 🟠 Sản phẩm / Adoption / Moat

1. **Định vị moat rõ ràng:** thị trường đã có superpowers, GSD, cursor rules, các "awesome prompts". Repo thậm chí có `docs/distillation-superpowers-gsd.md`. Câu hỏi cần trả lời dứt khoát trong README đầu tiên: *"Tại sao chọn cái này thay vì cài rule thủ công / dùng superpowers?"* → Câu trả lời mạnh nhất chính là **A (eval-proven) + đa-provider chuẩn hóa (C2)**.
2. **Giảm ma sát "5 phút đầu":** đã có `docs/first-5-minutes.md` — nên biến thành `npx ai-engineering-harness init` chạy được ngay, tự phát hiện provider, cài, và chạy 1 demo task để người dùng *thấy* harness hoạt động (chứ không chỉ đọc).
3. **Compatibility matrix sống:** một bảng (auto-generated từ eval) cho biết harness hoạt động tốt tới đâu trên Claude/Cursor/Codex/Gemini ở từng version — đây là thứ người dùng doanh nghiệp cần để tin tưởng.
4. **Versioning theo SemVer thực chất:** nhảy v0.11 → v1.0 cần đi kèm cam kết ổn định API/contract. Nếu chưa ổn định, cân nhắc `0.x` trung thực hơn.

---

## G. 🟡 DX cho Contributor

1. **Pre-commit hooks** (husky + lint-staged): chạy format/lint trước commit → ngăn lỗi format lọt vào như đã xảy ra.
2. **Chuyển test "string-presence" sang test hành vi:** nhiều suite hiện chỉ assert "docs có chứa chuỗi X" → pass cả khi tính năng hỏng. Subagent đã làm tốt với `cli-command-wizards.test.js` (test hành vi thật) — nên nhân rộng pattern này.
3. **CONTRIBUTING rõ "định nghĩa Done":** mọi PR sửa rule/workflow phải kèm eval/test chứng minh không gây hồi quy.
4. **Cân nhắc TypeScript cho `lib/`:** đã có `index.d.ts` + `docs/typescript-usage.md` → bước tiếp hợp lý là migrate `lib/` sang TS để bắt lỗi sớm, nhất là `runtime-command-catalog` nhiều cấu trúc dữ liệu.

---

## H. Lộ trình ưu tiên (theo ROI)

| Ưu tiên | Việc | Trục | Vì sao |
|---------|------|------|--------|
| **P0** | Xây Eval Harness + A/B baseline | A | Không có cái này thì mọi cải tiến khác là đoán mò. Đây là moat + bằng chứng. |
| **P0** | Branch protection + required CI checks | D | Tự động ngăn lỗi nghiêm trọng đã xảy ra. Rẻ, làm ngay. |
| **P1** | Analytics từ `events.jsonl` (`aih insights`) | B | Tận dụng hạ tầng đã có; đóng vòng lặp với Eval. |
| **P1** | Release automation (changesets) + coverage gate | D | Chấm dứt lệch version & release thủ công. |
| **P1** | Tái cấu trúc docs 3 tầng + dọn root | E | Giảm nhiễu, tăng độ tin cậy ngay lập tức. |
| **P2** | Provider schema khai báo + tách god module | C | Moat kỹ thuật; dễ thêm provider; dễ test. |
| **P2** | `aih init` chạy demo task thật trong 5 phút | F | Giảm ma sát adoption; "show, don't tell". |
| **P3** | Migrate `lib/` sang TypeScript | C/G | Chất lượng dài hạn; gate typecheck và dist-first runtime đã ship, còn phần JS→TS toàn diện. |

---

## I. Kết luận

Dự án có **nền móng kỷ luật tốt** (validate contract, CI đa nền tảng, provider adapter, hooks ghi event). Nhưng để "best pro", khoảng cách lớn nhất **không phải** ở thêm tính năng — mà ở **chứng minh được hiệu quả (A)** và **đo lường được (B)**. Một harness AI mà không thể chứng minh nó cải thiện hành vi agent thì về bản chất vẫn là một bộ prompt có tổ chức.

**Một câu duy nhất:** Hãy biến chính các "contract" markdown đã có (`RESPONSE_CONTRACT`, `OUTPUT_PATTERNS`, phase discipline) thành **rubric của một eval tự động** — đó là bước biến dự án từ "tài liệu hay" thành "sản phẩm engineering có thể chứng minh".

---

*Tài liệu này đi kèm `REVIEW_REPORT_VI.md`. Báo cáo kia = sửa lỗi để không vỡ; tài liệu này = nâng tầm để dẫn đầu.*
