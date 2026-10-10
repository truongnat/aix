---
name: accessibility-checklist-runner
description: "Chạy checklist accessibility cơ bản cho web/app UI. Dùng khi tester cần kiểm tra a11y thủ công về keyboard navigation, focus state, contrast, alt text, label form, heading, screen reader text, error message và trạng thái disabled/loading mà không cần chuyên sâu WCAG."
---

# Accessibility Checklist Runner

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file checklist, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/accessibility-checklist-runner/HHmmss-page-or-flow/
```

Mỗi artifact phải ghi `Session timestamp`, page/flow, checklist đã chạy, issue và evidence.

## Mục tiêu
Giúp tester manual bắt đầu kiểm tra accessibility bằng checklist thực tế, không cần trở thành chuyên gia WCAG.

## Checklist chính

- Keyboard: tab order hợp lý, thao tác được bằng bàn phím, không bị kẹt focus.
- Focus: trạng thái focus nhìn thấy rõ trên button, link, input, menu, modal.
- Form: input có label, required/error message rõ, lỗi gắn đúng field.
- Contrast: text và button đủ tương phản, không chỉ dùng màu để truyền thông tin.
- Image/icon: ảnh có alt text phù hợp, icon-only button có accessible name.
- Heading/structure: heading có thứ tự hợp lý, modal có title, dialog focus đúng.
- Screen reader basics: nội dung động, toast, validation và loading có thông báo phù hợp nếu kiểm tra được.
- State: disabled/loading/empty/error state vẫn hiểu được và thao tác hợp lý.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Page/flow: [tên màn hình hoặc luồng]

| Nhóm | Check | Kết quả | Issue | Severity | Evidence |
|---|---|---|---|---|---|

Tóm tắt:
- Blocker/High: [...]
- Medium/Low: [...]
- Cần dev/design xác nhận: [...]
```

## Lưu ý
- Nếu không có tool đo contrast/screen reader, ghi rõ là kiểm tra thủ công.
- Không khẳng định đạt chuẩn WCAG đầy đủ nếu chỉ chạy checklist cơ bản.
