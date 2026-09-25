// Bản lưu theo người chơi Chat. Cả trạng thái game là một khối JSON — game tự đọc/ghi
// trọn gói, server không cần hiểu bên trong, chỉ giữ và trả lại.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export function openStore(dataDir) {
  const file = dataDir === ':memory:' ? ':memory:' : path.join(dataDir, 'garden.db');
  if (dataDir !== ':memory:') mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec(`CREATE TABLE IF NOT EXISTS saves (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    last_saved INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`);
  const get = db.prepare('SELECT data, last_saved FROM saves WHERE user_id = ?');
  const put = db.prepare(`INSERT INTO saves (user_id, name, data, last_saved, updated_at) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET name = excluded.name, data = excluded.data,
      last_saved = excluded.last_saved, updated_at = excluded.updated_at`);
  return {
    load(userId) {
      const row = get.get(userId);
      return row ? JSON.parse(row.data) : null;
    },
    /**
     * Ghi nếu bản gửi lên không cũ hơn bản đang giữ. Máy nào lưu sau thắng; một máy
     * lâu không mở (đồng hồ trong bản lưu cũ hơn) không được đè lên tiến trình mới.
     */
    save(userId, name, state) {
      const current = get.get(userId);
      if (current && current.last_saved > state.lastSaved) return { ok: false, current: JSON.parse(current.data) };
      put.run(userId, name, JSON.stringify(state), state.lastSaved, Date.now());
      return { ok: true };
    },
    ping() { db.prepare('SELECT 1').get(); },
    close() { db.close(); },
  };
}
