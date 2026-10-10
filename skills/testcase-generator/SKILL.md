---
name: testcase-generator
description: Sinh test case đầy đủ (functional, negative, boundary, security, concurrency...) từ spec/mô tả feature. Dùng khi user được assign feature mới và cần viết test case, hoặc khi user muốn rà soát bộ test case cũ xem có thiếu case nào không. Output mặc định là bảng Markdown, có tùy chọn xuất thêm file CSV để import Excel/Google Sheet.
---

# Testcase Generator

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file test case, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/testcase-generator/HHmmss-feature-slug/
```

Artifact thường gồm `testcases.md`, `testcases.csv` nếu user yêu cầu, và ghi rõ `Session timestamp`, feature, nguồn requirement, giả định, cùng các nhóm case bị skip. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Mục tiêu
Sinh bộ test case đầy đủ, không bỏ sót case quan trọng, dựa trên spec/mô tả feature do user cung cấp — kể cả khi spec đó chưa đầy đủ hoặc mô tả sơ sài.

## Script hỗ trợ
Khi input đến từ file hoặc URL, ưu tiên chạy support script ở chế độ `--report` trước:

- `safe_download.py` cho file spec ở URL
- `read_excel.py` cho `.csv` hoặc `.xlsx`
- `read_pdf.py` cho `.pdf`
- `markdown_table_to_csv.py` nếu cần đổi bảng Markdown đã tạo sang CSV
- `redact_sensitive.py` nếu file chứa dữ liệu thật hoặc log nhạy cảm

## Bước 1 — Kiểm tra context trước khi generate

Nếu input là `.csv` hoặc `.xlsx`, chạy `read_excel.py --report` trước để biết:
- sheet nào có dữ liệu
- header là gì
- sample rows

Nếu input là `.pdf`, chạy `read_pdf.py --report` trước để biết có trích text được không, số trang bao nhiêu và có cần hỏi user thêm format nguồn khác không.

Nếu input là URL, chạy `safe_download.py --report` trước rồi mới quyết định có tải file về hay không.

TRƯỚC KHI sinh test case, kiểm tra xem đã có đủ các thông tin sau chưa:
- Mục đích/luồng chính của feature (user làm gì, hệ thống phản hồi gì)
- Các field/input liên quan (nếu có form, API param...)
- Các role/quyền liên quan (feature này ai được dùng, ai không)
- Có ràng buộc nghiệp vụ đặc biệt nào không (giới hạn số lượng, thời gian, trạng thái...)

Nếu THIẾU bất kỳ mục nào, hỏi lại user bằng câu hỏi cụ thể, ngắn gọn — KHÔNG hỏi chung chung kiểu "bạn cho tôi thêm thông tin". Ưu tiên tối đa 3 câu hỏi có impact cao nhất trước. Ví dụ hỏi đúng: "Feature này có phân quyền theo role không, hay ai đăng nhập cũng dùng được?"

Chỉ tiếp tục Bước 2 khi đã đủ thông tin tối thiểu để generate có ý nghĩa. Nếu user nói "cứ generate với thông tin hiện có", tiếp tục nhưng đánh dấu rõ trong cột Notes những case bị giới hạn do thiếu thông tin.

## Bước 2 — Generate test case theo 4 nhóm tiêu chí

Với MỌI feature, phải rà qua đủ 4 nhóm sau. Chỉ generate case cho nhóm phù hợp với feature; nếu nhóm không áp dụng, ghi rõ lý do skip trong phần Notes hoặc tóm tắt.

### Nhóm A — Input-based
- Equivalence Partitioning: nhóm giá trị hợp lệ / không hợp lệ cho mỗi field
- Boundary Value Analysis: giá trị biên (min, max, min-1, max+1, rỗng, null, quá dài)
- Format/Type validation: sai định dạng, sai kiểu dữ liệu

### Nhóm B — Business logic
- Decision Table: khi có nhiều điều kiện kết hợp (VD: role + trạng thái → hành động)
- State Transition: nếu object có nhiều trạng thái, test cả chuyển hợp lệ và không hợp lệ
- Nếu feature không có nhiều điều kiện hoặc trạng thái, ghi "Không áp dụng" thay vì bịa state/condition.

### Nhóm C — System-level (nhóm hay bị bỏ sót nhất — ưu tiên rà kỹ)
- Permission/Role: test với từng role khác nhau
- Concurrency: nhiều user/thao tác cùng lúc
- Data persistence: reload, đóng mở lại, mất kết nối giữa chừng
- Negative/Error handling: mất mạng, timeout, input độc hại cơ bản (XSS, injection)
- Cross-browser/device nếu là web/app
- Chỉ tạo concurrency/security/cross-browser case khi có rủi ro hợp lý hoặc feature có bề mặt liên quan. Nếu không, ghi lý do skip.

### Nhóm D — Priority & Type
Mỗi case phải gắn:
- Type: Positive / Negative / Boundary / Security / Concurrency
- Priority: P0 (bắt buộc chạy) / P1 (nên chạy) / P2 (chạy nếu có thời gian)

## Bước 3 — Format output

Cột chuẩn, áp dụng cho cả Markdown và CSV:

```
ID | Feature | Title | Type | Priority | Preconditions | Steps | Test Data | Expected Result | Notes
```

Quy tắc đặt ID: `TC_<TÊN_FEATURE_VIẾT_TẮT>_<SỐ_THỨ_TỰ>` (VD: TC_LOGIN_001)

Steps: đánh số rõ ràng từng bước (1. 2. 3.), không gộp nhiều hành động vào 1 dòng.

Notes: dùng để đánh dấu case nào là do Claude tự suy luận thêm ngoài spec gốc (không có trong spec user cung cấp) — để user biết cần confirm lại với PM/dev trước khi đưa vào bộ chính thức.

Trước bảng test case, thêm dòng:

```
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Applicable groups: [A/B/C/D + nhóm nào skip và lý do]
```

### Output mặc định: bảng Markdown
Hiển thị trực tiếp trong chat để user xem và chỉnh sửa nhanh.

### Sau khi xuất bảng Markdown, LUÔN hỏi:
"Bạn có muốn xuất thêm file CSV để import vào Excel/Google Sheet không?"

Nếu user đồng ý, tạo file .csv với đúng các cột trên, dùng dấu phẩy làm delimiter, escape đúng chuẩn CSV cho các ô có dấu phẩy/xuống dòng (đặc biệt cột Steps hay có nhiều dòng).

Nếu đã có bảng Markdown hoàn chỉnh trước đó, có thể dùng `markdown_table_to_csv.py --report` trước để kiểm tra số cột/số dòng rồi mới chạy `--execute`.

## Ví dụ mẫu

Xem file `example_output.md` đi kèm để tham khảo format hoàn chỉnh với feature "Đăng nhập bằng email/password".
