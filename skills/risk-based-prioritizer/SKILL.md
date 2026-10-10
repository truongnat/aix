---
name: risk-based-prioritizer
description: "Xếp hạng module, feature hoặc test case theo rủi ro khi thời gian test bị giới hạn. Dùng khi tester cần quyết định test phần nào trước dựa trên impact, tần suất sử dụng, độ phức tạp thay đổi, lịch sử bug, dependency, dữ liệu nhạy cảm và mức độ ảnh hưởng tới người dùng."
---

# Risk-Based Prioritizer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file ưu tiên test, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/risk-based-prioritizer/HHmmss-scope/
```

Mỗi artifact phải ghi `Session timestamp`, scope đầu vào, scoring rule, bảng ưu tiên và assumption.

## Mục tiêu
Giúp tester chọn đúng phần cần test trước khi không đủ thời gian test toàn bộ.

## Scoring
Chấm mỗi item từ 1 đến 5 theo các tiêu chí:

- User/business impact.
- Tần suất sử dụng.
- Độ phức tạp thay đổi.
- Dependency với hệ thống khác.
- Lịch sử bug hoặc khu vực hay regression.
- Dữ liệu nhạy cảm, tiền, quyền truy cập hoặc compliance.
- Mức độ khó rollback hoặc khó phát hiện lỗi.

Risk score = tổng điểm. Nếu tiêu chí nào không có dữ liệu, ghi `Unknown` và hỏi lại nếu ảnh hưởng lớn.

## Quy trình

1. Đọc danh sách module/feature/test case.
2. Chuẩn hóa thành từng item độc lập.
3. Chấm điểm theo tiêu chí trên.
4. Xếp nhóm ưu tiên: `Must test`, `Should test`, `Can defer`.
5. Đề xuất test focus và phần có thể giảm scope.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

| Rank | Item | Risk Score | Priority | Lý do | Test focus | Có thể bỏ qua? |
|---|---:|---:|---|---|---|---|

Khuyến nghị:
- Test trước: [...]
- Test nếu còn thời gian: [...]
- Có thể defer: [...]
- Cần hỏi thêm: [...]
```

## Lưu ý
- Không chỉ ưu tiên theo cảm tính. Luôn nêu lý do theo tiêu chí.
- Nếu user đưa sẵn deadline hoặc số ngày công QA, dùng thông tin đó để đề xuất phạm vi thực tế.
