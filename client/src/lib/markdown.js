// Chuyển nội dung bài viết (Markdown) sang HTML. Dùng chung cho trang bài viết trên trình
// duyệt (lọc thêm qua DOMPurify trong components/PostContent.jsx) và api/og.js (render sẵn
// nội dung cho bot tìm kiếm không chạy JavaScript).
import { marked } from "marked";

export function markdownToHtml(markdown) {
  return marked.parse(markdown || "", { gfm: true, breaks: true, async: false });
}

// Ước tính thời gian đọc (~200 từ/phút)
export function readingMinutes(markdown) {
  const words = String(markdown || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
