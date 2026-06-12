# Shared: `install-kernel` — Đánh giá

> Lõi dùng chung cho install/uninstall/update: hằng số đường dẫn provider + logic vệ sinh git (`.git/info/exclude`).
> **Điểm trung bình: 4.6/5** — module nền tốt nhất repo.

## 1. Cấu trúc

```
shared/install-kernel/
├─ constants.ts   # EXCLUDE_BLOCK_START/END, HARNESS_MARKER,
│                 # providerCommandPaths, ignorePathsForProvider, uninstallPathsForProvider
├─ git-hygiene.ts # applyPrivateIgnore, removeIgnoreBlock, reconcileDeferredPrivateIgnore...
└─ index.ts       # barrel export (đúng nghĩa public API)
```

## 2. Điểm mạnh ✅

1. **Tách đúng "shared kernel".** Logic git-hygiene + bảng đường dẫn provider được rút ra khỏi feature, dùng chung bởi install/uninstall — tránh trùng lặp và lệch hành vi.
2. **`index.ts` là barrel đúng bản chất** (khác `install/index.ts` gán nhãn sai) — chỉ export hàm/hằng/kiểu công khai (`IgnoreContext`, `IgnoreResult`), không rò nội bộ.
3. **Hành vi idempotent & an toàn** — dùng marker block (`EXCLUDE_BLOCK_START/END`, `HARNESS_MARKER`) để chèn/gỡ chính xác phần do harness sở hữu, không phá nội dung người dùng.
4. **Có test** trong `test/backend/git-hygiene.test.js`.
5. **`dryRun` xuyên suốt** — mọi thao tác ghi đều tôn trọng cờ dry-run.

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Mức |
|----|--------|-----|
| K-1 | **`git-hygiene` vẫn ghi tiến trình ra stdout** (qua lời gọi trong install) thay vì trả event để presentation render | 🟢 |
| K-2 | **Đặt trong `shared/` nhưng `index.ts` chú thích `// Layer: domain`** — `git-hygiene` có I/O (đọc/ghi `.git/info/exclude`) nên nghiêng về infrastructure hơn là domain thuần | 🟢 |
| K-3 | Coverage không tính `dist/shared/**` (gate chỉ `dist/lib/**`) | 🟡 |

## 4. Khuyến nghị

- Là **đích đến tự nhiên** để gom các tiện ích mà `src/features/*/infrastructure/legacy-deps.ts` đang `require` ngược từ `lib/` (provider-detection, cli-providers…). Khi migrate tiếp, đưa chúng vào `shared/` để cắt phụ thuộc vòng `src → lib`.
- Phân biệt rõ `domain` (hằng số/tính toán đường dẫn thuần trong `constants.ts`) và `infrastructure` (I/O git trong `git-hygiene.ts`) — có thể tách `git-hygiene` ra nhãn infrastructure.
- Đưa `dist/shared/**` vào coverage gate.

## 5. Kết luận

Module nền vững nhất. Nên coi đây là "trái tim" để các feature install-lifecycle hội tụ về, và là nơi nhận các tiện ích legacy khi cắt phụ thuộc hai chiều.
