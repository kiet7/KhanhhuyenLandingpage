import { buildCourseOg, OG_IMAGE, SITE_URL } from "../../lib/og";

// Mô phỏng thẻ link khi chia sẻ khóa học lên Facebook, dựng từ cùng dữ liệu Open Graph
// mà api/og.js trả cho Facebook. Facebook cắt tiêu đề ~2 dòng, mô tả ~1 dòng.
export default function FacebookPreview({ course }) {
  const og = buildCourseOg({ ...course, slug: course.slug || "ten-khoa-hoc" });
  const domain = new URL(SITE_URL).hostname.replace(/^www\./, "").toUpperCase();

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-primary-900">Xem trước khi chia sẻ lên Facebook</p>
      <div className="max-w-md overflow-hidden rounded-lg border border-gray-300 bg-white font-[Helvetica,Arial,sans-serif]">
        <div className="aspect-[1.91/1] w-full bg-gray-100">
          {og.image ? (
            <img src={og.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              Chưa có ảnh khóa học — Facebook sẽ không có ảnh lớn
            </div>
          )}
        </div>
        <div className="border-t border-gray-300 bg-[#F0F2F5] px-3 py-2">
          <p className="truncate text-xs text-[#65676B]">{domain}</p>
          <p className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#050505]">
            {og.title || "Tên khóa học"}
          </p>
          <p className="line-clamp-1 text-sm text-[#65676B]">{og.description || "Mô tả ngắn của khóa học"}</p>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-primary-900/50">
        Tiêu đề lấy từ tên khóa học; mô tả từ "Mô tả ngắn" kèm trình độ, ngày khai giảng, học phí; ảnh
        được cắt tự động về {OG_IMAGE.width}×{OG_IMAGE.height}. Facebook có thể lưu bản cũ — sau khi sửa, dán link vào{" "}
        <a
          href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(og.url)}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary-600 hover:underline"
        >
          Facebook Sharing Debugger
        </a>{" "}
        và bấm "Scrape Again" để cập nhật.
      </p>
    </div>
  );
}
