import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server/server.js';
import { openStore } from '../server/store.js';
import { chatSessionCookie, createChatIdentity } from '../server/chat-identity.js';
import { pickNewer } from '../src/cloud-save.js';

const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
/** Chat giả: cookie lb_session=<tên> là người đó; không có cookie là chưa đăng nhập. */
const fakeChat = () => createChatIdentity({
  baseUrl: 'http://chat:8082',
  ttlMs: 0,
  fetchImpl: async (_url, init) => {
    const who = /lb_session=([^;]+)/.exec(init.headers.cookie)?.[1];
    return who ? reply(200, { id: who, display_name: who.toUpperCase() }) : reply(401, {});
  },
});

const withServer = async (run) => {
  const store = openStore(':memory:');
  const server = createServer({ store, chatIdentity: fakeChat() });
  await new Promise((resolve) => server.listen(0, resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try { await run(url); } finally { server.close(); store.close(); }
};
const as = (who) => ({ cookie: `lb_session=${who}` });
// `pageOwner`: người mà trang game đã mở ra — bình thường trùng với cookie hiện tại.
const put = (url, who, body, pageOwner = who) => fetch(`${url}/api/save`, {
  method: 'PUT',
  headers: { ...as(who), 'content-type': 'application/json', 'x-garden-user': pageOwner },
  body: JSON.stringify(body),
});

test('chưa đăng nhập Chat thì không có bản lưu trên server', async () => {
  await withServer(async (url) => {
    assert.equal((await fetch(`${url}/api/save`)).status, 401);
    assert.equal((await fetch(`${url}/api/save`, { method: 'PUT', body: '{}' })).status, 401);
  });
});

test('lưu rồi đọc lại đúng khu vườn của đúng người', async () => {
  await withServer(async (url) => {
    assert.equal((await put(url, 'ken', { leaves: 42, lastSaved: 1000 })).status, 200);
    const ken = await (await fetch(`${url}/api/save`, { headers: as('ken') })).json();
    assert.deepEqual(ken.user, { id: 'ken', name: 'KEN' });
    assert.equal(ken.save.leaves, 42);

    // Người khác trên cùng server không thấy vườn của Ken.
    const bo = await (await fetch(`${url}/api/save`, { headers: as('bo') })).json();
    assert.equal(bo.save, null);
  });
});

test('bản lưu cũ hơn không được đè lên tiến trình mới', async () => {
  await withServer(async (url) => {
    await put(url, 'ken', { leaves: 900, lastSaved: 2000 });
    const stale = await put(url, 'ken', { leaves: 5, lastSaved: 1000 });
    assert.equal(stale.status, 409);
    assert.equal((await stale.json()).save.leaves, 900, 'trả lại bản mới hơn để máy kia biết');

    const now = await (await fetch(`${url}/api/save`, { headers: as('ken') })).json();
    assert.equal(now.save.leaves, 900);
    // Bản mới hơn thì ghi bình thường.
    assert.equal((await put(url, 'ken', { leaves: 901, lastSaved: 3000 })).status, 200);
  });
});

test('từ chối bản lưu không hợp lệ hoặc quá lớn', async () => {
  await withServer(async (url) => {
    assert.equal((await put(url, 'ken', { leaves: 1 })).status, 400, 'thiếu lastSaved');
    assert.equal((await put(url, 'ken', [1, 2])).status, 400);
    const huge = { lastSaved: 1, junk: 'x'.repeat(600 * 1024) };
    assert.equal((await put(url, 'ken', huge)).status, 413);
  });
});

test('phục vụ game và không cho đọc ra ngoài thư mục build', async () => {
  await withServer(async (url) => {
    assert.equal((await fetch(`${url}/healthz`)).status, 200);
    const traversal = await fetch(`${url}/..%2f..%2fpackage.json`);
    assert.notEqual(traversal.status, 200);
  });
});

test('chỉ chuyển tiếp cookie phiên của Chat', () => {
  assert.equal(chatSessionCookie('a=1; lb_session=xyz; b=2'), 'lb_session=xyz');
  assert.equal(chatSessionCookie('a=1'), '');
});

test('chọn bản lưu mới hơn theo lastSaved', () => {
  assert.equal(pickNewer({ lastSaved: 5 }, { lastSaved: 9 }), 'cloud');
  assert.equal(pickNewer({ lastSaved: 9 }, { lastSaved: 5 }), 'local');
  assert.equal(pickNewer({ lastSaved: 5 }, { lastSaved: 5 }), 'same');
  assert.equal(pickNewer(null, { lastSaved: 5 }), 'cloud');
  assert.equal(pickNewer({ lastSaved: 5 }, null), 'local');
  assert.equal(pickNewer(null, null), 'none');
});

test('đổi tài khoản Chat giữa chừng thì trang cũ không được ghi vào tài khoản mới', async () => {
  await withServer(async (url) => {
    // Trang mở bởi Ken, rồi cookie đổi sang Bo (Ken đăng xuất, Bo đăng nhập trên cùng máy).
    const res = await put(url, 'bo', { leaves: 999, lastSaved: 5000 }, 'ken');
    assert.equal(res.status, 409);
    assert.equal((await res.json()).error, 'account_changed');
    const bo = await (await fetch(`${url}/api/save`, { headers: as('bo') })).json();
    assert.equal(bo.save, null, 'vườn của Ken không lọt sang Bo');
  });
});
