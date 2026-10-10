---
name: test-data-generator
description: "Sinh dữ liệu test giả cho form, API hoặc database seed phục vụ tester manual. Dùng khi cần tên, email, số điện thoại, địa chỉ Việt Nam, mã số, ngày tháng, dữ liệu hợp lệ/không hợp lệ, boundary, dữ liệu Unicode, dữ liệu dài hoặc bộ dữ liệu theo locale mà không dùng thông tin cá nhân thật."
---

# Test Data Generator

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file dữ liệu, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/test-data-generator/HHmmss-data-purpose/
```

Mỗi artifact phải ghi `Session timestamp`, mục đích dữ liệu, field list, rule và dữ liệu đã sinh.

## Mục tiêu
Tạo dữ liệu test giả, rõ mục đích, không dùng thông tin cá nhân thật, có cả valid và invalid data.

## Quy trình

### Bước 1 - Xác định field và rule
Hỏi hoặc đọc từ input:

- Tên field, kiểu dữ liệu, required/optional.
- Format, min/max, enum, unique constraint.
- Locale: mặc định `vi-VN` nếu user không nói.
- Số lượng record cần tạo.
- Mục đích: form test, API request, boundary, negative, import CSV.

### Bước 2 - Sinh dữ liệu theo nhóm

- Valid data: dữ liệu hợp lệ, dễ đọc.
- Invalid data: sai format, thiếu required, sai type, vượt giới hạn.
- Boundary data: min, max, min-1, max+1, rỗng, rất dài.
- Locale data: tiếng Việt có dấu, số điện thoại VN giả, địa chỉ VN giả.
- Unicode/special: emoji, ký tự đặc biệt, khoảng trắng đầu/cuối.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Purpose: [form/API/import/...]
Locale: [vi-VN/en-US/...]

| Case | Field | Value | Valid? | Mục đích |
|---|---|---|---|---|
```

Nếu user cần CSV hoặc JSON, tạo file tương ứng trong artifact folder.

## Quy tắc an toàn
- Không tạo dữ liệu trông như thông tin cá nhân thật của người thật.
- Email nên dùng domain an toàn như `example.com`.
- Số điện thoại, địa chỉ, mã định danh phải là dữ liệu giả và ghi rõ là fake.
