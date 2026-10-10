---
name: exploratory-charter-builder
description: "Tạo exploratory testing charter cho một phiên test tự do có định hướng. Dùng khi tester cần khám phá feature mới, nghiệp vụ chưa rõ hoặc khu vực có nhiều rủi ro bằng session-based testing với mục tiêu, phạm vi, thời lượng, dữ liệu, ý tưởng test và evidence cần thu thập."
---

# Exploratory Charter Builder

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file charter, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/exploratory-charter-builder/HHmmss-feature-or-area/
```

Mỗi artifact phải ghi `Session timestamp`, feature/area, charter, notes và bug/question phát hiện.

## Mục tiêu
Biến việc "mò feature" thành một phiên exploratory testing có mục tiêu, phạm vi và timebox rõ ràng.

## Quy trình

### Bước 1 - Xác định charter
Làm rõ:

- Feature hoặc khu vực cần khám phá.
- Lý do test: feature mới, bug nhiều, requirement mơ hồ, regression risk.
- Role/account, dữ liệu test, môi trường.
- Timebox: thường 30, 45 hoặc 60 phút.

### Bước 2 - Tạo hướng khám phá
Đề xuất các hướng:

- Luồng chính và biến thể.
- Role/permission.
- Data state khác nhau.
- Error/empty/loading state.
- Boundary và thao tác bất thường.
- Tương tác với feature liên quan.
- Evidence cần chụp: screenshot, console, network, note.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

# Exploratory Charter: [Feature/Area]

Mission:
[Mục tiêu phiên test]

Scope:
- In scope: [...]
- Out of scope: [...]

Timebox: [30/45/60 phút]

Test ideas:
- [...]

Data/accounts:
- [...]

Evidence to collect:
- [...]

Debrief questions:
- Bug nào tìm được?
- Câu hỏi nghiệp vụ nào cần hỏi?
- Khu vực nào cần test sâu hơn?
```

## Lưu ý
- Không thay thế test case chính thức. Charter dùng để khám phá và phát hiện rủi ro sớm.
- Nếu user chỉ có mô tả ngắn, vẫn tạo charter nhưng ghi rõ assumption.
