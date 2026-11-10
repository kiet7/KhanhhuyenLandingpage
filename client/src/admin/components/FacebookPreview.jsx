import { createElement, useEffect, useRef, useState } from "react";
import { buildCourseOg, SITE_URL } from "../../lib/og";
import { buildCourseCard, CARD_SIZE } from "../../lib/ogCard";

// Đổi bố cục dạng { type, props } (lib/ogCard.js) thành phần tử React để vẽ trong trình duyệt.
function toReact(node) {
  if (node == null || typeof node !== "object") return node;
  const { children, ...props } = node.props;
  const kids = children === undefined ? [] : [].concat(children);
  return createElement(node.type, props, ...kids.map(toReact));
}

// Mô phỏng bài chia sẻ khóa học trên Facebook: ảnh card (cùng bố cục với ảnh thật do
// api/og-image.js vẽ) + tiêu đề/mô tả từ thẻ Open Graph. Facebook cắt tiêu đề ~2 dòng, mô tả ~1 dòng.
export default function FacebookPreview({ course }) {
  const boxRef = useRef(null);
  const [scale, setScale] = useState(0.37);
  const og = buildCourseOg({ ...course, slug: course.slug || "ten-khoa-hoc" });
  const domain = new URL(SITE_URL).hostname.replace(/^www\./, "").toUpperCase();

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / CARD_SIZE.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-primary-900">Xem trước khi chia sẻ lên Facebook</p>
      <div className="max-w-md overflow-hidden rounded-lg border border-gray-300 bg-white font-[Helvetica,Arial,sans-serif]">
        <div ref={boxRef} className="relative w-full overflow-hidden" style={{ aspectRatio: "1200 / 630" }}>
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: CARD_SIZE.width, height: CARD_SIZE.height, transform: `scale(${scale})` }}
          >
            {toReact(buildCourseCard(course))}
          </div>
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
        Ảnh chia sẻ được tạo tự động giống card khóa học (tên, trình độ, lịch học, khai giảng, học phí). Lịch
        học tự sinh từ ngày/giờ chỉ hiện sau khi lưu. Facebook có thể lưu bản cũ — sau khi sửa, dán link vào{" "}
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
