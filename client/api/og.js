// Vercel Function: trả index.html có sẵn thẻ Open Graph của khóa học cho bot mạng xã hội.
// Facebook/Zalo không chạy JavaScript nên không đọc được nội dung SPA; vercel.json chỉ
// rewrite /khoa-hoc/:slug về đây khi user-agent là bot, người dùng thường vẫn nhận SPA tĩnh.
import { SITE_NAME, OG_IMAGE, buildCourseOg } from "../src/lib/og.js";

const API_URL = (process.env.VITE_API_URL || "https://khanhhuyenlandingpageserver.onrender.com").replace(/\/$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const API_TIMEOUT_MS = 8000; // backend Render có thể đang khởi động lại; quá hạn thì dùng thẻ mặc định

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function metaTags(og) {
  const tags = [
    `<title>${escapeHtml(og.title)} | ${escapeHtml(SITE_NAME)}</title>`,
    `<meta name="description" content="${escapeHtml(og.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(og.url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="vi_VN" />`,
    `<meta property="og:title" content="${escapeHtml(og.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(og.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(og.url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (og.image) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(og.image)}" />`,
      `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
      `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(og.title)}" />`
    );
  }
  return tags.join("\n    ");
}

async function fetchCourse(slug) {
  try {
    const res = await fetch(`${API_BASE}/courses/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("slug") || "";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;

  const [html, course] = await Promise.all([
    fetch(`${origin}/index.html`).then((r) => r.text()),
    slug ? fetchCourse(slug) : null,
  ]);

  const page = course
    ? html.replace(
        /<!-- og:start[\s\S]*?<!-- og:end -->/,
        `<!-- og:start -->\n    ${metaTags(buildCourseOg(course))}\n    <!-- og:end -->`
      )
    : html; // không lấy được khóa học: giữ thẻ mặc định của site

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Cache ở CDN để lần chia sẻ sau không phải gọi backend; lỗi thì cache ngắn để thử lại sớm
  res.setHeader(
    "Cache-Control",
    course ? "public, s-maxage=600, stale-while-revalidate=86400" : "public, s-maxage=60"
  );
  res.end(page);
}
