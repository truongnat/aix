import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import WebSocket from 'ws';

function once(emitter, event) {
  return new Promise((resolve, reject) => {
    emitter.once(event, resolve);
    emitter.once('error', reject);
  });
}

function closeSocket(socket) {
  return new Promise((resolve) => {
    if (socket.readyState === WebSocket.CLOSED) {
      resolve();
      return;
    }

    socket.once('close', resolve);
    socket.close();
  });
}

function closeServer(server) {
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

test('Hai client nhận được đồng bộ thời gian thực khi có Todo mới', async () => {
  const server = createServer(0, '127.0.0.1');
  let client1;
  let client2;

  try {
    await once(server, 'listening');

    const address = server.address();
    assert.equal(address.address, '127.0.0.1');

    const url = `ws://${address.address}:${address.port}`;
    client1 = new WebSocket(url);
    client2 = new WebSocket(url);

    await Promise.all([
      once(client1, 'open'),
      once(client2, 'open'),
    ]);

    // Đăng ký nhận message của Client 2
    const receivedPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout waiting for message')), 2000);
      client2.on('message', (data) => {
        clearTimeout(timer);
        resolve(JSON.parse(data));
      });
    });

    // Client 1 gửi yêu cầu thêm Todo mới
    client1.send(JSON.stringify({ type: 'ADD_TODO', payload: { id: 1, text: 'Học aix' } }));

    const msg = await receivedPromise;
    assert.equal(msg.type, 'ADD_TODO');
    assert.equal(msg.payload.text, 'Học aix');
  } finally {
    // Dọn dẹp kết nối
    await Promise.all([
      client1 ? closeSocket(client1) : Promise.resolve(),
      client2 ? closeSocket(client2) : Promise.resolve(),
    ]);

    await closeServer(server);
  }
});
