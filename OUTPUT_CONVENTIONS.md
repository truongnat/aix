# 📋 Tiêu chuẩn Báo cáo & Đầu ra — Dành cho Agent và Con người

> **Ngày:** 2026-04-23
> **Tác giả:** truongdq1
> **Phiên bản:** 1.0
> **Trạng thái:** Hoàn tất

---

## 🎯 Mục đích

Chuẩn hóa cách trình bày đầu ra cho:

* Gỡ lỗi / Phân tích nguyên nhân gốc (RCA)
* Rà soát mã nguồn
* Kiểm tra bảo mật
* Phân tích hiệu năng
* Báo cáo sự cố
* Quy trình AI

Yêu cầu:

* Định dạng thống nhất
* Dễ đọc, dễ quét nhanh
* Luôn dẫn tới hành động cụ thể
* Áp dụng cho cả con người và hệ thống tự động

---

# 🚨 1. Phân loại mức độ

| Mức độ        | Ký hiệu | Ý nghĩa                        |
| ------------- | ------- | ------------------------------ |
| Nghiêm trọng  | 🔴      | Chặn hệ thống, phải xử lý ngay |
| Quan trọng    | 🟡      | Ảnh hưởng lớn, cần ưu tiên     |
| Trung bình    | 🟠      | Có vấn đề, nên cải thiện       |
| Nhỏ           | 🟢      | Không bắt buộc                 |
| Tốt           | ✅       | Đúng chuẩn                     |
| Đang xử lý    | 🔵      | Đang thực hiện                 |
| Không áp dụng | ⚪       | Ngoài phạm vi                  |

---

# 📦 2. Khối thông tin

```markdown
> [!NOTE]
> Thông tin bổ sung

> [!TIP]
> Thực hành tốt / tối ưu

> [!WARNING]
> Cảnh báo rủi ro

> [!CAUTION]
> Nguy cơ nghiêm trọng
```

---

# 🧾 3. Tiêu đề báo cáo

```markdown
# {{Loại báo cáo}} — {{Đối tượng}}

> **Ngày:** {{ISO date}}  
> **Tác giả:** {{name}}  
> **Phiên bản:** {{version}}  
> **Trạng thái:** Nháp | Hoàn tất | Thay thế  
> **Độ tin cậy:** Cao | Trung bình | Thấp
```

---

# 🌍 4. Ngữ cảnh

```markdown
## Ngữ cảnh

- Hệ thống:
- Phạm vi:
- Môi trường:
- Giả định:
- Ràng buộc:
```

---

# ❗ 5. Vấn đề

```markdown
## Vấn đề

- Kỳ vọng:
- Thực tế:
- Ảnh hưởng:
```

---

# 🧠 6. Phân tích

```markdown
## Phân tích

- Quan sát:
- Giả thuyết:
- Xác minh:
- Nguyên nhân gốc:
```

---

# 🧪 7. Cách tái hiện

```markdown
## Cách tái hiện

1. Bước 1
2. Bước 2
3. Kết quả mong đợi
4. Kết quả thực tế
```

---

# ⚠️ 8. Phát hiện

```markdown
## Phát hiện

| Vấn đề | Mức độ | Mô tả | Ảnh hưởng |
|-------|--------|------|----------|
| Ví dụ | 🔴 | Mô tả | Ảnh hưởng |
```

---

# 🧨 9. Vấn đề ưu tiên

```markdown
## Vấn đề ưu tiên

1. 🔴 Vấn đề A  
2. 🔴 Vấn đề B  
3. 🟡 Vấn đề C  
```

---

# ⚖️ 10. Quyết định

```markdown
## Quyết định

| Quyết định | Người phụ trách | Thời hạn | Trạng thái |
|-----------|----------------|----------|------------|
| Sửa lỗi A | Backend | 2026-04-25 | 🔵 |
```

> [!CAUTION]
> Bắt buộc có phần này.

---

# 🛠 11. Đề xuất

**Hiện tại:**

```typescript
// mã hiện tại
```

**Đề xuất:**

```typescript
// mã đã chỉnh sửa
```

---

# 📊 12. Tiến độ

```markdown
## Tiến độ

| Bước | Trạng thái | Ghi chú |
|------|------------|--------|
| Tái hiện | ✅ | |
| Phân tích | 🔵 | |
| Sửa lỗi | ⚪ | |
```

---

# 💥 13. Ảnh hưởng

```markdown
## Ảnh hưởng

- Người dùng bị ảnh hưởng:
- Hệ thống:
- Mức độ rủi ro:
```

---

# 🧭 14. Đánh đổi

```markdown
## Đánh đổi

- Giải pháp nhanh vs lâu dài  
- Hiệu năng vs chi phí  
- Đơn giản vs mở rộng  
```

---

# 🧾 15. Quy tắc khối mã

```typescript
const example = true;
```

```bash
npm run start
```

---

# 🤖 16. Theo dõi token

```text
[Tokens: I:{{input}} | O:{{output}} | T:{{total}}]
```

---

```markdown
| Chỉ số | Giá trị | Ghi chú |
|--------|--------|--------|
| Token đầu vào | | |
| Token đầu ra | | |
| Tổng token | | |
| Tổng số bước | | |
```

---

# 🧩 17. Phạm vi áp dụng

* Rà soát mã nguồn
* Gỡ lỗi / RCA
* Bảo mật
* Hiệu năng
* Sự cố
* Quy trình AI

---

# 🏁 Nguyên tắc

1. Rõ ràng, không mơ hồ
2. Luôn có nguyên nhân gốc
3. Mọi vấn đề phải dẫn tới hành động
4. Ưu tiên theo mức độ ảnh hưởng
5. Giữ định dạng thống nhất

---

