# Remember: Todo List Sync Real-time

Lưu trữ bài học kinh nghiệm dài hạn thu thập được từ phiên làm việc này.

## 1. Ghi chú bài học (Remember Note)
* Khi làm việc với WebSockets trong môi trường monorepo Node.js test runner, luôn đảm bảo giải phóng (close) cổng port của Server sau mỗi test case để tránh lỗi `EADDRINUSE` (cổng bị chiếm dụng) ở các test case chạy song song sau đó.

## 2. Quyết định lâu dài (Durable Decisions)
* Từ nay về sau, tất cả WebSocket server tự viết phải có tích hợp khối `try/catch` parser mặc định để ngăn chặn crash hệ thống khi nhận chuỗi JSON lỗi từ client.

## 3. Vùng ảnh hưởng liên quan (Affected Areas)
* `src/server.js`
* `test/sync.test.js`
