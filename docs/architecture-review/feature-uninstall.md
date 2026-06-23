# Feature: `uninstall` — Đánh giá

> Gỡ bề mặt provider và (tùy chọn) cache/state của harness, có cơ chế kiểm tra "ownership" để không xóa nhầm file người dùng.
> **Điểm trung bình: 2.6/5** — logic an toàn xóa tốt, nhưng I/O sai tầng và phụ thuộc chéo feature.

## 1. Cấu trúc

```
uninstall/
├─ application/run-uninstall.ts        # orchestrator gỡ cài
└─ presentation/uninstall-command.ts   # wizard CLI
```
> Không có `domain/` lẫn `infrastructure/` — chỉ 2 tầng.

## 2. Điểm mạnh ✅

1. **Cơ chế "ownership" an toàn** — chỉ xóa khi file thuộc harness: kiểm `HARNESS_MARKER` (`fileContainsHarnessMarker`), hoặc settings Claude đúng shape (`claudeSettingsIsHarnessOwned`), hoặc `always` cho path do harness tạo (`run-uninstall.ts:32-106`). Đây là điểm rất đúng đắn để tránh xóa nhầm.
2. **`dryRun` rõ ràng** với output `WOULD REMOVE / WOULD KEEP / SKIP`.
3. **Tái dùng `shared/install-kernel`** (`uninstallPathsForProvider`, `removeIgnoreBlock`, `HARNESS_MARKER`).
4. **Bảo vệ phạm vi gỡ** — chỉ cho gỡ provider có trong `.ai-harness/manifest.json` (`uninstall-command.ts:117-124`).
5. Test gián tiếp: `test/backend/uninstall.test.js`.

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Vị trí | Mức |
|----|--------|--------|-----|
| UN-1 | **Application tự in stdout dày đặc** (`SKIP/REMOVE/WOULD REMOVE/KEEP`) — đáng lẽ trả danh sách hành động cho presentation | `run-uninstall.ts:79-150,185-222` | 🟠 |
| UN-2 | **Phụ thuộc chéo feature** — uninstall require `legacy-deps` của **install** (`legacyProviderDetection`, `legacyRuntimeCommandCatalog`) | `run-uninstall.ts:14`, `uninstall-command.ts:11` | 🟠 |
| UN-3 | **Đường dẫn hook bị hard-code & trùng lặp** với `validate` — `claudeSettingsIsHarnessOwned` liệt kê `.ai-harness/hooks/core/guard-phase.js`… giống hệt danh sách trong `validate` → rủi ro lệch (drift) khi đổi hook | `run-uninstall.ts:56-60` | 🟠 |
| UN-4 | **Global uninstall hard-code `switch(provider)`** thay vì lấy từ bảng đường dẫn dữ-liệu-hóa như project scope | `run-uninstall.ts:153-178` | 🟡 |
| UN-5 | **Luôn trả `{ ok: true }`** kể cả khi `fileContainsHarnessMarker` nuốt lỗi đọc file (`catch { return false }`) → có thể "SKIP" âm thầm khi thực ra lỗi quyền | `run-uninstall.ts:34-39,188,224` | 🟡 |
| UN-6 | **`removeFileIfHarnessOwned` không dùng `node:` nhất quán** — file mở đầu `import * as fs from "node:fs"` (ok) nhưng style import khác các feature khác | `run-uninstall.ts:9-11` | 🟢 |

## 4. Khuyến nghị

- **UN-1:** trả `RemovalAction[] = { path, action: 'remove'|'skip'|'keep'|'would-remove', reason }`; presentation in. Giúp test khẳng định quyết định mà không bắt stdout.
- **UN-3:** đưa danh sách hook "harness-owned" về **một nguồn duy nhất** trong `shared/install-kernel/constants.ts`, để cả uninstall và validate cùng tham chiếu.
- **UN-4:** dữ-liệu-hóa global paths (map `provider → string[]`) tương tự `uninstallPathsForProvider`, đặt trong `shared/`.
- **UN-2:** sau khi gom tiện ích provider-detection vào `shared/`, uninstall import từ `shared/` thay vì `install/infrastructure/legacy-deps`.
- **UN-5:** phân biệt "không tồn tại" với "lỗi đọc/quyền"; gộp lỗi thật vào `messages` và trả `ok:false` khi có lỗi không mong đợi.

## 5. Kết luận

Phần **an toàn xóa** được thiết kế cẩn thận (điểm cộng lớn cho một lệnh phá hủy). Nợ chính giống install: **I/O sai tầng + phụ thuộc chéo + hằng số hook trùng lặp**. Ưu tiên hợp nhất nguồn-sự-thật cho đường dẫn/hook vào `shared/`.
