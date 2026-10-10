---
name: edge-case-brainstormer
description: "Brainstorm edge case và câu hỏi dạng 'điều gì xảy ra nếu...' cho một tình huống nghiệp vụ, form, API, workflow hoặc rule. Dùng khi tester cần nghĩ thêm case ngoài spec, phát hiện exception, negative path, boundary, state lạ, dữ liệu bất thường và câu hỏi cần hỏi BA/PM/dev."
---

# Edge Case Brainstormer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file brainstorm, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/edge-case-brainstormer/HHmmss-scenario/
```

Mỗi artifact phải ghi `Session timestamp`, scenario gốc, danh sách edge case, mức độ rủi ro và câu hỏi cần làm rõ.

## Mục tiêu
Giúp tester mở rộng suy nghĩ ngoài happy path, đặc biệt khi nghiệp vụ chưa quen hoặc spec quá ngắn.

## Nhóm brainstorm

- Input bất thường: rỗng, null, khoảng trắng, emoji, ký tự đặc biệt, rất dài, sai format.
- Boundary: min, max, min-1, max+1, vừa đủ, vượt giới hạn.
- Role/permission: user không đủ quyền, owner khác, role thay đổi giữa chừng.
- State: draft, pending, approved, rejected, cancelled, expired, deleted.
- Time: hết hạn, timezone, cuối ngày, cuối tháng, năm nhuận.
- Concurrency: hai người thao tác cùng lúc, double click, retry, submit nhiều lần.
- Data relation: dữ liệu bị xóa, dữ liệu cũ, dữ liệu duplicate, foreign key không còn.
- Integration: service chậm, timeout, response lỗi, mất mạng.
- UI/API mismatch: UI cho phép nhưng API reject, API trả field UI không xử lý.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Scenario: [mô tả]

| Nhóm | Edge case | Vì sao đáng test | Priority | Câu hỏi cần hỏi |
|---|---|---|---|---|
```

## Lưu ý
- Không biến tất cả ý tưởng thành P0. Chỉ đánh P0 cho case ảnh hưởng luồng chính, tiền, quyền, dữ liệu hoặc compliance.
- Nếu edge case chỉ là suy luận ngoài spec, ghi rõ cần confirm.
