// Idle Garden Hero trong Chat: phục vụ bản build tĩnh và giữ bản lưu theo tài khoản Chat.
// Reverse proxy (Caddy `handle_path /garden/*`) cắt tiền tố trước khi vào đây, nên server
// thấy /, /assets/..., /api/save; phía client mọi URL đều tương đối nên chạy ở đâu cũng được.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChatIdentity } from './chat-identity.js';
import { openStore } from './store.js';

const DEFAULT_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const MAX_SAVE_BYTES = 512 * 1024;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};
// Đúng những gì game dùng: script/ảnh của chính nó, font Google, và Phaser vẽ canvas
// (ảnh tạo từ blob:/data:). Không có 'unsafe-inline' cho script.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Font giờ nằm ngay trong bản build (assets/*.woff2), không tải từ Google nữa. Để
  // font-src chỉ có fonts.gstatic.com thì trình duyệt chặn font của chính game và âm
  // thầm rơi về font hệ thống — không lỗi nào hiện ra, chỉ thấy chữ sai kiểu.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function applySecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
}

async function serveStatic(req, res, distDir) {
  let file;
  if (/%2e|%2f|%5c/i.test(req.url)) return sendJson(res, 400, { error: 'bad_request' });
  try { file = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { return sendJson(res, 400, { error: 'bad_request' }); }
  if (file.includes('\0') || file.includes('\\')) return sendJson(res, 400, { error: 'bad_request' });
  const segments = file.split('/');
  if (segments.some(segment => segment === '..' || segment.startsWith('.'))) return sendJson(res, 403, { error: 'forbidden' });
  if (file.endsWith('/')) file += 'index.html';
  const root = path.resolve(distDir);
  const full = path.resolve(root, `.${file}`);
  if (!full.startsWith(root + path.sep)) return sendJson(res, 403, { error: 'forbidden' });
  try {
    const info = await stat(full);
    if (!info.isFile()) throw new Error('not a file');
    const hashed = file.startsWith('/assets/') && /-[a-zA-Z0-9_-]{8,}\./.test(file);
    res.writeHead(200, {
      'content-type': TYPES[path.extname(full)] || 'application/octet-stream',
      // Tên file có mã băm thì cache lâu được; còn lại luôn hỏi lại để bản mới tới ngay.
      'cache-control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : await readFile(full));
  } catch {
    sendJson(res, 404, { error: 'not_found' });
  }
}

export function createServer({ store, chatIdentity, distDir = DEFAULT_DIST } = {}) {
  return http.createServer(async (req, res) => {
    applySecurityHeaders(res);
    try {
      const url = new URL(req.url, 'http://x');
      if (url.pathname === '/healthz') {
        store?.ping();
        return sendJson(res, 200, { ok: true });
      }
      if (url.pathname === '/api/save') {
        const user = chatIdentity ? await chatIdentity.resolve(req.headers.cookie) : null;
        if (!user) return sendJson(res, 401, { error: 'not_signed_in' });
        if (req.method === 'GET') return sendJson(res, 200, { user, save: store.load(user.id) });
        if (req.method === 'PUT') {
          // Trang game gắn chặt với người đã mở nó. Cookie thì có thể đổi dưới chân (đăng xuất
          // Chat rồi người khác đăng nhập trên cùng máy) — lần tự lưu sau đó sẽ ghi vườn của
          // người trước vào tài khoản người sau. Trang gửi kèm id của mình; lệch là từ chối.
          if (req.headers['x-garden-user'] !== user.id) return sendJson(res, 409, { error: 'account_changed' });
          let state;
          try { state = JSON.parse(await readBody(req, MAX_SAVE_BYTES)); }
          catch (error) { return sendJson(res, error.status || 400, { error: error.status ? 'too_large' : 'invalid_json' }); }
          if (!state || typeof state !== 'object' || Array.isArray(state) || !Number.isFinite(state.lastSaved))
            return sendJson(res, 400, { error: 'invalid_save' });
          const result = store.save(user.id, user.name, state);
          return result.ok ? sendJson(res, 200, { ok: true }) : sendJson(res, 409, { error: 'stale_save', save: result.current });
        }
        return sendJson(res, 405, { error: 'method_not_allowed' });
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'method_not_allowed' });
      return await serveStatic(req, res, distDir);
    } catch (error) {
      console.error(JSON.stringify({ event: 'request_failed', message: error.message }));
      if (!res.headersSent) sendJson(res, 500, { error: 'internal' });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8095);
  const store = openStore(process.env.DATA_DIR || '/data');
  const chatIdentity = createChatIdentity({ baseUrl: process.env.CHAT_API_URL || 'http://chat:8082' });
  const server = createServer({ store, chatIdentity });
  server.listen(port, () => console.log(JSON.stringify({ event: 'server_started', port })));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close(() => { store.close(); process.exit(0); });
  });
}
