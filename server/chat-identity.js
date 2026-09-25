// Chat (chat.lazybutts.com) giữ đăng nhập của cả nhà. Game chạy dưới /garden/* của
// chính host đó nên trình duyệt gửi kèm cookie `lb_session`; server hỏi Chat "cookie
// này là ai". Không mật khẩu, không secret dùng chung — Chat là trọng tài duy nhất.
const CACHE_TTL_MS = 10_000;
const MAX_CACHE = 500;

/** Chỉ lấy đúng cookie phiên của Chat, không chuyển tiếp cookie nào khác. */
export function chatSessionCookie(header = '') {
  return header.split(';').map((part) => part.trim()).find((part) => part.startsWith('lb_session=')) || '';
}

export function createChatIdentity({ baseUrl, fetchImpl = fetch, ttlMs = CACHE_TTL_MS, now = Date.now } = {}) {
  if (!baseUrl) return null;
  const root = baseUrl.replace(/\/+$/, '');
  // Game lưu vài giây một lần; cache ngắn để Chat không phải trả lời từng lần lưu.
  const cache = new Map();
  return {
    async resolve(cookieHeader) {
      const cookie = chatSessionCookie(cookieHeader || '');
      if (!cookie) return null;
      const hit = cache.get(cookie);
      if (hit && hit.until > now()) return hit.user;
      let response;
      try {
        response = await fetchImpl(`${root}/api/me`, { headers: { cookie } });
      } catch {
        return null; // Chat sập: coi như chưa đăng nhập, game vẫn chơi được bằng bản lưu trên máy.
      }
      let user = null;
      if (response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.id !== undefined && body?.id !== null) {
          user = { id: String(body.id), name: String(body.display_name || body.username || 'Gardener').slice(0, 40) };
        }
      }
      if (cache.size >= MAX_CACHE) {
        for (const [key, value] of cache) if (value.until <= now()) cache.delete(key);
        if (cache.size >= MAX_CACHE) cache.clear();
      }
      cache.set(cookie, { user, until: now() + ttlMs });
      return user;
    },
  };
}
