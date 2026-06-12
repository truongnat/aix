# Feature: `insights` — Đánh giá

> Tổng hợp telemetry cục bộ, gợi ý eval, chạy regression và upload export ẩn danh lên endpoint từ xa.
> **Điểm trung bình: 3.6/5** — code sạch nhất nhóm, nhưng thiếu test và độ bền mạng.

## 1. Cấu trúc

```
insights/
├─ domain/
│  ├─ event.ts                  # kiểu Event
│  ├─ summary.ts                # summarizeEvents (THUẦN, rất tốt)
│  ├─ eval-recommendations.ts   # kiểu Recommendation
│  └─ export-payload.ts
├─ application/
│  ├─ build-insights.ts
│  ├─ recommend-evals.ts
│  ├─ run-eval-regression.ts
│  └─ upload-insights.ts        # orchestrate build → post
├─ infrastructure/
│  ├─ event-reader.ts
│  ├─ harness-config.ts
│  ├─ http-upload.ts            # fetch() native
│  ├─ eval-task-runner.ts
│  └─ regression-report-store.ts
└─ presentation/
   ├─ format-insights-text.ts
   └─ format-eval-recommendations.ts
```
Truy cập từ `lib/insights/*` qua **shim** (dùng `typeof import(...)` — mẫu giữ-kiểu tốt, nên nhân rộng).

## 2. Điểm mạnh ✅

1. **`domain/summary.ts` là domain mẫu mực** — hoàn toàn thuần: `Map` đếm, sắp xếp ổn định (`count desc, key asc`), không I/O (`summary.ts:29-77`). Rất dễ test, không phụ thuộc Node.
2. **`http-upload.ts` dùng `fetch` native** — không thêm dependency (axios/node-fetch), ném lỗi giàu thông tin kèm body khi `!response.ok` (`http-upload.ts:25-28`).
3. **`upload-insights.ts` orchestrate sạch** — kiểm `enabled`/`force`, resolve endpoint từ config/env, build payload, post, trả `UploadResult` có cấu trúc rõ (`upload-insights.ts:23-60`). Không in ra stdout → đúng tầng application.
4. **Tách tầng presentation cho định dạng text** (`format-*`) — không trộn render vào logic.
5. **Shim legacy giữ kiểu** qua `typeof import(...)` thay vì `as any` — tương phản tích cực với `legacy-deps.ts` của install.

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Vị trí | Mức |
|----|--------|--------|-----|
| I-1 | **Không timeout/retry cho upload mạng** — `fetch` treo vô hạn nếu endpoint không phản hồi | `http-upload.ts:16` | 🟠 |
| I-2 | **Mất kiểu cho Event** — truy cập `event.skill as string`, `event.command as string`, `Number(event.exit_code)` | `summary.ts:39-62` | 🟡 |
| I-3 | **Coverage = 2/5** — chỉ có `test/features/insights/application/recommend-evals.test.js`; `summary.ts`, `upload-insights.ts`, `http-upload.ts`, regression… chưa có test trực tiếp | `test/features/insights/` | 🟠 |
| I-4 | **`authHeader` truyền thẳng** — không có chỗ tải bí mật an toàn (env), người gọi tự lo | `upload-insights.ts:48-52` | 🟢 |

## 4. Khuyến nghị

- **I-1:** thêm `AbortController` + timeout (vd. 10s) và 1–2 lần retry có backoff cho `postJsonPayload`; phân biệt lỗi mạng vs lỗi 4xx/5xx.
- **I-2:** định nghĩa `Event` dạng discriminated union theo `type` (`skill-run` | `guard-phase` | `tool-run` | `subagent-run`) để bỏ các `as string`/`Number(...)` và để compiler bắt lỗi field.
- **I-3:** bổ sung unit test cho `summarizeEvents` (đầu vào hỗn hợp → đếm/sắp xếp), `uploadInsightsExport` (disabled/force/missing-endpoint/success), và `http-upload` (mock fetch ok/!ok).
- Khi mở rộng coverage gate (xem báo cáo tổng), feature này sẽ là nơi dễ nâng độ phủ nhất.

## 5. Kết luận

Chất lượng code cao, kiến trúc đúng tầng, không nợ phụ thuộc nặng. Hai việc cần làm: **độ bền mạng (timeout/retry)** và **test**. Dùng `summary.ts` làm ví dụ mẫu cho "domain thuần".
