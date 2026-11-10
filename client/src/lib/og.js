// Dữ liệu Open Graph (thẻ chia sẻ Facebook/Zalo/Messenger) cho khóa học.
// Dùng chung cho serverless function `api/og.js` (render thẻ <meta> cho bot) và
// khung xem trước trong admin, để admin thấy đúng những gì Facebook sẽ hiển thị.
import { formatPrice } from "./format.js";

export const SITE_NAME = "Khánh Huyền Chinese";
// Tên dùng trong tiêu đề trang/kết quả tìm kiếm — chứa cụm người dùng hay tìm ("cô Huyền tiếng Trung")
export const BRAND = "Cô Huyền Tiếng Trung";
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

export function courseUrl(course) {
  return `${SITE_URL}/khoa-hoc/${course.slug}`;
}

// Ảnh chia sẻ dạng card khóa học do api/og-image.js vẽ (bố cục ở lib/ogCard.js).
// v = thời điểm sửa khóa học: sửa xong là ra URL ảnh mới, không bị cache ảnh cũ.
export function courseImageUrl(course, origin = SITE_URL) {
  const version = Date.parse(course.updatedAt) || "";
  return `${origin}/api/og-image?slug=${encodeURIComponent(course.slug)}&v=${version}`;
}

export function postUrl(post) {
  return `${SITE_URL}/bai-viet/${post.slug}`;
}

// Thẻ chia sẻ cho bài viết: ảnh bìa cắt về 1200x630 (ảnh bìa nên có sẵn tỉ lệ này), không có thì dùng logo.
export function buildPostOg(post, { origin = SITE_URL } = {}) {
  const cover = post.coverUrl?.includes("res.cloudinary.com")
    ? post.coverUrl.replace("/image/upload/", `/image/upload/c_fill,w_${OG_IMAGE.width},h_${OG_IMAGE.height},g_auto,q_auto,f_jpg/`)
    : post.coverUrl;
  return {
    title: post.title,
    description: truncate(post.excerpt || String(post.content || "").replace(/[#>*_`[\]()!-]/g, " "), DESCRIPTION_MAX),
    image: cover || `${origin}/logo.jpg`,
    url: postUrl(post),
  };
}

export function buildCourseOg(course, { origin = SITE_URL } = {}) {
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
    image: courseImageUrl(course, origin),
    url: courseUrl(course),
  };
}
