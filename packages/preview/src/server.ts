import { createServer } from 'node:http';

export interface PreviewServer {
  start(
    previews: readonly { id: string; label?: string; summary?: string; html: string }[],
    question?: string,
    onChoose?: (id: string) => void
  ): Promise<{ url: string; close: () => Promise<void> }>;
}

export function createPreviewServer(): PreviewServer {
  return {
    async start(previews, question, onChoose) {
      const server = createServer((req, res) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
        const path = url.pathname === '/' ? '/' : url.pathname.slice(1);

        if (url.pathname === '/choose') {
          const id = url.searchParams.get('id');
          if (id && previews.some(p => p.id === id)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Choice Registered</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; text-align: center; margin-top: 8rem; background: #f8f9fa; color: #202124; }
    .card { background: #ffffff; border: 1px solid #e0e0e0; padding: 3rem; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { color: #137333; margin-bottom: 0.5rem; }
    p { color: #5f6368; margin-bottom: 1.5rem; }
    .badge { background: #e6f4ea; color: #137333; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; font-size: 1.1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✓ Selection Confirmed</h1>
    <p>You have successfully selected:</p>
    <div style="margin-bottom: 2rem;"><span class="badge">${id}</span></div>
    <p>You can close this tab and return to your terminal to continue.</p>
  </div>
</body>
</html>`);
            if (onChoose) onChoose(id);
            return;
          }
        }

        if (path === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Decision Panel</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 3rem auto; padding: 0 1.5rem; background: #f8f9fa; color: #202124; }
    h1 { border-bottom: 2px solid #e0e0e0; padding-bottom: 0.75rem; margin-bottom: 2rem; color: #1a73e8; }
    .question-box { background: #e8f0fe; border-left: 5px solid #1a73e8; padding: 1.5rem; border-radius: 0 8px 8px 0; margin-bottom: 2.5rem; font-size: 1.15rem; line-height: 1.5; }
    ul { list-style: none; padding: 0; }
    .option-card { background: white; border: 1px solid #ddd; padding: 1.5rem; margin: 1rem 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; }
    .option-info h3 { margin: 0 0 0.5rem 0; color: #202124; }
    .option-info p { margin: 0; color: #5f6368; font-size: 0.95rem; }
    .btn-view { color: #1a73e8; text-decoration: none; font-weight: 500; font-size: 0.95rem; }
    .btn-view:hover { text-decoration: underline; }
    .btn-choose { background: #1a73e8; color: white; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: bold; font-size: 0.95rem; transition: background 0.2s; white-space: nowrap; }
    .btn-choose:hover { background: #1557b0; }
  </style>
</head>
<body>
  <h1>Interactive Decision Panel</h1>
  <div class="question-box">
    ❓ <strong>Question:</strong> ${question || 'Review the options below and select the best approach:'}
  </div>
  <ul>
    ${previews.map(p => `
      <li class="option-card">
        <div class="option-info">
          <h3>${p.label || p.id}</h3>
          <p>${p.summary || ''}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <a href="/${p.id}" class="btn-view">🔍 View Preview</a>
          <a href="/choose?id=${p.id}" class="btn-choose">✓ Choose Option</a>
        </div>
      </li>
    `).join('\n    ')}
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

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        
        // Inject a floating selection banner at the top of the HTML preview
        const banner = `
<div style="background: #202124; color: white; padding: 12px 24px; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; left: 0; right: 0; z-index: 999999; border-bottom: 2px solid #1a73e8; box-shadow: 0 2px 8px rgba(0,0,0,0.15); box-sizing: border-box;">
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px;">
    <div style="font-weight: bold; font-size: 14px;"><span style="color: #8ab4f8;">Previewing:</span> ${preview.label ?? preview.id}</div>
    <div style="font-size: 12px; color: #ccc; max-width: 500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${preview.summary ?? ''}</div>
  </div>
  <div style="display: flex; align-items: center; gap: 15px;">
    <a href="/" style="color: #ccc; text-decoration: none; font-size: 14px; font-weight: 500;">← Back to List</a>
    <a href="/choose?id=${preview.id}" style="background: #1a73e8; color: white; text-decoration: none; padding: 7px 14px; border-radius: 4px; font-weight: bold; font-size: 13px; transition: background 0.2s;">✓ Choose Option</a>
  </div>
</div>`;
        
        let html = preview.html;
        if (html.includes('<body>')) {
          html = html.replace('<body>', `<body>${banner}`);
        } else {
          html = banner + html;
        }
        res.end(html);
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
