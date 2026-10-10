---
name: bug-report-writer
description: Cấu trúc hóa mô tả bug lộn xộn/thiếu thông tin của user thành bug report chuẩn, đầy đủ, sẵn sàng gửi cho dev. Dùng khi user vừa phát hiện bug và cần viết report, dù mô tả ban đầu có ngắn gọn hay thiếu chi tiết đến đâu.
---

# Bug Report Writer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file bug report, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/bug-report-writer/HHmmss-short-bug-title/
```

Mỗi artifact phải ghi `Session timestamp`, nguồn input, report cuối cùng, và danh sách thông tin còn thiếu nếu có. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Nguyên tắc cốt lõi
User có thể mô tả bug rất lộn xộn hoặc thiếu — nhiệm vụ của Skill này là CHỦ ĐỘNG hỏi lại đúng chỗ thiếu theo checklist cố định, không phải viết report thiếu dựa trên những gì user vô tình cung cấp.

## Script hỗ trợ
Nếu input có file log, evidence text hoặc URL, ưu tiên chạy support script ở chế độ `--report` trước:

- `safe_download.py` cho log/spec/evidence ở URL
- `evidence_manifest.py` để chuẩn hóa danh sách file đính kèm, log, HAR, screenshot
- `session_timeline_builder.py` để dựng timeline evidence trong artifact run
- `artifact_packager.py` để nén toàn bộ bug artifact trước khi gửi
- `redact_sensitive.py` trước khi lưu hoặc trích lại log có token, email, phone, secret
- `artifact_init.py` nếu cần tạo artifact folder chuẩn cho bug report

## Checklist thông tin

### Bắt buộc để report có giá trị
1. **Môi trường**: web hay app, version/build nào, browser/device nào, OS nào (nếu liên quan)
2. **Steps to reproduce**: các bước cụ thể, đánh số rõ ràng, không gộp nhiều hành động vào 1 bước
3. **Expected result**: kết quả đúng ra phải như thế nào
4. **Actual result**: kết quả thực tế xảy ra là gì
5. **Tần suất**: luôn xảy ra hay thỉnh thoảng (nếu thỉnh thoảng, có pattern gì không)

### Nên có nhưng không luôn bắt buộc
6. **Mức độ nghiêm trọng** (Severity): block luồng chính hay chỉ ảnh hưởng nhỏ, thẩm mỹ. Nếu user chưa biết, đề xuất severity dựa trên impact và ghi là "đề xuất".
7. **Ảnh/video/log đính kèm**: có không, nếu có nội dung liên quan gì cần nhắc tới trong report. Nếu chưa có, ghi rõ "chưa có đính kèm".

## Quy trình

### Bước 1 — Đọc mô tả ban đầu của user
Dù dài hay ngắn, lộn xộn hay rõ ràng, đối chiếu ngay với 7 mục checklist ở trên.

### Bước 2 — Hỏi lại CHỈ những mục còn thiếu, theo từng câu cụ thể
Không hỏi gộp "bạn cho tôi thêm thông tin nhé". Hỏi thẳng, ví dụ:
- "Bug này xảy ra trên web hay app? Version bao nhiêu?"
- "Bạn có làm lại được ngay bây giờ không, hay chỉ gặp 1 lần?"
- "Trước khi bấm nút Save, bạn đã làm những bước gì? Kể theo thứ tự nhé."

Ưu tiên hỏi tối đa 3 câu quan trọng nhất trước. Nếu vẫn thiếu thông tin bắt buộc sau khi user trả lời, hỏi tiếp. Không chặn report chỉ vì thiếu thông tin "nên có" như attachment hoặc severity chính thức.

Ngoại lệ: nếu user nói rõ "cứ viết report với thông tin hiện có, tôi sẽ bổ sung sau", được phép xuất report với các mục còn thiếu ghi rõ "[Cần bổ sung: ...]" thay vì bịa hoặc bỏ trống.

### Bước 3 — Xuất report theo template chuẩn

```
## [Tiêu đề bug — mô tả ngắn gọn 1 dòng, nêu rõ hiện tượng]

**Môi trường:** [web/app, version, browser/device, OS]
**Session timestamp:** [YYYY-MM-DD HH:mm:ss Z]
**Mức độ nghiêm trọng:** [Critical/High/Medium/Low]
**Tần suất:** [Luôn xảy ra / Thỉnh thoảng — pattern nếu có]

**Các bước tái hiện:**
1. ...
2. ...
3. ...

**Kết quả mong đợi:**
[mô tả]

**Kết quả thực tế:**
[mô tả]

**Đính kèm:** [ảnh/video/log nếu có]

**Ghi chú thêm:** [nếu có thông tin liên quan khác, VD: chỉ xảy ra với tài khoản role admin]
```

## Xử lý khi có input từ browser-investigator
Nếu user đã chạy qua Skill `browser-investigator` trước đó và có sẵn thông tin console/network, tự động đưa phần đó vào mục "Ghi chú thêm" hoặc "Đính kèm" của report, không yêu cầu user gõ lại.

Nếu user gửi nhiều file đính kèm, chạy `evidence_manifest.py --report` trước để liệt kê file, MIME type và điểm nào có thể chứa dữ liệu nhạy cảm.

Nếu bug report cần gửi kèm nguyên bộ artifact, chạy `session_timeline_builder.py --report` để kiểm tra đủ evidence và `artifact_packager.py --report` trước khi nén gửi dev/lead.

Nếu console/network log chứa dữ liệu nhạy cảm, chạy `redact_sensitive.py --report` trước khi đưa log vào artifact hoặc trích vào report.
