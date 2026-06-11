# Feature: `install` — Đánh giá

> Điều phối toàn bộ chuỗi cài đặt harness: git-hygiene, capability cache, harness skeleton, domain skills, runtime-native, provider interaction. Là feature "trung tâm" mà update phụ thuộc.
> **Điểm trung bình: 2.6/5** — chức năng đầy đủ nhưng vi phạm phân tầng và mất kiểu nặng nhất.

## 1. Cấu trúc

```
install/
├─ application/run-install.ts              # orchestrator chính
├─ infrastructure/
│  ├─ harness-skeleton.ts
│  ├─ install-cache.ts
│  ├─ install-runtime.ts
│  └─ legacy-deps.ts                       # CẦU NỐI require ngược lib/  ⚠️
└─ presentation/
   ├─ install-command.ts                   # wizard CLI
   ├─ cli-legacy.ts                        # cầu nối tới lib/cli-*
   └─ cli-types.ts
```
> Không có thư mục `domain/` — install gần như toàn orchestration + I/O.

## 2. Điểm mạnh ✅

1. **Orchestrator trả kết quả có cấu trúc** `{ ok, messages }` thay vì `process.exit` (`run-install.ts:59,149-154`) → về nguyên tắc có thể test.
2. **`resolveIgnoreStrategy` thuần** — logic scope/visibility → strategy tách riêng, dễ kiểm thử (`run-install.ts:47-56`).
3. **Tôn trọng `dryRun`/`force`** xuyên suốt.
4. **Tái sử dụng `shared/install-kernel`** cho git-hygiene.
5. Test gián tiếp qua `test/backend/install-orchestrator.test.js` (gọi shim `lib/backend/install-orchestrator.ts` → `run-install`).

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Vị trí | Mức |
|----|--------|--------|-----|
| IN-1 | **Application tự in stdout** — `process.stdout.write("--- Git exclude ---")`… rải khắp orchestrator. Việc của presentation | `run-install.ts:76,92,97,104,130,139` | 🟠 |
| IN-2 | **Mất kiểu toàn bộ ở cầu nối legacy** — `(...args: unknown[]) => void`; bên `lib` lại `require(...) as any` | `infrastructure/legacy-deps.ts`, `lib/backend/install-orchestrator.ts:6` | 🟠 |
| IN-3 | **Phụ thuộc vòng `src → lib`** — `legacy-deps` require `../../../lib/domain-skill-generation.js`, `cli-providers.js`, `provider-detection.js`, `runtime-command-catalog.js`, `worker-claude-adapter.js`, `codex-rule-generation.js`, `provider-rule-renderer.js`, `workers/registry.js` | `legacy-deps.ts:7-68` | 🔴 |
| IN-4 | **`index.ts` gán nhãn `Layer: presentation` nhưng là barrel** và **rò nội bộ infra** ra ngoài: `CACHE_DIR`, `listFiles`, `cacheRelativePath`, `installCacheMain`, `parseInstallCacheArgs` | `index.ts:1-3,25-35` | 🟠 |
| IN-5 | **Cài nhiều provider KHÔNG nguyên tử** — vòng lặp `break` khi lỗi để lại trạng thái một phần, không rollback | `presentation/install-command.ts:74-95` | 🟠 |
| IN-6 | **`catch` nuốt mọi lỗi thành string** — mất stack/loại lỗi, khó chẩn đoán | `run-install.ts:150-154` | 🟡 |
| IN-7 | **Logic re-tính `runtime`/`scopeVis` lặp lại** giữa nhánh non-interactive và interactive trong `install-command.ts` | `install-command.ts:176-318` | 🟢 |

## 4. Khuyến nghị

- **IN-1/IN-6:** đổi `runInstall` để **phát event/trả `messages` có cấu trúc** (`{ step, status }[]`) hoặc nhận `reporter` qua `options`; presentation chịu trách nhiệm in. Giữ lỗi gốc trong `result.error?: Error`.
- **IN-3:** di chuyển các tiện ích `lib` mà install cần vào `shared/` (hoặc `install/infrastructure/`) rồi xóa dần entry trong `legacy-deps.ts` → đạt quy tắc một chiều `lib → src`.
- **IN-2:** thay `(...args: unknown[])` bằng interface thật; ở `lib` shim dùng `typeof import(...)` như `lib/insights/*` đã làm, bỏ `as any`.
- **IN-4:** sửa header `index.ts` thành barrel; chỉ export use-case + type công khai, đóng gói chi tiết cache.
- **IN-5:** cân nhắc cài "all-or-nothing" theo provider (ghi nhận đã cài để rollback khi lỗi) hoặc tối thiểu báo cáo rõ provider nào thành công/thất bại.

## 5. Kết luận

Feature gánh nhiều việc nhất và cũng tích tụ nhiều nợ nhất: **I/O sai tầng + phụ thuộc vòng + mất kiểu**. Đây nên là **mục tiêu refactor ưu tiên cao** vì update phụ thuộc trực tiếp vào nó. So sánh với `telemetry`/`insights` để thấy hướng "sạch" cần đạt.
