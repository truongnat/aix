---
name: daily-report-writer
description: Tổng hợp công việc đã làm trong ngày/tuần thành report gửi lead, dựa trên mô tả rời rạc của user (task đã làm, bug đã tìm, test case đã viết...). Dùng khi user cần gửi báo cáo tiến độ hàng ngày hoặc cuối tuần nhưng chỉ nhớ được lộn xộn những gì đã làm.
---

# Daily Report Writer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file daily/weekly report, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/daily-report-writer/HHmmss-report-scope/
```

Mỗi artifact phải ghi `Session timestamp`, `Report date`, nguồn activity đã dùng, activity bị loại vì khác ngày nếu có, và report cuối cùng. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Mục tiêu
Nhận danh sách công việc user kể lại (có thể rời rạc, không theo thứ tự, thiếu ngữ cảnh) và tổng hợp thành report rõ ràng, có cấu trúc, dễ đọc cho lead.

## Script hỗ trợ
Nếu cần tạo artifact cho chính report cuối cùng, dùng `artifact_init.py --report` trước để chốt folder output.

Nếu cần tổng hợp activity từ artifact đã tạo trong ngày, dùng `artifact_index.py --report REPORT_DATE` trước để index đúng:

```text
artifacts/REPORT_DATE/*/
```

Nếu cần bàn giao toàn bộ report artifact cho lead hoặc lưu trữ, dùng `artifact_packager.py --report` trước trên đúng thư mục daily report run.

## Quy trình

### Bước 1 — Thu thập nội dung
Xác định `Report date` trước. Nếu user không nói ngày cụ thể, dùng ngày hiện tại theo timezone user/project.

Chỉ dùng activity thuộc đúng `Report date` cho daily report. Nếu đọc từ artifact folder, chỉ đọc:

```text
artifacts/REPORT_DATE/*/
```

Không đưa activity của ngày khác vào daily report, trừ khi user nói rõ muốn report tuần hoặc muốn include ngày cụ thể khác.

Nếu đọc từ artifact folder, chỉ dùng dữ liệu từ `artifact_index.py` của đúng `Report date`; mọi run ở ngày khác phải ghi riêng là bị loại.

Hỏi user (nếu chưa cung cấp đủ): trong đúng ngày report đã làm những task/feature nào, có phát hiện bug gì không, có gì đang bị block/cần hỗ trợ không.

Nếu user chỉ liệt kê ngắn gọn, không cần hỏi dồn dập — có thể tổng hợp trước với thông tin hiện có rồi hỏi bổ sung 1 lần nếu thấy thiếu mục quan trọng (VD: user không nhắc gì tới việc có bị block hay không).

### Bước 2 — Phân loại nội dung theo nhóm

- **Đã hoàn thành**: task/feature đã test xong, bug đã report
- **Đang thực hiện**: task đang làm dở, tiến độ bao nhiêu %
- **Phát hiện vấn đề**: bug/blocker tìm được, mức độ ảnh hưởng
- **Cần hỗ trợ/đang chờ**: đang chờ dev fix, chờ thông tin từ ai, hoặc bị block bởi gì
- **Số liệu test**: số test case đã chạy/pass/fail/blocked nếu user có cung cấp
- **Rủi ro và kế hoạch tiếp theo**: risk còn lại, owner, ETA, next action

### Bước 3 — Xuất report theo format ngắn gọn, dễ đọc (không dài dòng)

```
## Báo cáo [ngày/tuần]

**Session timestamp:** [YYYY-MM-DD HH:mm:ss Z]
**Report date:** [YYYY-MM-DD]

**Đã hoàn thành:**
- [task/feature] — [kết quả ngắn gọn]

**Đang thực hiện:**
- [task] — [tiến độ]

**Vấn đề phát hiện:**
- [bug/issue] — [mức độ, đã report chưa]

**Cần hỗ trợ:**
- [nội dung cần hỗ trợ/đang chờ]

**Số liệu test:**
- [executed/pass/fail/blocked nếu có]

**Rủi ro / kế hoạch tiếp theo:**
- [risk, owner, ETA, next action]
```

## Nguyên tắc viết
- Ngắn gọn, mỗi dòng 1 ý, không viết văn dài dòng — lead cần đọc nhanh, không cần kể chuyện
- Không tự thêm task mà user không nhắc tới
- Không trộn activity khác ngày vào daily report. Nếu thấy activity khác ngày, ghi riêng là "Không đưa vào report vì khác ngày".
- Nếu một mục không có gì (VD: không có gì cần hỗ trợ), bỏ qua mục đó thay vì viết "Không có" cho tất cả các mục rỗng
