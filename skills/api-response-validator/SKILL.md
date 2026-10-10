---
name: api-response-validator
description: "So sánh response API thật với response mong đợi, JSON schema hoặc contract mô tả bằng lời. Dùng khi tester paste JSON response, expected response, Swagger schema hoặc sample output và cần chỉ ra field thiếu, field thừa, sai kiểu dữ liệu, sai giá trị, sai format hoặc sai business rule."
---

# API Response Validator

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file output, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/api-response-validator/HHmmss-endpoint-or-case/
```

Mỗi artifact phải ghi `Session timestamp`, response thực tế, expected/schema, kết quả so sánh và phần dữ liệu đã redact nếu có.

## Mục tiêu
Giúp tester kiểm tra response API mà không cần tự đọc JSON thủ công từng field.

## Script hỗ trợ
Nếu input là file JSON hoặc URL, ưu tiên dùng support script ở chế độ `--report` trước:

- `safe_download.py` để kiểm tra URL response/spec từ xa
- `compare_json.py` để so actual JSON và expected JSON khi cả hai đều ở dạng file
- `json_to_markdown_table.py` để đổi JSON diff hoặc response nhỏ thành bảng Markdown dễ review
- `redact_sensitive.py` trước khi lưu log/response có token, email, phone hoặc dữ liệu nhạy cảm

## Quy trình

### Bước 1 - Xác định nguồn so sánh
Nhận một hoặc nhiều input:

- Actual response JSON.
- Expected response JSON.
- JSON schema hoặc OpenAPI schema.
- Mô tả expectation bằng lời.
- Status code, header hoặc error format kỳ vọng.

Nếu thiếu expected/schema, hỏi user muốn so với tài liệu nào. Nếu user chỉ cần review actual response, đánh dấu kết quả là "phát hiện nghi vấn", không kết luận sai tuyệt đối.

Nếu actual và expected đều là file JSON, chạy `compare_json.py --report` trước để có danh sách diff sơ bộ theo path. Sau đó dùng kết quả đó để viết phần phân tích trong output của skill, thay vì tự dò tay toàn bộ JSON.

Nếu user muốn nhìn response dạng bảng hoặc cần artifact dễ đọc, có thể chạy `json_to_markdown_table.py --report` trước với actual response hoặc diff JSON rồi mới `--execute`.

### Bước 2 - So sánh có cấu trúc
Kiểm tra:

- Status code.
- Field bắt buộc bị thiếu.
- Field thừa có rủi ro leak dữ liệu.
- Sai kiểu dữ liệu: string/number/boolean/object/array/null.
- Sai format: date, datetime, email, UUID, money, phone, enum.
- Sai giá trị nghiệp vụ: status, role, amount, currency, owner, permission.
- Sai cấu trúc nested object hoặc array item.
- Header quan trọng nếu được cung cấp: content-type, cache, rate limit, correlation ID.

### Bước 3 - Đánh mức độ
- `BLOCKER`: response làm hỏng luồng chính hoặc leak dữ liệu.
- `HIGH`: sai contract quan trọng, client dễ lỗi.
- `MEDIUM`: sai field phụ, ảnh hưởng một phần.
- `LOW`: naming/format nhỏ, cần xác nhận thêm.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Endpoint: [method path nếu có]
Kết luận: [Pass/Fail/Cần xác nhận]

| Field/Path | Actual | Expected | Vấn đề | Severity | Ghi chú |
|---|---|---|---|---|---|

Tóm tắt:
- Field thiếu: [...]
- Field thừa: [...]
- Sai type/format/value: [...]
- Cần hỏi dev/BA: [...]
```

## Lưu ý
- Không hiển thị nguyên văn token, password, secret hoặc dữ liệu cá nhân không cần thiết.
- Nếu actual response quá dài, chỉ trích phần liên quan và nêu rõ đã rút gọn.
- Nếu cần lưu response ra artifact, chạy `redact_sensitive.py --report` trước, chỉ `--execute` khi user chấp nhận bản đã redact.
