import { createServer } from 'node:http';

export interface PreviewServer {
  start(previews: readonly { id: string; html: string }[]): Promise<{ url: string; close: () => Promise<void> }>;
}

export function createPreviewServer(): PreviewServer {
  return {
    async start(previews) {
      const server = createServer((req, res) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
        const path = url.pathname === '/' ? '/' : url.pathname.slice(1);

        if (path === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    h1 { border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Preview Server</h1>
  <ul>
    ${previews.map(p => `<li><a href="/${p.id}">${p.id}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>`);
          return;
        }

        const preview = previews.find(p => p.id === path);
        if (!preview) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(preview.html);
      });

      const port = await new Promise<number>((resolve, reject) => {
        server.listen(0, '127.0.0.1', () => {
          const addr = server.address();
          if (addr && typeof addr === 'object') {
            resolve(addr.port);
          } else {
            reject(new Error('Failed to get port'));
          }
        });
      });

      const timeout = setTimeout(() => {
        server.close();
      }, 5 * 60 * 1000);

      return {
        url: `http://127.0.0.1:${port}`,
        async close() {
          clearTimeout(timeout);
          await new Promise<void>((resolve) => server.close(() => resolve()));
        },
      };
    },
  };
}
