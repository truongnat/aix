# Feature: `telemetry` — Đánh giá

> Server HTTP nhận và lưu telemetry export (NDJSON) + health check.
> **Điểm trung bình: 4.4/5** — feature tham chiếu (golden reference).

## 1. Cấu trúc

```
telemetry/
├─ domain/
│  ├─ constants.ts              # TELEMETRY_SCHEMA_ID, DEFAULT_MAX_STORAGE_BYTES
│  └─ telemetry-payload.ts      # type + validateTelemetryPayload (thuần)
├─ application/
│  ├─ ingest-telemetry.ts       # validate → persist, trả status code
│  └─ health-check.ts
├─ infrastructure/
│  ├─ file-storage.ts           # appendTelemetryExport (NDJSON, có size cap)
│  ├─ http-body-reader.ts       # đọc body có giới hạn byte
│  └─ server-config.ts
└─ presentation/
   ├─ create-server.ts          # http.createServer
   ├─ routes.ts                 # định tuyến /health, /api/telemetry
   └─ json-response.ts
```
Entrypoint runtime: `bin/telemetry-server.js` → `dist/server/telemetry.js`.

## 2. Điểm mạnh ✅

1. **Domain thuần đúng nghĩa.** `domain/telemetry-payload.ts` chỉ có type + hàm validate, không I/O — dễ test, không phụ thuộc Node.
2. **HTTP semantics chuẩn — tốt hơn các feature khác.** `ingest-telemetry.ts` phân biệt mã trạng thái có ý nghĩa: `202` accepted, `422` payload sai, `507` hết dung lượng lưu trữ, `400` lỗi khác (`ingest-telemetry.ts:27-49`).
3. **Phòng thủ payload lớn.** `http-body-reader.ts` đếm byte và `req.destroy()` khi vượt `maxBodyBytes` **trước khi** `JSON.parse` (`http-body-reader.ts:15-19`) → chống tấn công body lớn.
4. **Dependency injection sạch.** Mọi điểm I/O nhận `storageDir`, `maxStorageBytes`, `routePath` qua `options` → test với thư mục tạm dễ dàng.
5. **Không phụ thuộc `lib/` legacy.** Feature này độc lập hoàn toàn — khác hẳn install/uninstall/update.
6. **Có test thực sự** ở cả 4 tầng: `test/features/telemetry/{domain,application,infrastructure,presentation}/*.test.js`.

## 3. Khoảng trống ⚠️

| ID | Vấn đề | Vị trí | Mức |
|----|--------|--------|-----|
| T-1 | **Không auth/token, không rate-limit, không security headers/CORS** | `routes.ts` | 🟡 (ok cho dev nội bộ; rủi ro nếu expose ra ngoài) |
| T-2 | **Validation nông** — chỉ kiểm `aggregate.totalEvents` là number; các map/array lồng (`skills`, `tools`...) không validate | `telemetry-payload.ts:39-45` | 🟡 |
| T-3 | **Size cap chỉ chặn, không xoay vòng (rotate).** Khi file đạt ngưỡng, mọi ingest trả `507` vĩnh viễn | `file-storage.ts:30-32` | 🟡 |
| T-4 | **`storageDir` mặc định theo `process.cwd()`** → phụ thuộc thư mục chạy tiến trình | `routes.ts:34` | 🟢 |
| T-5 | **`void handleTelemetryRequest(...)`** — promise bị bỏ (fire-and-forget); lỗi async ngoài try sẽ không được bắt | `create-server.ts:10` | 🟢 (đã có try/catch bên trong, nhưng `@typescript-eslint/no-floating-promises` sẽ cảnh báo nếu được bật) |

## 4. Khuyến nghị

- **Nếu phát hành ra mạng:** thêm shared-secret/bearer token (so khớp `process.env`), rate-limit theo IP, và `Content-Security-Policy`/từ chối origin lạ.
- **T-3:** đổi chính sách sang rotate (đổi tên file `.ndjson.1`) hoặc truncate vòng, kèm log cảnh báo — tránh "kẹt cứng" 507.
- **T-2:** nếu nhận dữ liệu không tin cậy, validate sâu (duyệt từng entry `tools[]` đúng shape) hoặc dùng schema validator.
- **T-5:** xử lý promise rejection của `handleTelemetryRequest` ở `create-server.ts` (`.catch(() => res.writeHead(500).end())`).

## 5. Kết luận

Feature **chín nhất** cùng `install-kernel`. Dùng `telemetry` làm **khuôn mẫu** khi refactor install/uninstall/validate: domain thuần, application trả kết quả có cấu trúc + status code, presentation chỉ render. Các gap còn lại đều thuộc nhóm hardening vận hành, không phải lỗi kiến trúc.
