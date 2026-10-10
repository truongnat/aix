---
name: sql-analyzer
description: Dịch yêu cầu kiểm tra dữ liệu bằng ngôn ngữ tự nhiên thành câu lệnh SQL, chạy qua kết nối database (MCP) nếu có sẵn, và giải thích kết quả bằng ngôn ngữ dễ hiểu cho tester không rành SQL. Dùng khi user cần verify dữ liệu trong DB, hoặc khi dev đưa một câu SQL và user cần hiểu nó đang làm gì.
---

# SQL Analyzer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file kết quả, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/sql-analyzer/HHmmss-short-topic/
```

Mỗi artifact phải ghi `Session timestamp`, câu hỏi gốc, SQL đã chạy, kết luận, và các giới hạn dữ liệu nếu có. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Điều kiện tiên quyết
Skill này cần một kết nối MCP tới database (read-only) đã được thiết lập sẵn trong Claude Desktop/claude.ai. Nếu không có kết nối MCP database nào khả dụng trong phiên làm việc, KHÔNG tự bịa kết quả — báo cho user rằng cần kết nối MCP database trước, và có thể đề xuất tìm connector phù hợp.

## Hai chế độ sử dụng

### Chế độ 1 — User mô tả điều cần kiểm tra bằng lời, Claude tự viết và chạy SQL

**Quy trình:**
1. Đọc yêu cầu của user (VD: "kiểm tra đơn hàng của user X có đúng trạng thái đã thanh toán không")
2. Nếu thiếu thông tin để viết query chính xác — tên bảng, tên field, tiêu chí cụ thể là gì — hỏi lại ngắn gọn. Ví dụ hỏi: "Bạn biết tên bảng lưu đơn hàng không, hay để tôi tự tìm trong schema?"
3. Nếu có thể, tự khám phá schema DB trước (liệt kê bảng, cột liên quan) thay vì đoán tên bảng
4. Viết câu SQL, CHỈ dùng câu truy vấn đọc dữ liệu (`SELECT`, hoặc câu tương đương read-only tùy database). Không chạy bất kỳ câu lệnh ghi/xóa/sửa schema nào.
5. Chạy query, lấy kết quả
6. Giải thích kết quả bằng ngôn ngữ thường, không dùng thuật ngữ SQL — trả lời thẳng câu hỏi ban đầu của user (đúng/sai, có/không, số lượng bao nhiêu)
7. Đính kèm câu SQL đã chạy để user có thể lưu lại tham khảo sau

### Chế độ 2 — Dev đưa sẵn một câu SQL, user muốn hiểu nó làm gì

**Quy trình:**
1. Đọc câu SQL được đưa
2. Giải thích từng phần bằng ngôn ngữ thường: câu này lấy dữ liệu gì, từ bảng nào, điều kiện lọc là gì, join với bảng nào để làm gì
3. Nếu user muốn, chỉ chạy thử khi câu SQL là read-only. Nếu câu SQL có thao tác ghi/xóa/sửa schema, chỉ giải thích ý nghĩa và rủi ro, không chạy.
4. Nếu câu SQL có vẻ phức tạp (nhiều join, subquery), chia nhỏ giải thích theo từng bước thay vì giải thích một lần toàn bộ

## Nguyên tắc an toàn
- KHÔNG BAO GIỜ chạy lệnh ghi/xóa/sửa dữ liệu hoặc schema (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `MERGE`, stored procedure có side effect), kể cả khi user xác nhận.
- Nếu user cần câu lệnh ghi dữ liệu cho môi trường test, chỉ được phép viết draft để dev/DBA tự review và chạy.
- Nếu không chắc câu lệnh có read-only hay không, không chạy và hỏi lại.
- Nếu kết quả trả về nhạy cảm (thông tin cá nhân khách hàng), chỉ hiển thị phần cần thiết để trả lời câu hỏi, không liệt kê thừa các field nhạy cảm không liên quan.

## Format kết quả
Trả lời trực tiếp câu hỏi trước, sau đó mới đến chi tiết:

```
Kết luận: [Đúng/Sai/Có/Không + số liệu cụ thể]

Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Câu SQL đã chạy:
[query]

Giải thích: [diễn giải ngắn gọn ý nghĩa kết quả]
```
