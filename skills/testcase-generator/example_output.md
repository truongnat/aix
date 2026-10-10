# Ví dụ output mẫu — Feature: Đăng nhập bằng email/password

| ID | Feature | Title | Type | Priority | Preconditions | Steps | Test Data | Expected Result | Notes |
|---|---|---|---|---|---|---|---|---|---|
| TC_LOGIN_001 | Login | Đăng nhập thành công với tài khoản hợp lệ | Positive | P0 | User đã có tài khoản active | 1. Mở trang login<br>2. Nhập email hợp lệ<br>3. Nhập password đúng<br>4. Bấm Login | email: valid@test.com, pass: đúng | Vào trang chủ, hiển thị tên user | |
| TC_LOGIN_002 | Login | Sai password | Negative | P0 | User đã có tài khoản | 1-3. Như trên<br>4. Nhập password sai 1 ký tự<br>5. Bấm Login | pass: sai | Hiện thông báo lỗi, không vào được | |
| TC_LOGIN_003 | Login | Password để trống | Boundary | P1 | — | Để trống password, bấm Login | pass: "" | Validation chặn phía client, không gọi API | |
| TC_LOGIN_004 | Login | Email đúng format nhưng không tồn tại | Negative | P1 | — | Nhập email lạ, password bất kỳ | email: notexist@test.com | Thông báo "tài khoản không tồn tại", không lộ thông tin nhạy cảm về việc email có tồn tại hay không | Cần confirm với dev về message chính xác |
| TC_LOGIN_005 | Login | Đăng nhập sai 5 lần liên tiếp | Security | P0 | — | Nhập sai password 5 lần liên tiếp | — | Tài khoản bị khóa tạm hoặc xuất hiện captcha | Case này suy luận thêm — cần confirm nghiệp vụ có áp dụng rule khóa tài khoản không |
| TC_LOGIN_006 | Login | 2 tab cùng đăng nhập 1 tài khoản | Concurrency | P2 | — | Mở 2 tab, login cùng tài khoản gần như đồng thời | — | Cả 2 session hoạt động hợp lý hoặc có cơ chế single-session rõ ràng | Case suy luận thêm |
| TC_LOGIN_007 | Login | Mất mạng ngay khi bấm Login | Negative | P1 | — | Tắt mạng ngay sau khi bấm Login | — | Hiện thông báo lỗi network rõ ràng, không treo UI | |

## Ghi chú cách đọc bảng này
- Cột **Notes** có ghi "case suy luận thêm" nghĩa là case đó không có trong spec gốc user cung cấp — Claude tự thêm vào dựa trên kinh nghiệm test thông thường. Cần confirm lại với PM/dev trước khi đưa vào bộ chính thức.
- Khi xuất CSV, các ô có nhiều dòng (như cột Steps) sẽ được escape đúng chuẩn để không vỡ format khi mở bằng Excel.
