# Feature: `update` — Đánh giá

> Làm mới các bề mặt harness đã cài, bằng cách ủy quyền cho `runInstall` với `force=true`, `initHarness=false`.
> **Điểm trung bình: 3.4/5** — mỏng và tái sử dụng rất tốt; nợ chủ yếu do thừa kế từ install.

## 1. Cấu trúc

```
update/
├─ application/run-update.ts        # wrapper mỏng quanh runInstall
└─ presentation/update-command.ts   # wizard CLI
```

## 2. Điểm mạnh ✅

1. **Tái sử dụng tối đa** — `runUpdate` chỉ kiểm tiền điều kiện rồi gọi `runInstall(..., { runtimeBannerVerb: "update" })` (`run-update.ts:53-69`). Không nhân đôi logic cài đặt — đây là điểm thiết kế tốt nhất.
2. **Tiền điều kiện rõ ràng & thông điệp hữu ích** — chặn `manual`, yêu cầu provider có trong `.ai-harness/manifest.json`, hướng dẫn "Reinstall first" (`run-update.ts:33-51`).
3. **Trả `{ ok, messages }`** nhất quán với install/uninstall.
4. **Phạm vi update bị giới hạn** đúng theo manifest (`update-command.ts:88-96`).
5. Test gián tiếp: `test/backend/update.test.js`.

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Vị trí | Mức |
|----|--------|--------|-----|
| UP-1 | **Param chết `force?`** — khai báo trong `UpdateContext` nhưng tài liệu ghi "Ignored — update always uses force=true" → API gây hiểu nhầm | `run-update.ts:18-20` | 🟡 |
| UP-2 | **Thừa kế nợ của install** — vì gọi `runInstall`, mọi vấn đề I/O-sai-tầng (IN-1) và catch-all (IN-6) đều áp dụng | `run-update.ts:53` | 🟠 |
| UP-3 | **Phụ thuộc chéo feature** — require `install/infrastructure/legacy-deps` cho `readInstalledCommandSurface` | `run-update.ts:9-10`, `update-command.ts:10-11` | 🟠 |
| UP-4 | **Cập nhật nhiều provider không nguyên tử** — vòng lặp `break` khi lỗi (giống install) để lại trạng thái một phần | `update-command.ts:109-123` | 🟡 |
| UP-5 | **`countCheckedContracts`-style không áp dụng** — n/a; nhưng `visibility` mặc định "private" cứng có thể không khớp lần cài shared trước đó | `update-command.ts:106` | 🟢 |

## 4. Khuyến nghị

- **UP-1:** xóa hẳn `force?` khỏi `UpdateContext` (hoặc tôn trọng nó). Param "present for forward-compat parity" nhưng bị bỏ qua là mã chết gây nhiễu.
- **UP-5:** đọc `visibility` đã cài từ manifest thay vì mặc định `"private"`, để update không vô tình đổi chiến lược ignore.
- **UP-2/UP-3/UP-4:** các vấn đề này **tự khỏi** khi install được refactor (tách I/O, cắt phụ thuộc vòng, cài nguyên tử). Không cần sửa riêng update — chỉ cần install sạch.

## 5. Kết luận

Feature **đúng tinh thần DRY** — mỏng, ủy quyền cho install. Điểm trừ nhỏ (param chết, visibility cứng) dễ sửa. Phần lớn nợ là **thừa kế gián tiếp**, nên cứ ưu tiên làm sạch `install` thì update hưởng lợi theo.
