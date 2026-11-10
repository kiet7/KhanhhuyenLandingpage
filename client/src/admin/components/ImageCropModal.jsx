import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import Button from "../../components/ui/Button";
import { cropImage } from "../../lib/cropImage";

const PRESETS = [
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

// Hộp thoại cắt ảnh trước khi upload. `recommended` ({ width, height }) đặt tỉ lệ mặc định
// và giới hạn chiều rộng ảnh xuất ra. `onUseOriginal` (nếu có) hiện nút bỏ qua bước cắt.
export default function ImageCropModal({ src, type, recommended, onCancel, onConfirm, onUseOriginal }) {
  const recommendedRatio = recommended ? recommended.width / recommended.height : null;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(recommendedRatio); // null = chờ tỉ lệ gốc của ảnh
  const [naturalRatio, setNaturalRatio] = useState(null);
  const [areaPixels, setAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const options = [
    ...(recommendedRatio ? [{ label: "Khuyến nghị", value: recommendedRatio }] : []),
    ...PRESETS.filter((p) => !recommendedRatio || Math.abs(p.value - recommendedRatio) > 0.01),
    ...(naturalRatio ? [{ label: "Gốc", value: naturalRatio }] : []),
  ];

  function handleMediaLoaded({ naturalWidth, naturalHeight }) {
    const ratio = naturalWidth / naturalHeight;
    setNaturalRatio(ratio);
    if (!aspect) setAspect(ratio);
  }

  function rotate(delta) {
    setRotation((r) => (r + delta + 360) % 360);
    // Ảnh xoay 90° thì tỉ lệ gốc đảo ngược
    if (naturalRatio) setNaturalRatio((r) => 1 / r);
    if (aspect === naturalRatio) setAspect(1 / naturalRatio);
  }

  async function handleConfirm() {
    if (!areaPixels) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await cropImage(src, areaPixels, {
        rotation,
        type,
        maxWidth: recommended ? recommended.width : 2000,
      });
      await onConfirm(blob);
    } catch {
      setError("Không cắt được ảnh này. Thử chọn lại ảnh từ máy.");
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-primary-100 px-5 py-3">
          <h3 className="font-semibold text-primary-900">Chỉnh sửa ảnh</h3>
          <button type="button" onClick={onCancel} className="text-xl leading-none text-primary-900/40 hover:text-primary-900">
            ×
          </button>
        </div>

        <div className="relative h-[55vh] max-h-[420px] min-h-[240px] bg-gray-900">
          {aspect && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              maxZoom={5}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setAreaPixels(pixels)}
              onMediaLoaded={handleMediaLoaded}
              mediaProps={{ crossOrigin: "anonymous" }}
            />
          )}
          {!aspect && (
            // Chưa biết tỉ lệ gốc: render ảnh ẩn để lấy kích thước
            <img
              src={src}
              alt=""
              crossOrigin="anonymous"
              className="hidden"
              onLoad={(e) => handleMediaLoaded(e.currentTarget)}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-sm text-primary-900/60">Tỉ lệ</span>
            {options.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setAspect(o.value)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  aspect && Math.abs(aspect - o.value) < 0.001
                    ? "bg-primary-500 font-semibold text-white"
                    : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 text-sm text-primary-900/60">Phóng to</span>
            <input
              type="range"
              min={1}
              max={5}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="min-w-40 flex-1 accent-primary-500"
            />
            <div className="flex gap-1">
              <button
                type="button"
                title="Xoay trái"
                onClick={() => rotate(-90)}
                className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-600 hover:bg-primary-100"
              >
                ↺ Xoay
              </button>
              <button
                type="button"
                title="Xoay phải"
                onClick={() => rotate(90)}
                className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-600 hover:bg-primary-100"
              >
                ↻
              </button>
            </div>
          </div>

          {recommended && (
            <p className="text-xs text-primary-900/50">
              Ảnh xuất ra tối đa rộng {recommended.width}px (khuyến nghị {recommended.width} × {recommended.height} px).
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap items-center justify-end gap-3">
            {onUseOriginal && (
              <button
                type="button"
                onClick={onUseOriginal}
                disabled={processing}
                className="mr-auto text-sm text-primary-600 hover:underline"
              >
                Dùng ảnh gốc (không cắt)
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="rounded-full px-4 py-2 text-sm font-semibold text-primary-900/60 hover:bg-primary-50"
            >
              Hủy
            </button>
            <Button type="button" onClick={handleConfirm} disabled={processing || !areaPixels}>
              {processing ? "Đang xử lý..." : "Dùng ảnh này"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
