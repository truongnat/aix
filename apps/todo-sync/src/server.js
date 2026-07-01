import { WebSocketServer } from 'ws';

export function createServer(port, host = '127.0.0.1') {
  const wss = new WebSocketServer({ port, host });
  
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        // Bảo vệ: Kiểm tra cấu trúc tin nhắn tối thiểu trước khi broadcast
        if (!data.type || !data.payload) return;
        
        // Broadcast sự kiện tới toàn bộ client khác đang kết nối
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      } catch {
        // Bỏ qua nếu dữ liệu không phải JSON hợp lệ
      }
    });
  });
  
  return wss;
}
