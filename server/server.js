// Idle Garden Hero: standalone static server with hardened security headers.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

// Strict Content Security Policy:
// - Disallows inline scripts (anti-XSS).
// - Disallows embedding in any iframe (frame-ancestors 'none' + X-Frame-Options: DENY).
// - Whitelists only essential fonts (Google Fonts) and asset data/blob URIs needed by Phaser.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
};

function applySecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
}

async function serveStatic(req, res, distDir) {
  let decodedPath;
  try {
    const rawPath = new URL(req.url, 'http://127.0.0.1').pathname;
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return sendJson(res, 400, { error: 'bad_request' });
  }

  // Reject poison null bytes
  if (decodedPath.includes('\0')) {
    return sendJson(res, 400, { error: 'bad_request' });
  }

  if (decodedPath.endsWith('/')) {
    decodedPath += 'index.html';
  }

  // Normalize and resolve strictly within distDir
  const normalized = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  const full = path.resolve(distDir, `.${path.sep}${normalized}`);

  const normalizedDist = path.resolve(distDir);
  if (!full.startsWith(normalizedDist + path.sep) && full !== path.join(normalizedDist, 'index.html')) {
    return sendJson(res, 403, { error: 'forbidden' });
  }

  // Disallow hidden files
  const parts = normalized.split(/[/\\]/);
  if (parts.some((p) => p.startsWith('.') && p !== '.' && p !== '..')) {
    return sendJson(res, 404, { error: 'not_found' });
  }

  try {
    const info = await stat(full);
    if (!info.isFile()) throw new Error('not a file');

    const ext = path.extname(full).toLowerCase();
    const isHashed = decodedPath.startsWith('/assets/') && /-[a-zA-Z0-9_-]{8,}\./.test(decodedPath);

    res.writeHead(200, {
      'content-type': TYPES[ext] || 'application/octet-stream',
      'cache-control': isHashed ? 'public, max-age=31536000, immutable' : 'no-cache',
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    res.end(await readFile(full));
  } catch {
    sendJson(res, 404, { error: 'not_found' });
  }
}

export function createServer({ distDir = DEFAULT_DIST } = {}) {
  return http.createServer(async (req, res) => {
    applySecurityHeaders(res);

    try {
      const url = new URL(req.url, 'http://127.0.0.1');

      if (url.pathname === '/healthz') {
        return sendJson(res, 200, { ok: true });
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendJson(res, 405, { error: 'method_not_allowed' });
      }

      return await serveStatic(req, res, distDir);
    } catch (error) {
      console.error(JSON.stringify({ event: 'request_failed', message: error.message }));
      if (!res.headersSent) sendJson(res, 500, { error: 'internal' });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8095);
  const server = createServer();
  server.listen(port, () => console.log(JSON.stringify({ event: 'server_started', port })));
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => process.exit(0));
    });
  }
}
