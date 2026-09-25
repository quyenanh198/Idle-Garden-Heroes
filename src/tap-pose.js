// Hiệu ứng "nhún" khi chạm vào nhân vật phải luôn tính từ dáng đứng yên, ghi lại lúc tạo
// nhân vật. Trước đây nó đọc scaleX/scaleY/y *hiện tại* làm gốc — mà killTweensOf dừng tween
// cũ ngay tại chỗ, không trả về dáng ban đầu. Chạm nhanh (dưới 90ms một lần, đúng kiểu
// người chơi thu hoạch) thì cú chạm sau lấy dáng đang bẹp của cú trước làm gốc, dồn dần:
// nhân vật phình ngang, dẹt dọc và không bao giờ trở lại.

/** Dáng đứng yên của nhân vật; thiếu (đối tượng cũ) thì lấy tạm dáng hiện tại. */
export function restPose(target) {
  return target.restPose ?? {
    x: target.x, y: target.y, scaleX: target.scaleX, scaleY: target.scaleY, angle: target.angle ?? 0,
  };
}

/** Hai nhịp nhún — bẹp xuống rồi vươn lên — đều neo vào dáng đứng yên. */
export function tapKeyframes(rest) {
  return {
    squash: { scaleX: rest.scaleX * 1.25, scaleY: rest.scaleY * 0.78, y: rest.y + 4 },
    stretch: { scaleX: rest.scaleX * 0.96, scaleY: rest.scaleY * 1.12, y: rest.y - 6 },
  };
}
