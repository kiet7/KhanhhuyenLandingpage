// Dùng chung cho các Vercel Function: đọc dữ liệu public từ backend Render.
// File bắt đầu bằng "_" nên Vercel không biến nó thành endpoint.
const API_URL = (process.env.VITE_API_URL || "https://khanhhuyenlandingpageserver.onrender.com").replace(/\/$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const API_TIMEOUT_MS = 8000; // backend Render có thể đang khởi động lại; quá hạn thì bỏ qua

// null nếu không tìm thấy hoặc backend không phản hồi kịp
async function fetchJson(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export const fetchCourses = () => fetchJson("/courses");
export const fetchCourse = (slug) => (slug ? fetchJson(`/courses/${encodeURIComponent(slug)}`) : null);
export const fetchPosts = () => fetchJson("/posts");
export const fetchPost = (slug) => (slug ? fetchJson(`/posts/${encodeURIComponent(slug)}`) : null);

export function requestOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}
