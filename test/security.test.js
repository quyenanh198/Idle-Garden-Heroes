import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createServer } from '../server/server.js';

async function withServer(run) {
  const distDir = await fs.mkdtemp(path.join(os.tmpdir(), 'garden-security-'));
  await fs.writeFile(path.join(distDir, 'index.html'), '<html>Garden</html>');
  await fs.mkdir(path.join(distDir, 'assets'));
  await fs.writeFile(path.join(distDir, 'assets', 'index-a1b2c3d4.js'), 'export default 1;');
  const server = createServer({ distDir });
  try {
    await new Promise(resolve => server.listen(0, resolve));
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(distDir, { recursive: true, force: true });
  }
}

test('Chat embedding stays same-origin and browser security headers remain active', async () => {
  await withServer(async base => {
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'self'/);
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('cross-origin-opener-policy'), 'same-origin');
    assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin');
  });
});

test('static files stay inside dist and hashed assets are cacheable', async () => {
  await withServer(async base => {
    assert.equal((await fetch(`${base}/..%2f..%2fpackage.json`)).status, 400);
    assert.equal((await fetch(`${base}/%00.txt`)).status, 400);
    assert.equal((await fetch(`${base}/.env`)).status, 403);
    assert.equal((await fetch(`${base}/api/save`)).status, 401);
    const asset = await fetch(`${base}/assets/index-a1b2c3d4.js`);
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('cache-control'), /immutable/);
    const head = await fetch(`${base}/`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  });
});
