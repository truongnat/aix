---
name: requirement-gap-checker
description: Rà soát spec/requirement trước khi viết test case để tìm điểm mơ hồ, thiếu sót, hoặc mâu thuẫn. Dùng khi user vừa nhận spec/feature mới và muốn kiểm tra xem đã hiểu đủ và đúng chưa trước khi bắt tay viết test case, thay vì phát hiện thiếu sót giữa chừng.
---

# Requirement Gap Checker

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file review requirement, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/requirement-gap-checker/HHmmss-feature-slug/
```

Mỗi artifact phải ghi `Session timestamp`, requirement nguồn, bảng gap, mức độ block test design, và câu hỏi cần hỏi PM/dev. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Mục tiêu
Đọc spec thô (có thể lộn xộn, thiếu, viết tắt) và chỉ ra rõ những chỗ chưa đủ rõ để test được, TRƯỚC KHI bắt tay viết test case — tránh tình trạng viết xong rồi mới phát hiện hiểu sai.

## Script hỗ trợ
Nếu requirement đến từ URL hoặc file, ưu tiên chạy support script ở chế độ `--report` trước:

- `safe_download.py` cho spec ở URL
- `read_pdf.py` cho file PDF
- `read_docx.py` cho file Word `.docx`
- `read_excel.py` cho file CSV/XLSX dạng rule table hoặc decision table
- `redact_sensitive.py` nếu file có dữ liệu thật

## Nguyên tắc quan trọng
KHÔNG tự đoán và lấp đầy chỗ thiếu bằng giả định của Claude. Nhiệm vụ của Skill này là CHỈ RA lỗ hổng, không phải lấp lỗ hổng. Việc lấp lỗ hổng là của PM/dev, hoặc của user sau khi đã hỏi họ.

## Quy trình

### Bước 1 — Đọc và phân loại nội dung spec
Nếu spec là PDF, chạy `read_pdf.py --report` trước để biết có extract text được không và cần xử lý bao nhiêu trang.

Nếu spec là file Word `.docx`, chạy `read_docx.py --report` trước để biết số đoạn, số bảng và sample nội dung trước khi review.

Nếu spec là CSV/XLSX, chạy `read_excel.py --report` trước để xác định cột nào là field, rule, actor hoặc status.

Chia spec thành các phần: Mục đích chính, Actor/role liên quan, Input/field, Luồng xử lý (flow), Ràng buộc nghiệp vụ, Điều kiện lỗi/exception (nếu có nêu).

### Bước 2 — Rà theo checklist gap sau, đánh dấu MISSING / MƠ HỒ / MÂU THUẪN cho từng mục

Mỗi gap phải có impact:
- `BLOCKER`: chưa thể viết test case có ý nghĩa nếu chưa làm rõ
- `HIGH`: có thể viết một phần, nhưng dễ sai logic hoặc miss case quan trọng
- `MEDIUM`: vẫn viết được test case chính, nhưng cần bổ sung để coverage tốt hơn
- `LOW`: câu hỏi làm rõ nhỏ, không block test design

**Về phạm vi (Scope)**
- Mục đích chính của feature có nêu rõ "làm gì" và "để làm gì" không?
- Có nêu rõ feature này áp dụng cho platform nào (web/app/cả hai) không?

**Về actor/quyền**
- Đã liệt kê đủ role/loại user liên quan chưa?
- Với mỗi role, có nêu rõ được phép làm gì / không được làm gì không?

**Về dữ liệu/input**
- Mỗi field có nêu: bắt buộc hay optional, kiểu dữ liệu, giới hạn (min/max/format) không?
- Có trường hợp input không hợp lệ được xử lý thế nào không, hay spec chỉ nói happy path?

**Về logic nghiệp vụ**
- Nếu có nhiều trạng thái (status), spec có nêu đủ các trạng thái và điều kiện chuyển trạng thái không?
- Có case đặc biệt nào chỉ được nhắc thoáng qua, không giải thích rõ (VD: "trường hợp đặc biệt sẽ xử lý riêng" — xử lý riêng là gì?)

**Về hệ thống liên quan**
- Feature này có phụ thuộc/ảnh hưởng tới feature khác không? Spec có nêu rõ không?
- Có yêu cầu về hiệu năng, giới hạn số lượng, đồng thời (concurrency) không?

### Bước 3 — Xuất kết quả theo 2 phần

**Phần 1: Bảng gap**

`Session timestamp: [YYYY-MM-DD HH:mm:ss Z]`

| Mục | Trạng thái | Impact | Vấn đề | Câu hỏi cần hỏi PM/dev |
|---|---|---|---|---|
| ... | MISSING/MƠ HỒ/MÂU THUẪN | BLOCKER/HIGH/MEDIUM/LOW | mô tả ngắn gọn | câu hỏi cụ thể, sẵn sàng copy đi hỏi luôn |

**Phần 2: Tóm tắt mức độ sẵn sàng**
Kết luận ngắn gọn:
- Có thể bắt đầu viết test case chưa?
- Có bao nhiêu gap theo từng impact?
- Top 3 câu hỏi cần hỏi trước nếu thời gian ít.

## Lưu ý khi tương tác
Nếu user chỉ đưa một đoạn mô tả rất ngắn (1-2 câu), vẫn chạy đủ checklist trên — càng ngắn thì càng nhiều mục MISSING, đó là kết quả đúng, không phải lỗi của Skill. Không tự bịa thêm chi tiết để spec "trông đủ" hơn thực tế.
