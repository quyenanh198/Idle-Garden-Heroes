import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createServer } from '../server/server.js';

const withServer = async (run) => {
  const tmpDist = await fs.mkdtemp(path.join(os.tmpdir(), 'garden-test-dist-'));
  await fs.writeFile(path.join(tmpDist, 'index.html'), '<html><body>Garden</body></html>');
  const assetsDir = path.join(tmpDist, 'assets');
  await fs.mkdir(assetsDir);
  await fs.writeFile(path.join(assetsDir, 'index-a1b2c3d4.js'), 'console.log("hello");');
  await fs.writeFile(path.join(tmpDist, 'secret.txt'), 'secret_inside_dist');

  const server = createServer({ distDir: tmpDist });
  await new Promise((resolve) => server.listen(0, resolve));
  const url = `http://127.0.0.1:${server.address().port}`;

  try {
    await run(url, tmpDist);
  } finally {
    server.close();
    await fs.rm(tmpDist, { recursive: true, force: true });
  }
};

test('cung cấp đầy đủ các security headers quan trọng chống clickjacking và XSS', async () => {
  await withServer(async (url) => {
    const res = await fetch(`${url}/`);
    assert.equal(res.status, 200);

    // Anti-clickjacking
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    const csp = res.headers.get('content-security-policy') || '';
    assert.ok(csp.includes("frame-ancestors 'none'"), 'CSP must forbid iframe embedding');
    assert.ok(csp.includes("script-src 'self'"), 'CSP must restrict scripts to self');
    assert.ok(!csp.includes("'unsafe-eval'"), 'CSP must not allow unsafe-eval');

    // Anti-MIME sniffing
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');

    // Referrer & Permissions policies
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('permissions-policy')?.includes('camera=()'));

    // Cross-origin isolation protections
    assert.equal(res.headers.get('cross-origin-opener-policy'), 'same-origin');
    assert.equal(res.headers.get('cross-origin-resource-policy'), 'same-origin');
  });
});

test('hoàn toàn vô hiệu hóa và loại bỏ API cloud save /api/save', async () => {
  await withServer(async (url) => {
    const getRes = await fetch(`${url}/api/save`);
    assert.equal(getRes.status, 404, 'Endpoint /api/save không còn tồn tại');

    const postRes = await fetch(`${url}/api/save`, {
      method: 'POST',
      body: JSON.stringify({ state: {} }),
      headers: { 'content-type': 'application/json' },
    });
    // Non-GET/HEAD methods are rejected with 405
    assert.equal(postRes.status, 405);

    const putRes = await fetch(`${url}/api/save`, {
      method: 'PUT',
      body: JSON.stringify({ state: {} }),
      headers: { 'content-type': 'application/json' },
    });
    assert.equal(putRes.status, 405);
  });
});

test('ngăn chặn tuyệt đối tấn công path traversal đọc file bên ngoài', async () => {
  await withServer(async (url) => {
    // Thử dùng relative path traversal
    const res1 = await fetch(`${url}/..%2f..%2fpackage.json`);
    assert.notEqual(res1.status, 200, 'Không được phép đọc file bên ngoài dist');

    const res2 = await fetch(`${url}/%2e%2e/%2e%2e/server/server.js`);
    assert.notEqual(res2.status, 200);

    // Thử null byte injection
    const res3 = await fetch(`${url}/index.html%00.txt`);
    assert.equal(res3.status, 400);
  });
});

test('endpoint healthz phản hồi 200 kèm security headers', async () => {
  await withServer(async (url) => {
    const res = await fetch(`${url}/healthz`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { ok: true });
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
  });
});

test('phục vụ asset với cache control bất biến cho hashed files', async () => {
  await withServer(async (url) => {
    const hashedRes = await fetch(`${url}/assets/index-a1b2c3d4.js`);
    assert.equal(hashedRes.status, 200);
    assert.ok(hashedRes.headers.get('cache-control')?.includes('immutable'));
    assert.equal(hashedRes.headers.get('content-type'), 'text/javascript; charset=utf-8');

    const htmlRes = await fetch(`${url}/`);
    assert.equal(htmlRes.status, 200);
    assert.equal(htmlRes.headers.get('cache-control'), 'no-cache');
    assert.equal(htmlRes.headers.get('content-type'), 'text/html; charset=utf-8');
  });
});
