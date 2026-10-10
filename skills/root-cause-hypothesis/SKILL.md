---
name: root-cause-hypothesis
description: "Tạo giả thuyết nguyên nhân gốc cho bug thỉnh thoảng xảy ra hoặc khó tái hiện. Dùng khi tester cần thu hẹp nguyên nhân trước khi báo dev bằng cách phân tích môi trường, dữ liệu, thời điểm, role, thao tác, network, browser, API, log và pattern tái hiện."
---

# Root Cause Hypothesis

## Quy ước timestamp và artifact
Ngay khi bắt đầu chạy Skill, lấy timestamp hiện tại theo timezone của user/project, format `YYYY-MM-DD HH:mm:ss Z`.

Nếu có tạo file phân tích, lưu theo cấu trúc:

```text
artifacts/YYYY-MM-DD/root-cause-hypothesis/HHmmss-short-issue/
```

Mỗi artifact phải ghi `Session timestamp`, symptom, evidence, giả thuyết, câu hỏi cần kiểm chứng và next action.

## Mục tiêu
Giúp tester giảm tình trạng bug bị trả về vì "không tái hiện được" bằng cách đặt câu hỏi có hệ thống trước khi gửi dev.

## Quy trình

### Bước 1 - Gom thông tin
Xác định:

- Hiện tượng lỗi và tần suất.
- Môi trường, build, browser/device, account/role.
- Dữ liệu test, trạng thái dữ liệu, thời điểm xảy ra.
- Step chính xác trước khi lỗi xảy ra.
- Console/network/log/screenshot/video nếu có.

### Bước 2 - Phân loại giả thuyết
Xem xét các nhóm:

- Data-specific: chỉ xảy ra với dữ liệu hoặc trạng thái nhất định.
- Environment-specific: chỉ xảy ra trên browser/device/build/môi trường nhất định.
- Timing/concurrency: double click, reload, timeout, race condition, xử lý chậm.
- Permission/session: token hết hạn, role thay đổi, session conflict.
- Integration: API lỗi, service phụ chậm, queue/job chưa xử lý xong.
- UI state: cache, stale state, loading chưa xong, component không refresh.

### Bước 3 - Đề xuất kiểm chứng
Mỗi giả thuyết phải có cách kiểm chứng cụ thể, không chỉ nêu phỏng đoán.

## Format output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Symptom: [mô tả lỗi]

| Giả thuyết | Dấu hiệu ủng hộ | Dấu hiệu phản bác | Cách kiểm chứng | Priority |
|---|---|---|---|---|

Next actions:
1. [...]
2. [...]
3. [...]

Thông tin cần bổ sung trước khi gửi dev:
- [...]
```

## Lưu ý
- Không khẳng định root cause nếu chưa có evidence đủ mạnh.
- Kết quả nên dùng làm input cho `bug-report-writer` hoặc `browser-investigator`.
