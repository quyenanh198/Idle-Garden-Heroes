import test from 'node:test';
import assert from 'node:assert/strict';
import { restPose, tapKeyframes } from '../src/tap-pose.js';

/**
 * Mô phỏng đúng chuyện xảy ra khi chạm nhanh: killTweensOf dừng cú nhún trước giữa chừng,
 * nhân vật đứng lại ở dáng đang bẹp, rồi cú chạm sau bắt đầu. `baseOf` là cách chọn gốc.
 */
function tapRapidly(sprite, times, baseOf) {
  for (let i = 0; i < times; i++) {
    const base = baseOf(sprite);
    const { squash } = tapKeyframes(base);
    // Bị ngắt ở nửa đường nhịp bẹp.
    sprite.scaleX = base.scaleX + (squash.scaleX - base.scaleX) * 0.5;
    sprite.scaleY = base.scaleY + (squash.scaleY - base.scaleY) * 0.5;
  }
  // Nhịp cuối chạy hết và yoyo về gốc của chính nó.
  const last = baseOf(sprite);
  return { scaleX: last.scaleX, scaleY: last.scaleY };
}

const knight = () => ({ x: 100, y: 80, scaleX: 0.5, scaleY: 0.5, angle: 0,
  restPose: { x: 100, y: 80, scaleX: 0.5, scaleY: 0.5, angle: 0 } });

test('chạm nhanh liên tục vẫn trở về đúng dáng đứng yên', () => {
  const settled = tapRapidly(knight(), 30, restPose);
  assert.equal(settled.scaleX, 0.5);
  assert.equal(settled.scaleY, 0.5);
});

test('lấy dáng hiện tại làm gốc (cách cũ) thì nhân vật phình ngang, dẹt dọc — đúng lỗi đã gặp', () => {
  const current = (s) => ({ x: s.x, y: s.y, scaleX: s.scaleX, scaleY: s.scaleY, angle: s.angle });
  const settled = tapRapidly(knight(), 30, current);
  assert.ok(settled.scaleX / settled.scaleY > 5, `tỉ lệ ngang/dọc chỉ còn ${settled.scaleX / settled.scaleY}`);
});

test('nhịp nhún neo vào dáng đứng yên chứ không vào vị trí hiện tại', () => {
  const rest = { x: 0, y: 50, scaleX: 2, scaleY: 2, angle: 0 };
  const { squash, stretch } = tapKeyframes(rest);
  assert.deepEqual(squash, { scaleX: 2.5, scaleY: 1.56, y: 54 });
  assert.deepEqual(stretch, { scaleX: 1.92, scaleY: 2.24, y: 44 });
});

test('đối tượng chưa có restPose thì tạm lấy dáng hiện tại', () => {
  assert.deepEqual(restPose({ x: 1, y: 2, scaleX: 3, scaleY: 4 }), { x: 1, y: 2, scaleX: 3, scaleY: 4, angle: 0 });
});
