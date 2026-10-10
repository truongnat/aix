---
name: i18n-checklist-runner
description: "Chạy checklist internationalization/localization cho sản phẩm đa ngôn ngữ. Dùng khi tester cần kiểm tra bản dịch, độ dài chuỗi, format ngày giờ, tiền tệ, số, timezone, ký tự đặc biệt, Unicode, pluralization, sorting và layout vỡ khi đổi locale."
---

# I18n Checklist Runner

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file checklist, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/i18n-checklist-runner/HHmmss-locale-or-feature/
```

Mỗi artifact phải ghi `Session timestamp`, locale, feature, checklist đã chạy, issue và evidence.

## Mục tiêu
Giúp tester kiểm tra các lỗi đa ngôn ngữ và locale thường bị bỏ sót.

## Checklist chính

- Translation: thiếu bản dịch, text vẫn còn hard-code, key hiển thị ra UI.
- Text length: chuỗi dài làm vỡ layout, button/input/table bị cắt chữ.
- Date/time: format theo locale, timezone, 12h/24h, đầu tuần, DST nếu liên quan.
- Number/currency: dấu thập phân, dấu nghìn, tiền tệ, rounding, negative number.
- Unicode: tiếng Việt có dấu, emoji, ký tự Nhật/Hàn/Trung, RTL nếu sản phẩm hỗ trợ.
- Pluralization: số ít/số nhiều, zero/one/many.
- Sorting/search: sắp xếp và tìm kiếm với ký tự có dấu.
- Input validation: tên, địa chỉ, số điện thoại, mã bưu chính theo locale.
- Export/import: CSV/PDF/email giữ đúng encoding và format.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Locale: [vi-VN/en-US/...]
Feature: [màn hình/luồng]

| Nhóm | Check | Kết quả | Issue | Severity | Evidence |
|---|---|---|---|---|---|

Cần xác nhận:
- Locale nào nằm trong scope?
- Format ngày/tiền tệ theo chuẩn nào?
- Có hỗ trợ RTL không?
```

## Lưu ý
- Không tự áp chuẩn locale nếu sản phẩm có guideline riêng. Hỏi lại hoặc ghi assumption.
- Với tiếng Việt, luôn kiểm tra dữ liệu có dấu và chuỗi dài hơn tiếng Anh.
