import { useState } from "react";
import { uploadImage } from "../../api/upload";

export default function ImageUploader({ value, onChange, label }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  return (
    <div>
      {label && <p className="mb-1 text-sm font-semibold text-primary-900">{label}</p>}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-50 ring-1 ring-primary-100">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-primary-300">
              Chưa có
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100">
          {loading ? "Đang tải lên..." : "Chọn ảnh"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={loading} />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
