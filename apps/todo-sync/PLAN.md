# Plan: Todo List Sync Real-time

Bản kế hoạch triển khai chia nhỏ tác vụ cho tính năng Todo List Sync Real-time.

## 1. Goal & Scope
* **In-Scope**: Setup WebSocket server cơ bản, Client kết nối và tự động render danh sách, đồng bộ các hành động `ADD_TODO` và `DELETE_TODO`.
* **Non-Goals**: Phân quyền user, lưu trữ database vĩnh viễn (chỉ lưu in-memory cho demo).

## 2. Danh sách Task thực thi
1. **Task 1: Khởi tạo WebSocket Server**
   - *Mô tả*: Viết server Node.js quản lý kết nối và broadcast sự kiện.
   - *Acceptance Criteria*: Chạy server local, Client kết nối thành công.
   - *Files*: `src/server.js`
2. **Task 2: Viết Client UI & Kết nối**
   - *Mô tả*: HTML/JS cơ bản kết nối WebSocket và gửi/nhận sự kiện.
   - *Acceptance Criteria*: Giao diện thêm Todo hoạt động local.
   - *Files*: `src/client.html`, `src/client.js`
3. **Task 3: Triển khai giao thức đồng bộ**
   - *Mô tả*: Broadcast sự kiện `ADD` và `DELETE` tới tất cả các client đang kết nối khác.
   - *Acceptance Criteria*: Hai trình duyệt mở song song tự đồng bộ khi có thay đổi.
   - *Files*: `src/server.js`, `src/client.js`

## 3. Kịch bản xác minh (Verification Strategy)
* Chạy unit test giả lập 2 client kết nối đồng thời và kiểm tra dữ liệu nhận được.
* Thư mục kiểm thử: `test/sync.test.js`

## 4. Phương án khôi phục (Rollback Strategy)
* Hủy bỏ thay đổi bằng `git checkout` hoặc phục hồi phiên từ checkpoint của bước trước.
