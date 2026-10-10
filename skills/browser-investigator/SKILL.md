---
name: browser-investigator
description: Tự động điều tra lỗi trên web/app bằng cách đọc network request/response, console log, và DOM state, thay vì user phải tự mở DevTools inspect thủ công. Dùng khi user không có source code, chỉ test được qua giao diện web/app, và cần tìm nguyên nhân kỹ thuật của một hiện tượng lỗi.
---

# Browser Investigator

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file điều tra, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/browser-investigator/HHmmss-short-issue/
```

Mỗi artifact phải ghi `Session timestamp`, URL, bước tái hiện, dữ liệu console/network/DOM đã quan sát, và phần dữ liệu đã che nếu có thông tin nhạy cảm. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Điều kiện tiên quyết
Skill này cần một kết nối MCP tới trình duyệt (ví dụ Claude in Chrome) đã được thiết lập trong phiên làm việc. Nếu không có, báo cho user và đề xuất kết nối trước, không tự suy đoán network/console log nếu không thực sự đọc được.

## Quy trình

## Script hỗ trợ
Nếu cần lưu hoặc chuẩn hóa evidence file trước khi tổng hợp, ưu tiên chạy support script ở chế độ `--report` trước:

- `evidence_manifest.py` cho screenshot, log, HAR, JSON response hoặc file evidence đi kèm
- `har_summarizer.py` cho file `.har` để tóm method, URL, status, host và request chậm
- `session_timeline_builder.py` để gom timeline file evidence trong một run artifact
- `artifact_packager.py` để zip toàn bộ evidence trước khi gửi dev
- `redact_sensitive.py` nếu evidence text có token, email, phone hoặc secret

### Bước 1 — Xác nhận hiện tượng cần điều tra
Hỏi rõ (nếu chưa rõ): hiện tượng lỗi là gì, xảy ra ở bước nào, có tái hiện lại được ngay bây giờ không.

### Bước 2 — Tái hiện và quan sát
1. Điều hướng tới đúng bước gây lỗi qua trình duyệt
2. Trong lúc thao tác, quan sát và ghi lại:
   - Console log: có error/warning nào xuất hiện không, nội dung là gì
   - Network requests: method, URL/path, status code, request payload tóm tắt, response excerpt, request ID/correlation ID nếu có
   - DOM state: phần tử nào không hiển thị đúng, class/attribute có gì lạ so với kỳ vọng
   - Evidence: timestamp, URL hiện tại, screenshot/video/HAR/log nếu có thể lấy

### Bước 3 — Phân tích và kết luận
Không chỉ liệt kê dữ liệu thô — phải diễn giải ý nghĩa:
- Nếu network trả về lỗi 4xx/5xx: giải thích khả năng nguyên nhân (client gửi sai request, hay server xử lý lỗi)
- Nếu console có error: dịch nghĩa error đó thường liên quan tới vấn đề gì (không cần đúng 100% vì không có source, nhưng đưa ra giả thuyết hợp lý)
- Nếu DOM không đúng: mô tả cụ thể phần tử nào, khác gì so với trạng thái mong đợi

### Bước 4 — Xuất kết quả theo format

```
Hiện tượng: [mô tả ngắn]

Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Những gì quan sát được:
- Console: [log/error cụ thể, hoặc "không có gì bất thường"]
- Network: [method/path/status/request payload summary/response summary/request ID nếu có]
- DOM: [phần tử liên quan, trạng thái thực tế]

Evidence table:
| Thời điểm | URL | Step | Evidence | Ghi chú |
|---|---|---|---|---|

Giả thuyết nguyên nhân: [phân tích, đưa ra khả năng — không khẳng định chắc chắn nếu không có source]

Thông tin nên đính kèm khi báo dev: [request/response cụ thể, screenshot console nếu cần]
```

## Lưu ý
- Đây là công cụ hỗ trợ ĐIỀU TRA, không thay thế việc dev tự debug bằng source code. Kết quả đưa ra là giả thuyết dựa trên quan sát bên ngoài, cần nói rõ mức độ chắc chắn.
- Nếu phát hiện thông tin nhạy cảm trong network request/response (token, password, dữ liệu cá nhân), không hiển thị nguyên văn — che hoặc rút gọn phần nhạy cảm khi báo cáo lại.
- Nếu có nhiều file evidence, tạo manifest trước bằng `evidence_manifest.py --report` để biết file count, MIME type và dấu hiệu dữ liệu nhạy cảm trước khi đính kèm.
- Nếu có file HAR, chạy `har_summarizer.py --report` trước để rút gọn network thành phần có ý nghĩa thay vì đọc tay cả file.
- Trước khi bàn giao artifact cho dev, có thể chạy `session_timeline_builder.py --report` rồi `artifact_packager.py --report` để kiểm tra đủ evidence và thứ tự thời gian.
- Kết quả từ Skill này nên được chuyển tiếp trực tiếp làm input cho `bug-report-writer` nếu xác nhận đây là bug thật.
