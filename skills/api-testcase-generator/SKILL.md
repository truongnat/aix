---
name: api-testcase-generator
description: "Sinh test case API từ Swagger/OpenAPI spec, Postman collection, tài liệu endpoint hoặc mô tả request/response. Dùng khi tester cần kiểm thử API mà không cần đọc source code: status code, schema, required params, auth, permission, boundary, negative case và error handling."
---

# API Testcase Generator

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file output, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/api-testcase-generator/HHmmss-api-or-feature/
```

Mỗi output chính phải ghi `Session timestamp`, nguồn spec, assumption, endpoint được cover và case bị giới hạn do thiếu thông tin.

## Mục tiêu
Tạo test case API thực dụng cho tester manual từ Swagger/OpenAPI, Postman collection, curl, sample request/response hoặc mô tả endpoint.

## Script hỗ trợ
Nếu input là file hoặc URL, ưu tiên dùng support script ở chế độ `--report` trước khi đọc nội dung:

- `safe_download.py` cho URL spec hoặc file đính kèm từ xa
- `parse_openapi.py` cho OpenAPI/Swagger JSON hoặc YAML
- `parse_postman.py` cho Postman collection JSON
- `postman_env_redactor.py` cho Postman environment export có token, secret hoặc password
- `redact_sensitive.py` nếu spec hoặc example có token, API key hoặc dữ liệu thật

Chỉ chạy `--execute` khi thực sự cần lưu file cục bộ hoặc tạo artifact.

## Quy trình

### Bước 1 - Đọc input và hỏi thiếu thông tin
Nếu user đưa URL tới Swagger/OpenAPI file, chạy `safe_download.py --report` trước để kiểm tra content-type, size và output path dự kiến.

Nếu user đưa file OpenAPI JSON/YAML, chạy `parse_openapi.py --report` trước để lấy:

- title/version
- danh sách endpoint
- method/path
- response codes
- security scheme

Nếu user đưa Postman collection JSON, chạy `parse_postman.py --report` trước để lấy:

- collection name/schema
- request count
- method và URL từng request
- auth type ở collection hoặc request level
- body mode và header count

Nếu user đưa thêm Postman environment JSON, chạy `postman_env_redactor.py --report` trước khi lưu artifact hoặc trích biến environment vào output.

Sau đó mới dùng kết quả parse để sinh test case. Không đọc spec lớn theo kiểu thủ công trước khi có report parse.

Xác định:

- Base URL hoặc môi trường test.
- Endpoint, method, path param, query param, body, header.
- Auth type: bearer token, API key, session, role/permission.
- Response schema, status code kỳ vọng, error format.
- Rule nghiệp vụ liên quan tới endpoint.

Nếu thiếu thông tin, hỏi tối đa 3 câu quan trọng nhất trước. Nếu user nói cứ generate với thông tin hiện có, tiếp tục và ghi rõ assumption.

### Bước 2 - Sinh case theo nhóm

- Positive: request hợp lệ, status code đúng, response schema đúng.
- Required field: thiếu từng param/body field bắt buộc.
- Type/format: sai kiểu dữ liệu, sai format email/date/UUID/number.
- Boundary: min/max, rỗng, null, quá dài, list trống/list lớn.
- Auth: thiếu token, token hết hạn, token sai, role không đủ quyền.
- Permission: user A truy cập dữ liệu user B, role thấp gọi endpoint role cao.
- Business rule: trạng thái không hợp lệ, workflow sai thứ tự, dữ liệu không tồn tại.
- Error handling: 400/401/403/404/409/422/500 nếu áp dụng.
- Contract: response thiếu field, thừa field quan trọng, sai enum, sai nullable.

Chỉ sinh case phù hợp với endpoint. Nếu nhóm không áp dụng, ghi lý do skip.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
API source: [Swagger/Postman/curl/spec text]
Assumptions: [...]

| ID | Endpoint | Method | Title | Type | Priority | Preconditions | Request Data | Expected Status | Expected Response | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
```

Priority:

- `P0`: luồng chính, auth/permission quan trọng, case có rủi ro cao.
- `P1`: negative/boundary thường gặp.
- `P2`: edge case ít gặp hoặc phụ thuộc môi trường.

## Lưu ý
- Không tự bịa schema nếu spec không có. Chỉ suy luận có đánh dấu `Assumption`.
- Không sinh request chứa token thật, password thật hoặc dữ liệu cá nhân thật.
- Nếu user cần file CSV, tạo `api-testcases.csv` trong artifact folder với cùng cột.
- Nếu input spec chứa secret hoặc token, chạy `redact_sensitive.py --report` trước khi lưu artifact hoặc trích dẫn lại.
