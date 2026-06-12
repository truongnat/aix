# Đánh giá kiến trúc theo từng feature — `src/features/`

> **Ngày:** 2026-06-11 · **Người đánh giá:** Senior AI Engineer · **Commit:** `1e14fb8`
> Tài liệu tổng quan toàn hệ thống: [`../architecture-review-typescript-migration.md`](../architecture-review-typescript-migration.md)

Mỗi feature trong `src/features/` được đánh giá riêng theo 5 tiêu chí (thang 1–5):

| Feature | Phân tầng | An toàn kiểu | Test | Tái sử dụng | Độ sạch | TB | Báo cáo |
|---------|:--------:|:-----------:|:----:|:-----------:|:------:|:---:|---------|
| **insights** | 4 | 3 | 2 | 4 | 5 | **3.6** | [feature-insights.md](feature-insights.md) |
| **telemetry** | 5 | 4 | 4 | 4 | 5 | **4.4** | [feature-telemetry.md](feature-telemetry.md) |
| **install** | 2 | 2 | 3¹ | 3 | 3 | **2.6** | [feature-install.md](feature-install.md) |
| **uninstall** | 2 | 2 | 3¹ | 3 | 3 | **2.6** | [feature-uninstall.md](feature-uninstall.md) |
| **update** | 3 | 2 | 3¹ | 5 | 4 | **3.4** | [feature-update.md](feature-update.md) |
| **validate** | 2 | 3 | 2 | 4 | 4 | **3.0** | [feature-validate.md](feature-validate.md) |
| **shared/install-kernel** | 5 | 4 | 4 | 5 | 5 | **4.6** | [shared-install-kernel.md](shared-install-kernel.md) |

> ¹ Test gián tiếp qua shim `lib/backend/*` (vd. `test/backend/install-orchestrator.test.js`), nhưng **không** được tính vào coverage (`--include=dist/lib/**`).

## Xếp hạng "tham chiếu vàng" → "cần ưu tiên sửa"

1. 🥇 **shared/install-kernel**, **telemetry** — domain thuần, HTTP semantics đúng, DI tốt. Dùng làm chuẩn cho các feature khác.
2. 🥈 **insights** — code sạch, dùng `fetch` native không phụ thuộc; thiếu test + timeout/retry mạng.
3. 🥈 **update** — mỏng, tái dùng `runInstall` rất tốt; có param chết (`force`) và phụ thuộc chéo feature.
4. 🥉 **validate** — pattern validator-registry có trọng số rất hay, nhưng **tầng domain bị "ô nhiễm" I/O nặng** và interface bị nhân đôi.
5. ⚠️ **install / uninstall** — vấn đề chung lớn nhất: **application layer tự in stdout** (việc của presentation), cầu nối `legacy-deps` mất kiểu, và thao tác nhiều provider **không nguyên tử**.

## 3 chủ đề lặp lại trên nhiều feature

1. **I/O của presentation rò vào application** (`process.stdout.write` trong `run-install.ts`, `run-uninstall.ts`) → khó test, khó tái dùng phi-CLI.
2. **Mất kiểu tại ranh giới** (`as any`, `(...args: unknown[]) => void` trong các `legacy-deps.ts`).
3. **Nhãn tầng sai bản chất** (`index.ts` ghi `Layer: presentation` nhưng là barrel; `validate/domain/contracts.ts` ghi `domain` nhưng đầy `fs`/`child_process`).

Chi tiết bằng chứng & khuyến nghị nằm trong từng file.
