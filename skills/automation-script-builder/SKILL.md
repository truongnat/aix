---
name: automation-script-builder
description: Chuyển kịch bản test thủ công lặp lại thành script automation (Playwright/Selenium), kèm giải thích từng dòng cho người mới học automation. Dùng khi user muốn tự động hóa một luồng test hay lặp lại (regression), hoặc muốn học automation qua ví dụ thực tế thay vì học lý thuyết trước.
---

# Automation Script Builder

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file script, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/automation-script-builder/HHmmss-flow-slug/
```

Mỗi artifact phải ghi `Session timestamp`, test case nguồn, script, cách chạy, dependencies, và những phần cần user/dev xác nhận. Mọi output chính trong chat cũng phải hiển thị `Session timestamp`.

## Mục tiêu
Biến một kịch bản test case đã có (dạng steps thủ công) thành script automation chạy được, đồng thời giải thích để user (đang học automation) hiểu được TẠI SAO viết như vậy, không chỉ đưa code.

## Quy trình

### Bước 1 — Nhận input
Input có thể là: một test case cụ thể (từ testcase-generator), hoặc user mô tả luồng thao tác bằng lời.

Nếu thiếu thông tin kỹ thuật cần thiết, hỏi lại:
- Trang web dùng framework gì không quan trọng, nhưng cần biết: các selector có ổn định không (id, data-testid) hay phải dùng text/class dễ đổi
- Ưu tiên dùng Playwright hay Selenium (nếu user chưa có kinh nghiệm, mặc định đề xuất Playwright vì cú pháp hiện đại, dễ học hơn)
- Ngôn ngữ: JavaScript/TypeScript hay Python (hỏi user quen ngôn ngữ nào hơn)
- Test data lấy từ đâu, có cần cleanup sau khi chạy không, và assertion quan trọng nhất là gì

### Bước 2 — Viết script theo cấu trúc rõ ràng

Luôn tách theo 3 phần chuẩn: Setup (mở trang, điều kiện đầu vào) → Action (các bước thao tác chính) → Assertion (kiểm tra kết quả mong đợi).

### Bước 3 — Giải thích SONG SONG với code, không phải sau code

Với mỗi khối lệnh, thêm comment giải thích ngắn gọn NGAY TRÊN dòng đó bằng tiếng Việt, giải thích ý nghĩa chứ không dịch từng từ khóa. Ví dụ:

```javascript
// Chờ trang load xong và element login xuất hiện, tránh lỗi vì thao tác quá nhanh
await page.waitForSelector('#login-button');

// Click vào nút login
await page.click('#login-button');

// Kiểm tra: sau khi login, phải chuyển hướng sang trang chủ
await expect(page).toHaveURL('/home');
```

### Bước 4 — Đưa ra file hoàn chỉnh + tóm tắt

Sau đoạn code, tóm tắt ngắn gọn 2-3 câu: script này làm gì, chạy bằng lệnh gì, cần cài gì trước khi chạy (npm install, cấu hình gì), và `Session timestamp`.

## Nguyên tắc cho người mới học automation
- Ưu tiên selector ổn định theo thứ tự: `data-testid`/test id, accessible role/name, label text; tránh CSS class động, XPath dài, hoặc text dễ đổi nếu có lựa chọn tốt hơn
- Dùng web-first assertion và wait theo trạng thái UI cụ thể; không dùng sleep cố định trừ khi giải thích rõ đây là workaround tạm thời
- Mỗi script phải có assertion kiểm tra kết quả thật, không chỉ click qua các bước
- Nếu script tạo dữ liệu, phải có setup/cleanup hoặc ghi rõ dữ liệu cần chuẩn bị trước
- Ghi chú rủi ro flaky nếu flow phụ thuộc network chậm, animation, email/SMS OTP, captcha, hoặc dữ liệu dùng chung
- Không dùng thuật ngữ không giải thích (VD: nếu dùng "fixture", "hook" phải giải thích ngắn gọn nghĩa là gì trong ngữ cảnh này)
- Ưu tiên code đơn giản, dễ đọc hơn là code tối ưu/ngắn gọn nhưng khó hiểu
- Nếu có cách viết "hay" nhưng khó hiểu với người mới, chọn cách dễ hiểu trước, có thể ghi chú "cách viết ngắn gọn hơn" ở cuối như một lựa chọn nâng cao
- Khi user hỏi lại "tại sao lại viết như vậy", luôn giải thích được lý do, không chỉ nói "đây là cách chuẩn"

## Giới hạn
Claude không tự chạy được script trên máy user (trừ khi có MCP/Computer Use phù hợp) — Skill này tập trung vào việc VIẾT và GIẢI THÍCH script, việc chạy thử là do user thực hiện trên môi trường của họ, trừ khi đã xác nhận có kết nối chạy được.
