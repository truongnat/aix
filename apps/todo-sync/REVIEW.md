# Review: Todo List Sync Real-time

Bản đánh giá chéo mã nguồn để kiểm tra các rủi ro tiềm ẩn.

## 1. Danh sách phát hiện lỗi (Findings List)
* **[Critical]**: Không có.
* **[Important]**: Thiếu kiểm tra định dạng dữ liệu (payload schema validation) trước khi broadcast. Nếu Client A gửi một JSON độc hại, nó sẽ làm hỏng UI của Client B.
  - *Giải pháp*: Đã bổ sung try/catch và kiểm tra trường `type` và `payload` trong file `src/server.js`.
* **[Minor]**: Thiếu cơ chế dọn dẹp (cleanup) kết nối khi Client bị mất mạng đột ngột (ping/pong check).
  - *Giải pháp*: Để ngỏ cho phát triển sau khi tích hợp môi trường Production.

## 2. Đánh giá rủi ro còn lại (Residual Risk Statement)
* **Mức độ rủi ro**: Thấp (đã khắc phục lỗi dữ liệu đầu vào trong try/catch).

## 3. Câu hỏi thảo luận (Open Questions)
* Có cần giới hạn số lượng kết nối tối đa tới một server WebSocket không?
