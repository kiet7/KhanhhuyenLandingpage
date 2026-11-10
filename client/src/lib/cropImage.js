// Cắt ảnh trên trình duyệt bằng canvas, theo vùng `crop` (pixel) mà react-easy-crop trả về.
// `rotation` là bội số của 90 độ. `maxWidth` thu nhỏ ảnh kết quả nếu rộng hơn (không phóng to).
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // cần cho ảnh Cloudinary, nếu không canvas bị "tainted"
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không tải được ảnh"));
    img.src = src;
  });
}

export async function cropImage(src, crop, { rotation = 0, maxWidth, type = "image/jpeg", quality = 0.9 } = {}) {
  const img = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Vẽ ảnh đã xoay lên canvas trung gian; toạ độ crop tính theo khung bao của ảnh đã xoay.
  const rotated = document.createElement("canvas");
  rotated.width = Math.round(w * cos + h * sin);
  rotated.height = Math.round(w * sin + h * cos);
  const rctx = rotated.getContext("2d");
  rctx.translate(rotated.width / 2, rotated.height / 2);
  rctx.rotate(rad);
  rctx.drawImage(img, -w / 2, -h / 2);

  const scale = maxWidth && crop.width > maxWidth ? maxWidth / crop.width : 1;
  const out = document.createElement("canvas");
  out.width = Math.round(crop.width * scale);
  out.height = Math.round(crop.height * scale);
  const ctx = out.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = "#fff"; // JPEG không có nền trong suốt
    ctx.fillRect(0, 0, out.width, out.height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(rotated, crop.x, crop.y, crop.width, crop.height, 0, 0, out.width, out.height);

  return new Promise((resolve, reject) =>
    out.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Không xuất được ảnh"))), type, quality)
  );
}
