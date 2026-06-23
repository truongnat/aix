# Đánh giá kiến trúc — Migration TypeScript (CLI, Hooks, Rules, Server, Core)

> **Ngày:** 2026-06-11
> **Người đánh giá:** Senior AI Engineer (review độc lập)
> **Phạm vi:** Kiến trúc `src/` clean-architecture mới (phases 1–4) so với `lib/` legacy, cùng các vùng `hooks/`, `rules/`, `server/`, và lõi (`shared/`, build/test/lint toolchain).
> **Phiên bản code:** v1.2.3 — commit `1e14fb8` (migrate install lifecycle, phase 4).

---

## 1. Tóm tắt điều hành

Việc migration sang kiến trúc sạch (clean architecture) trong `src/features/<feature>/{domain,application,infrastructure,presentation}` là **đúng hướng và có kỷ luật**: phân tầng rõ ràng, mỗi file có header `Purpose / Layer / Depends on`, domain layer thuần (pure) và dễ test, dependency injection qua tham số `options`. Đây là nền tảng tốt để mở rộng.

Tuy nhiên hệ thống đang ở **trạng thái migration dở dang (mid-flight)** với một số khoảng trống ảnh hưởng trực tiếp đến độ "professional" và khả năng bảo trì lâu dài:

| Mức độ | Vấn đề cốt lõi | Tác động |
|--------|----------------|----------|
| 🔴 P0 | **ESLint không hề kiểm tra `src/` và `lib/` (toàn bộ TypeScript)** | Code TS mới không có lint, không có `@typescript-eslint` — mất một lớp bảo vệ chất lượng chính |
| 🔴 P0 | **Coverage gate chỉ đo `dist/lib/**`, bỏ qua `dist/features/**` và `dist/server/**`** | Code clean-architecture mới gần như không được đo độ phủ; ngưỡng 75% là ảo với code mới |
| 🔴 P0 | **Phụ thuộc hai chiều `lib/ ↔ src/features/`** | `lib` gọi `features`, `features` lại gọi ngược `lib` qua `legacy-deps` → coupling vòng, khó suy luận tầng |
| 🟠 P1 | **Mất kiểu (type erosion) tại ranh giới**: `as any`, `(...args: unknown[]) => void` | Vô hiệu hóa lợi ích của TypeScript đúng tại nơi rủi ro nhất |
| 🟠 P1 | **Hooks & Rules KHÔNG được migrate sang TS** (vẫn `.js` + `.md` thuần) | "Migration TypeScript" chưa bao trùm vùng có nhiều logic guard rủi ro |
| 🟠 P1 | **Application layer làm I/O của presentation** (`process.stdout.write` trong `run-install.ts`) | Vi phạm phân tầng, khó test, khó tái sử dụng |
| 🟡 P2 | Telemetry server thiếu phòng thủ (auth/rate-limit/headers), barrel `index.ts` rò rỉ nội bộ infrastructure, cấu hình ESLint trùng lặp, `verify-dist.js` allowlist thủ công | Nợ kỹ thuật vận hành/bảo trì |

**Kết luận ngắn:** Kiến trúc *thiết kế* tốt nhưng *hàng rào kỹ thuật (guardrails) quanh nó còn yếu*. Ưu tiên hàng đầu là kéo `src/` vào vòng lint + coverage + cắt phụ thuộc vòng trước khi migrate tiếp các feature còn lại.

---

## 2. Bản đồ kiến trúc hiện tại

### 2.1. Hai thế giới song song

```
bin/aih.js ──► dist/lib/cli-main.js          (entrypoint VẪN là legacy lib)
bin/telemetry-server.js ──► dist/server/telemetry.js ──► src/features/telemetry  (đã clean)

lib/  (legacy, .ts với allowJs/checkJs)        src/features/  (clean architecture mới)
  ├─ cli-*.ts, cli-commands/*.ts                 ├─ install/   {domain,application,infra,presentation}
  ├─ backend/*.ts  ──require──►  features/...     ├─ uninstall/
  ├─ insights/*.ts (shim) ─────► features/...     ├─ update/
  └─ catalog/, evals/, policy/...                 ├─ validate/
                                                  ├─ insights/
                                                  └─ telemetry/
                                                src/shared/install-kernel/
                                                src/server/telemetry.ts
```

### 2.2. Chiều phụ thuộc thực tế (bằng chứng)

- `lib` → `features` (legacy gọi code mới):
  - `lib/backend/install-orchestrator.ts:6` → `require("../../features/install/application/run-install.js")`
  - `lib/cli-commands/install.ts:6`, `lib/backend/uninstall.ts`, `lib/backend/update.ts`, `lib/insights/*` (shim)
- `features` → `lib` (code mới gọi ngược legacy):
  - `src/features/install/infrastructure/legacy-deps.ts` → `require("../../../lib/domain-skill-generation.js")`, `cli-providers.js`, `provider-detection.js`, `runtime-command-catalog.js`, `worker-claude-adapter.js`, `codex-rule-generation.js`, `provider-rule-renderer.js`, `workers/registry.js`
  - Có **19** vị trí `require("../../../lib | ../../../workers | ../../../shared")` trong `src/`.

→ Đây là **phụ thuộc hai chiều** giữa hai vùng. Hợp lý trong giai đoạn chuyển tiếp, nhưng là rủi ro nếu không có kế hoạch cắt bỏ rõ ràng (xem §6 Roadmap).

---

## 3. Điểm mạnh (giữ và nhân rộng)

1. **Taxonomy nhất quán & tự mô tả.** Mọi file có header `// Purpose / // Layer / // Depends on`. Rất tốt cho onboarding và review.
2. **Domain thuần, dễ test.** Ví dụ `src/features/telemetry/domain/telemetry-payload.ts` chỉ chứa type + validation thuần, không I/O; `shared/install-kernel` tách hằng số/logic git-hygiene độc lập.
3. **Dependency injection qua `options`.** `appendTelemetryExport(storageDir, payload, maxStorageBytes)`, `handleTelemetryRequest(req,res,options)` — cho phép test với thư mục tạm, ngưỡng tùy biến (đã có test trong `test/features/telemetry/...`).
4. **Orchestrator trả về kết quả có cấu trúc.** `runInstall(...) => { ok, messages }` thay vì `process.exit` — đúng tinh thần testable.
5. **`strict: true`** bật ở mọi tsconfig; `typecheck` (tsconfig.json) **PASS** trên cả `src/` + `lib/` + `workers/` (đã chạy, exit 0).
6. **Có guard build:** `scripts/verify-dist.js` chặn publish khi thiếu artifact biên dịch chủ chốt.

---

## 4. Khoảng trống chi tiết theo vùng

### 4.1. Core toolchain (nghiêm trọng nhất)

**G1 — ESLint bỏ qua toàn bộ TypeScript** 🔴
- Script: `eslint bin/ test/ *.js` (package.json:117). Không có `src/`, không có `lib/`.
- Config (`eslint.config.js`) dùng `eslint:recommended` thuần, **không có** `@typescript-eslint/parser` hay plugin TS.
- **Bằng chứng:** `npx eslint src/` → *"all of the files matching the glob pattern 'src/' are ignored"*. `npm run lint` → exit 0 nhưng thực chất không quét file `.ts` nào của code sản phẩm.
- Hệ quả: các quy tắc quan trọng cho TS (no-floating-promises, no-explicit-any, consistent-type-imports, no-misused-promises…) hoàn toàn vắng mặt — đúng lúc code dùng nhiều `any`, `void` promise (`void handleTelemetryRequest(...)`).

**G2 — Coverage chỉ đo legacy** 🔴
- `test:coverage`: `c8 --include=dist/lib/** ... --lines 75 ...`. Loại trừ `dist/features/**`, `dist/server/**`, `dist/shared/**`.
- Code clean-architecture mới (đích đến của migration) **không nằm trong phép đo**. Ngưỡng 75% chỉ phản ánh legacy đang co lại.

**G3 — Cấu hình ESLint trùng lặp** 🟡
- Tồn tại song song `.eslintrc.json` **và** `eslint.config.js` với nội dung gần như y hệt. Gây nhầm lẫn (ESLint 10 dùng flat config; `.eslintrc.json` là tàn dư).

**G4 — `verify-dist.js` là allowlist thủ công** 🟡
- Danh sách file cứng; mỗi feature mới phải nhớ thêm tay → dễ trôi (drift). Nên sinh động từ glob `dist/features/*/index.js`.

### 4.2. Phân tầng (layering) trong `src/`

**G5 — Application làm việc của Presentation** 🟠
- `src/features/install/application/run-install.ts` gọi trực tiếp `process.stdout.write("\n--- Git exclude ... ---\n")` (nhiều chỗ, dòng 76, 92, 97, 104, 130, 139).
- Application đáng lẽ chỉ điều phối và **trả về sự kiện/kết quả**; việc in ấn thuộc presentation. Hiện tại không thể tái dùng `runInstall` ở ngữ cảnh không-CLI (vd. server/programmatic) mà không rò output ra stdout, và khó test output.
- Khuyến nghị: trả về `messages`/`events` (đã có `messages[]`) và để presentation render; hoặc tiêm `logger`/`reporter` qua `options`.

**G6 — Barrel `index.ts` rò rỉ nội bộ infrastructure & gán nhãn sai tầng** 🟠
- `src/features/install/index.ts` khai báo `// Layer: presentation` nhưng thực chất là **public barrel** export cả 4 tầng — comment sai bản chất.
- Nó export các chi tiết infra lẽ ra phải đóng gói: `CACHE_DIR`, `listFiles`, `cacheRelativePath`, `main as installCacheMain`, `parseArgs`. Consumer có thể bám vào nội bộ → khó refactor sau này. Chỉ nên export use-case + type công khai.

**G7 — Mẫu `legacy-deps` lặp lại từng feature** 🟡
- Cả `install` và `validate` đều có `infrastructure/legacy-deps.ts` riêng, mỗi file tự `require` và tự khai báo lại type cho cùng module legacy → trùng lặp, dễ lệch type giữa các feature. Nên gom về một adapter dùng chung trong `shared/`.

### 4.3. An toàn kiểu (type safety) tại ranh giới

**G8 — Mất kiểu tại cầu nối lib↔src** 🟠
- `lib/backend/install-orchestrator.ts:6`: `const api = require("...run-install.js") as any;` → toàn bộ orchestrator gọi qua `any`.
- `legacy-deps.ts`: hầu hết hàm gõ là `(...args: unknown[]) => void` — không kiểm tra tham số, mất hoàn toàn lợi ích TS đúng nơi dữ liệu băng qua ranh giới.
- `require("../../../lib/x.js")` (đuôi `.js`, ép `as {...}`) phụ thuộc layout `dist/` lúc runtime; **typechecker không xác minh** chữ ký thật — sai lệch chỉ lộ ra lúc chạy.
- Khuyến nghị: định nghĩa interface chung cho ranh giới, import type từ source thật (đã thấy mẫu tốt ở `lib/insights/*` shim dùng `typeof import(...)` — nên áp dụng đồng nhất thay cho `as any`).

### 4.4. Hooks & Rules

**G9 — Hooks/Rules nằm ngoài migration TypeScript** 🟠
- `hooks/core/*.js` (guard-scope, guard-phase, guard-test-first, codex-hook-router, compact-session-memory…) vẫn là **JavaScript thuần**, không type, không nằm trong `tsconfig`, không được lint TS.
- Đây là vùng **logic guard rủi ro cao** (chặn scope, ép test-first, định tuyến hook theo provider). Ví dụ `guard-scope.js` trích file bằng regex `/[\w\-./]+\.(js|ts|json|md|py|go|rs)/g` — danh sách đuôi cứng, dễ sót ngôn ngữ, không test hồi quy rõ ràng cho mọi guard.
- `rules/` là `.md` (chấp nhận được vì là nội dung), nhưng **hooks nên được đưa vào cùng chuẩn TS/test/lint** vì chúng là code thực thi.

### 4.5. Server (telemetry)

**G10 — Thiếu phòng thủ vận hành** 🟡 (chấp nhận được cho dev, cần lưu ý nếu expose)
- `handleTelemetryRequest` không có auth/token, không rate-limit, không security headers/CORS.
- `storageDir` mặc định = `process.cwd()/.harness/telemetry` — phụ thuộc CWD tiến trình.
- Giới hạn lưu trữ kiểm tra **theo từng lần append** và **ném lỗi** khi vượt (không xoay vòng/rotate) → khi đầy, server trả 4xx vĩnh viễn cho mọi ingest. Nên có rotation hoặc chính sách rõ ràng.
- `validateTelemetryPayload` kiểm tra nông (chỉ `aggregate.totalEvents` là number; các map/array lồng nhau không validate sâu). Đủ cho schema tin cậy nội bộ, nhưng nếu nhận dữ liệu ngoài thì cần schema validation chặt hơn (vd. zod hoặc validator thủ công đầy đủ).
- *Điểm tốt:* body có giới hạn `maxBodyBytes` đọc trước khi parse (chống payload lớn) và phân biệt 413/400 hợp lý.

### 4.6. Xử lý lỗi & tính nguyên tử

**G11 — Cài nhiều provider không nguyên tử** 🟡
- `runInstallBackend` lặp `runInstall` theo từng provider, `break` khi lỗi → để lại **trạng thái cài đặt một phần** (partial state) không rollback. `runInstall` `catch` mọi lỗi và nhét vào `messages[]`, làm mất stack/loại lỗi gốc — khó chẩn đoán.

### 4.7. Hệ module & metadata

**G12 — Lặt vặt** 🟡
- `package.json` `repository.url` là `truongnat/...` trong khi git user là `truongdq` — kiểm tra tính nhất quán phát hành.
- Toàn dự án CommonJS (`type: commonjs`) + `require()` thủ công đuôi `.js` trong `.ts`. Hoạt động, nhưng cân nhắc chuẩn hóa ESM hoặc path alias để giảm `../../../`.

---

## 5. Bảng ưu tiên hành động

| ID | Hạng mục | Ưu tiên | Nỗ lực | Lợi ích |
|----|----------|---------|--------|---------|
| G1 | Thêm `@typescript-eslint`, đưa `src/` + `lib/` vào lint, gỡ `.eslintrc.json` thừa (G3) | 🔴 P0 | Thấp | Cao |
| G2 | Mở rộng coverage sang `dist/features/** dist/server/** dist/shared/**` | 🔴 P0 | Thấp | Cao |
| G3 | Cắt phụ thuộc vòng lib↔src: định hướng một chiều `lib → src` | 🔴 P0 | Cao | Cao |
| G5 | Đưa I/O ra khỏi application (logger/reporter injection hoặc trả events) | 🟠 P1 | Trung | Cao |
| G8 | Xóa `as any`/`unknown[]` ở ranh giới, dùng `typeof import()` interface | 🟠 P1 | Trung | Cao |
| G9 | Đưa `hooks/core/*` vào TS + test + lint | 🟠 P1 | Cao | Cao |
| G6 | Sửa nhãn tầng & thu hẹp public API của barrel `index.ts` | 🟠 P1 | Thấp | Trung |
| G7 | Gom `legacy-deps` về adapter dùng chung trong `shared/` | 🟡 P2 | Trung | Trung |
| G4 | `verify-dist.js` sinh allowlist từ glob | 🟡 P2 | Thấp | Trung |
| G10 | Hardening telemetry server (auth/rotation/validate sâu) — nếu expose | 🟡 P2 | Trung | Trung |
| G11 | Chiến lược lỗi/rollback khi cài nhiều provider | 🟡 P2 | Trung | Trung |
| G12 | Dọn metadata, cân nhắc path alias | 🟡 P2 | Thấp | Thấp |

---

## 6. Roadmap đề xuất (cắt nợ migration)

**Sprint 0 — Khóa hàng rào (1–2 ngày, P0):**
1. Cài `@typescript-eslint/{parser,eslint-plugin}`, cập nhật `eslint.config.js` cho `**/*.ts`, đổi script lint thành `eslint src lib bin test`. Sửa các vi phạm phát sinh.
2. Đổi `test:coverage --include` sang bao gồm `dist/features/** dist/server/** dist/shared/**`. Chấp nhận tụt ngưỡng tạm thời, rồi nâng dần.
3. Gỡ `.eslintrc.json`.

**Sprint 1 — Một chiều hóa phụ thuộc (P0/P1):**
4. Định nghĩa rõ: `src/` **không** được `require` ngược `lib/`. Di chuyển các tiện ích `lib` mà `src` đang cần (`provider-detection`, `cli-providers`, `domain-skill-generation`, `runtime-command-catalog`, `worker-claude-adapter`, `provider-rule-renderer`, `codex-rule-generation`, `workers/registry`) vào `src/shared/` hoặc feature tương ứng, rồi xóa từng entry trong `legacy-deps.ts`.
5. Tách I/O khỏi `application` (G5): inject `reporter`.

**Sprint 2 — Mở rộng phạm vi migration (P1):**
6. Migrate `hooks/core/*` sang TS + test hồi quy cho từng guard (failing-before/passing-after như domain debugging yêu cầu).
7. Chuyển entrypoint `bin/aih.js` dần sang `src/` khi CLI được migrate, thay vì `dist/lib/cli-main`.

**Sprint 3 — Hoàn thiện (P2):**
8. Hardening server, gom `legacy-deps`, allowlist động, dọn metadata.

---

## 7. Phụ lục — Bằng chứng đã kiểm chứng

| Kiểm tra | Lệnh | Kết quả |
|----------|------|---------|
| Typecheck toàn bộ | `npm run typecheck` (tsconfig.json gồm src+lib+workers) | **PASS** (exit 0) |
| Lint thực tế | `npm run lint` | exit 0 — nhưng glob `bin/ test/ *.js` **không gồm `src/`,`lib/`** |
| Lint trực tiếp src | `npx eslint src/` | **"all files matching 'src/' are ignored"** → không có cấu hình TS |
| Phụ thuộc vòng | `grep -rn "features/" lib/` và `grep require ".../lib" src/` | `lib`→`features` (8+ vị trí) và `src`→`lib` (19 vị trí) |
| Coverage scope | `package.json:110` | `--include=dist/lib/**` (loại `features/server/shared`) |
| Hooks TS | `find hooks -name "*.ts"` | (rỗng) — toàn `.js` |
| Test src features | `find src -name "*.test.ts"` | 0; test nằm ở `test/features/{telemetry,insights}` (chưa phủ install/uninstall/update/validate) |

---

*Báo cáo này chỉ ghi nhận sự kiện kiểm chứng được từ mã nguồn và lệnh đã chạy; các đề xuất ở §5–§6 chưa được triển khai và cần được lập kế hoạch/triển khai riêng.*
