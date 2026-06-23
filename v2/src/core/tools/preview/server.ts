import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets');

export interface ServeOptions {
    /** Full HTML document to serve at GET / (with nonce already injected). */
    html: string;
    /** Milliseconds to wait for a result before rejecting. Default 5 min. */
    timeoutMs?: number;
    /**
     * Local image files to make servable for this preview only, keyed by the
     * name referenced in HTML (e.g. `{ 'before.png': '/abs/path/before.png' }`
     * served at `/local/before.png`). Exact-name lookup only — never a path
     * the client supplies, so there is no traversal surface.
     */
    localFiles?: Record<string, string>;
}

export interface ServeResult<T> {
    /** Resolves with the listening URL (including nonce) to open in a browser. */
    getUrl: () => Promise<string>;
    /** Resolves with the posted payload, or rejects on timeout/cancel. */
    done: Promise<T>;
    /** The nonce the client must echo back. */
    nonce: string;
}

const ASSET_CONTENT_TYPES: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
};

const IMAGE_CONTENT_TYPES: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
};

/** Exact-match whitelist — never serve an arbitrary path under ASSETS_DIR. */
const ALLOWED_ASSETS = new Set(['tailwind.css', 'app.js', 'mermaid.js', 'lucide.js']);

/**
 * Spin up a one-shot loopback HTTP server that serves `html`, the bundled
 * assets (tailwind.css, app.js), and accepts a single POST result.
 *
 * Security: binds 127.0.0.1 only, uses a random nonce the client must echo,
 * and tears down after the first valid result or on timeout.
 */
export function serveOnce<T = unknown>(opts: ServeOptions): ServeResult<T> {
    const nonce = randomBytes(16).toString('hex');
    const timeoutMs = opts.timeoutMs ?? 5 * 60 * 1000;

    let resolveDone!: (value: T) => void;
    let rejectDone!: (reason: Error) => void;
    const done = new Promise<T>((resolve, reject) => {
        resolveDone = resolve;
        rejectDone = reject;
    });

    const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1');

        if (req.method === 'GET' && url.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(opts.html);
            return;
        }

        const assetName = url.pathname.replace(/^\//, '');
        if (req.method === 'GET' && ALLOWED_ASSETS.has(assetName)) {
            const file = path.join(ASSETS_DIR, assetName);
            readFile(file)
                .then((buf) => {
                    res.writeHead(200, { 'Content-Type': ASSET_CONTENT_TYPES[path.extname(file)] });
                    res.end(buf);
                })
                .catch(() => {
                    res.writeHead(404).end('asset not found');
                });
            return;
        }

        if (req.method === 'GET' && url.pathname.startsWith('/local/')) {
            const name = url.pathname.slice('/local/'.length);
            const localPath = opts.localFiles?.[name];
            const ext = path.extname(name).toLowerCase();
            if (!localPath || !IMAGE_CONTENT_TYPES[ext]) {
                res.writeHead(404).end('local file not found');
                return;
            }
            readFile(localPath)
                .then((buf) => {
                    res.writeHead(200, { 'Content-Type': IMAGE_CONTENT_TYPES[ext] });
                    res.end(buf);
                })
                .catch(() => {
                    res.writeHead(404).end('local file not found');
                });
            return;
        }

        if (req.method === 'POST' && url.pathname === '/result') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
                if (body.length > 1_000_000) req.destroy();
            });
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body) as { nonce?: string } & Record<string, unknown>;
                    if (payload.nonce !== nonce) {
                        res.writeHead(403).end(JSON.stringify({ ok: false }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                    cleanup();
                    resolveDone(payload as T);
                } catch {
                    res.writeHead(400).end(JSON.stringify({ ok: false }));
                }
            });
            return;
        }

        res.writeHead(404).end('not found');
    });

    const timer = setTimeout(() => {
        cleanup();
        rejectDone(new Error('preview timed out waiting for a response'));
    }, timeoutMs);

    function cleanup() {
        clearTimeout(timer);
        server.close();
    }

    const addressReady = new Promise<string>((resolve) => {
        server.on('listening', () => {
            const addr = server.address();
            const port = typeof addr === 'object' && addr ? addr.port : 0;
            resolve(`http://127.0.0.1:${port}/?nonce=${nonce}`);
        });
    });
    server.listen(0, '127.0.0.1');

    return { nonce, done, getUrl: () => addressReady };
}
