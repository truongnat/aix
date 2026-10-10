---
name: test-plan-writer
description: "Viết test plan cho sprint, release hoặc một nhóm feature từ danh sách scope, requirement, timeline và nguồn lực QA. Dùng khi tester hoặc QA lead cần xác định phạm vi test, out of scope, test approach, môi trường, dữ liệu, rủi ro, entry/exit criteria và ước lượng thời gian."
---

# Test Plan Writer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file test plan, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/test-plan-writer/HHmmss-release-or-sprint/
```

Mỗi artifact phải ghi `Session timestamp`, nguồn scope, assumption, phần còn thiếu và test plan cuối cùng.

## Mục tiêu
Tạo test plan ngắn gọn, đủ dùng cho sprint/release, không chỉ tập trung vào một feature đơn lẻ.

## Script hỗ trợ
Nếu scope đầu vào đến từ file hoặc URL, ưu tiên chạy support script ở chế độ `--report` trước:

- `safe_download.py` cho tài liệu scope ở URL
- `read_excel.py` cho danh sách feature/test scope trong CSV/XLSX
- `read_pdf.py` cho BRD/spec ở PDF
- `read_docx.py` cho BRD/spec ở Word `.docx`

## Quy trình

### Bước 1 - Thu thập scope
Nếu danh sách feature ở dạng Excel/CSV, chạy `read_excel.py --report` trước để biết sheet, header và sample rows trước khi viết test plan.

Nếu BRD/scope ở dạng Word `.docx`, chạy `read_docx.py --report` trước để biết cấu trúc đoạn và bảng trước khi tóm phạm vi test.

Xác định:

- Danh sách feature/change trong sprint hoặc release.
- Phạm vi cần test và không test.
- Timeline, deadline, người tham gia, môi trường.
- Risk đã biết, dependency, dữ liệu test, tài khoản/role.
- Loại test cần chạy: smoke, functional, regression, API, UI, compatibility, exploratory.

Nếu thiếu, hỏi tối đa 3 câu quan trọng nhất trước.

### Bước 2 - Phân tích rủi ro và effort
Với từng feature, đánh giá:

- Impact tới người dùng hoặc nghiệp vụ.
- Tần suất sử dụng.
- Độ phức tạp thay đổi.
- Phụ thuộc hệ thống khác.
- Lịch sử bug hoặc khu vực hay lỗi.
- Thời gian test ước lượng.

### Bước 3 - Viết test plan
Test plan phải rõ cái gì test, cái gì không test, ai phụ trách và khi nào kết thúc được.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

# Test Plan: [Sprint/Release/Feature group]

## 1. Mục tiêu
## 2. Phạm vi test
## 3. Out of scope
## 4. Test approach
## 5. Môi trường và dữ liệu test
## 6. Resource và timeline
## 7. Risk và mitigation
## 8. Entry criteria
## 9. Exit criteria
## 10. Deliverables
## 11. Câu hỏi cần làm rõ
```

## Lưu ý
- Không biến test plan thành danh sách test case chi tiết.
- Nếu timeline quá gấp, nêu rõ phần phải ưu tiên và phần có thể giảm phạm vi.
