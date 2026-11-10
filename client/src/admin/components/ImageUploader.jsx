import { useState } from "react";
import { uploadImage } from "../../api/upload";
import ImageCropModal from "./ImageCropModal";

// `recommended` ({ width, height }) — kích thước khuyến nghị: hiển thị kèm kích thước thật
// của ảnh hiện tại, cảnh báo nếu ảnh nhỏ hơn, và là tỉ lệ cắt mặc định khi chỉnh sửa ảnh.
// `hint` — chú thích thêm. `previewClassName` — đổi khung xem trước (mặc định vuông 80px).
export default function ImageUploader({
  value,
  onChange,
  label,
  hint,
  recommended,
  previewClassName = "h-20 w-20",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState(null); // kích thước thật của ảnh đang hiển thị
  const [cropping, setCropping] = useState(null); // { src, type, file? } khi đang mở hộp thoại cắt

  async function upload(file) {
    setLoading(true);
    setError("");
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch {
      setError("Upload ảnh thất bại. Kiểm tra cấu hình Cloudinary.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại đúng file đó lần sau
    if (!file) return;
    setCropping({
      src: URL.createObjectURL(file),
      type: file.type === "image/png" ? "image/png" : "image/jpeg",
      file,
    });
  }

  function editCurrent() {
    setCropping({ src: value, type: /\.png($|\?)/i.test(value) ? "image/png" : "image/jpeg" });
  }

  function closeCrop() {
    if (cropping?.file) URL.revokeObjectURL(cropping.src);
    setCropping(null);
  }

  async function handleCropped(blob) {
    const ext = blob.type === "image/png" ? "png" : "jpg";
    closeCrop();
    await upload(new File([blob], `image.${ext}`, { type: blob.type }));
  }

  function handleUseOriginal() {
    const file = cropping.file;
    closeCrop();
    upload(file);
  }

  const tooSmall =
    recommended && size && (size.width < recommended.width || size.height < recommended.height);

  return (
    <div>
      {label && <p className="mb-1 text-sm font-semibold text-primary-900">{label}</p>}
      <div className="flex items-center gap-4">
        <div
          className={`${previewClassName} shrink-0 overflow-hidden rounded-xl bg-primary-50 ring-1 ring-primary-100`}
        >
          {value ? (
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onLoad={(e) =>
                setSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-primary-300">
              Chưa có
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100">
            {loading ? "Đang tải lên..." : "Chọn ảnh"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={loading} />
          </label>
          {value && !loading && (
            <button
              type="button"
              onClick={editCurrent}
              className="rounded-full px-4 py-2 text-sm font-semibold text-primary-600 ring-1 ring-primary-200 hover:bg-primary-50"
            >
              ✂ Cắt lại
            </button>
          )}
        </div>
      </div>
      {recommended && (
        <p className="mt-1.5 text-xs text-primary-900/50">
          Khuyến nghị: {recommended.width} × {recommended.height} px
          {value && size && (
            <>
              {" · "}Ảnh hiện tại:{" "}
              <span className={tooSmall ? "font-semibold text-amber-600" : "text-primary-900/70"}>
                {size.width} × {size.height} px
              </span>
            </>
          )}
        </p>
      )}
      {tooSmall && (
        <p className="mt-0.5 text-xs text-amber-600">Ảnh nhỏ hơn khuyến nghị, có thể bị mờ khi hiển thị.</p>
      )}
      {hint && <p className="mt-0.5 text-xs text-primary-900/50">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {cropping && (
        <ImageCropModal
          src={cropping.src}
          type={cropping.type}
          recommended={recommended}
          onCancel={closeCrop}
          onConfirm={handleCropped}
          onUseOriginal={cropping.file ? handleUseOriginal : undefined}
        />
      )}
    </div>
  );
}
