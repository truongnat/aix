import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import WebSocket from 'ws';

test('Hai client nhận được đồng bộ thời gian thực khi có Todo mới', async (t) => {
  const server = createServer(4000);
  const client1 = new WebSocket('ws://localhost:4000');
  const client2 = new WebSocket('ws://localhost:4000');

  // Đăng ký nhận message của Client 2
  const receivedPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for message')), 2000);
    client2.on('message', (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data));
    });
  });

  // Client 1 gửi yêu cầu thêm Todo mới
  client1.on('open', () => {
    client1.send(JSON.stringify({ type: 'ADD_TODO', payload: { id: 1, text: 'Học aix' } }));
  });

  const msg = await receivedPromise;
  assert.equal(msg.type, 'ADD_TODO');
  assert.equal(msg.payload.text, 'Học aix');

  // Dọn dẹp kết nối
  client1.close();
  client2.close();
  
  await new Promise((resolve) => {
    server.close(resolve);
  });
});
