// Dữ liệu Open Graph (thẻ chia sẻ Facebook/Zalo/Messenger) cho khóa học.
// Dùng chung cho serverless function `api/og.js` (render thẻ <meta> cho bot) và
// khung xem trước trong admin, để admin thấy đúng những gì Facebook sẽ hiển thị.
import { formatPrice } from "./format.js";

export const SITE_NAME = "Khánh Huyền Chinese";
export const SITE_URL = "https://www.cohuyentiengtrung.blog";
export const SITE_DESCRIPTION =
  "Học tiếng Trung cùng cô Khánh Huyền — giao tiếp, luyện thi HSK/HSKK tại Đà Nẵng và online.";
export const OG_IMAGE = { width: 1200, height: 630 }; // tỉ lệ 1.91:1 Facebook khuyến nghị
const DESCRIPTION_MAX = 200;

function truncate(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

function formatDay(value) {
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// Ảnh Cloudinary: cắt sẵn về 1200x630 (g_auto giữ chủ thể) để Facebook hiển thị ảnh lớn, không bị cắt lệch.
export function ogImageUrl(url) {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  return url.replace(
    "/image/upload/",
    `/image/upload/c_fill,w_${OG_IMAGE.width},h_${OG_IMAGE.height},g_auto,q_auto,f_jpg/`
  );
}

export function courseUrl(course) {
  return `${SITE_URL}/khoa-hoc/${course.slug}`;
}

export function buildCourseOg(course) {
  const facts = [
    course.level,
    course.startDate && `Khai giảng ${formatDay(course.startDate)}`,
    course.price ? `Học phí ${formatPrice(course.price)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const intro = (course.shortDescription || course.description || "").trim().replace(/[.。]$/, "");
  return {
    title: course.title,
    description: truncate([intro, facts].filter(Boolean).join(" — "), DESCRIPTION_MAX),
    image: ogImageUrl(course.imageUrl),
    url: courseUrl(course),
  };
}
