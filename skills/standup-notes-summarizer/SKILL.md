---
name: standup-notes-summarizer
description: "Tóm tắt nhanh nội dung standup cho tester theo dạng nói miệng: hôm qua làm gì, hôm nay làm gì, blocker là gì. Dùng khi user cần bản cực ngắn khác với daily-report-writer, phù hợp để nói trong daily standup hoặc gửi chat nhanh."
---

# Standup Notes Summarizer

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file note, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/standup-notes-summarizer/HHmmss-standup/
```

Mỗi artifact phải ghi `Session timestamp`, report date và note cuối cùng.

## Mục tiêu
Tạo bản standup cực ngắn, dễ nói trong 30-60 giây. Không thay thế `daily-report-writer` vì daily report là bản đầy đủ hơn để gửi lead.

## Quy trình

1. Xác định ngày standup. Nếu user không nói, dùng ngày hiện tại.
2. Chỉ dùng activity liên quan tới hôm qua/hôm nay/blocker theo yêu cầu standup.
3. Rút gọn thành câu nói tự nhiên, không viết dài.
4. Nếu thiếu blocker, không tự thêm. Có thể ghi "hiện chưa có blocker" nếu user xác nhận.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Hôm qua:
- [...]

Hôm nay:
- [...]

Blocker:
- [...]

Bản nói nhanh:
"Hôm qua tôi..., hôm nay tôi..., hiện blocker là..."
```

## Lưu ý
- Không đưa số liệu chi tiết nếu không cần nói trong standup.
- Nếu user cần báo cáo đầy đủ, chuyển sang `daily-report-writer`.
