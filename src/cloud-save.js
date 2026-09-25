// Lưu tiến trình theo tài khoản Chat. Mở game từ chat.lazybutts.com/garden/ thì server
// biết ai đang chơi (qua cookie đăng nhập của Chat) và giữ bản lưu cho người đó — đổi
// máy vẫn chơi tiếp được. Mở ở chỗ khác (dev, GitHub Pages) thì /api/save không có,
// game lặng lẽ chạy bằng localStorage như cũ.

const saveUrl = () => new URL('api/save', document.baseURI).toString();

/** Bản nào mới hơn theo `lastSaved` — game tự đóng dấu mỗi lần lưu. */
export function pickNewer(local, cloud) {
  const localAt = Number(local?.lastSaved) || 0;
  const cloudAt = Number(cloud?.lastSaved) || 0;
  if (!localAt && !cloudAt) return 'none';
  return cloudAt > localAt ? 'cloud' : localAt > cloudAt ? 'local' : 'same';
}

/** Hỏi server xem có đang đăng nhập Chat không; có thì trả về người chơi và bản lưu. */
export async function connectCloud(fetchImpl = fetch) {
  try {
    const res = await fetchImpl(saveUrl(), { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.user ? { user: body.user, save: body.save ?? null } : null;
  } catch {
    return null;
  }
}

/**
 * Gửi bản lưu lên server, gộp những lần lưu dồn dập (game lưu sau mỗi thao tác) thành
 * một lần mỗi vài giây. Lúc rời trang thì gửi nốt bằng `keepalive` để không mất mấy giây cuối.
 */
export function createCloudSaver({ userId, fetchImpl = fetch, delayMs = 4000, onConflict = () => {} } = {}) {
  let pending = null;
  let timer = null;
  const send = (state, keepalive = false) =>
    fetchImpl(saveUrl(), {
      method: 'PUT',
      credentials: 'same-origin',
      keepalive,
      headers: { 'content-type': 'application/json', 'x-garden-user': userId },
      body: JSON.stringify(state),
    }).then((res) => {
      // 409 có hai nghĩa: máy khác vừa lưu bản mới hơn (`stale_save`), hoặc cookie Chat đã
      // đổi sang người khác (`account_changed`). Cả hai đều không được đè — báo để game dừng.
      if (res.status === 409) {
        return res.json().then((body) => { pending = null; onConflict(body?.error || 'stale_save'); });
      }
      return undefined;
    }).catch(() => { /* mất mạng: lần lưu sau sẽ gửi lại */ });

  const flush = (keepalive = false) => {
    clearTimeout(timer);
    timer = null;
    if (!pending) return undefined;
    const state = pending;
    pending = null;
    return send(state, keepalive);
  };

  return {
    schedule(state) {
      pending = state;
      if (!timer) timer = setTimeout(() => flush(), delayMs);
    },
    flush,
  };
}
