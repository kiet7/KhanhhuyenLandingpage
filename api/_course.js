// Dùng chung cho các Vercel Function: lấy khóa học từ backend Render.
// File bắt đầu bằng "_" nên Vercel không biến nó thành endpoint.
const API_URL = (process.env.VITE_API_URL || "https://khanhhuyenlandingpageserver.onrender.com").replace(/\/$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const API_TIMEOUT_MS = 8000; // backend Render có thể đang khởi động lại; quá hạn thì bỏ qua

export async function fetchCourse(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(`${API_BASE}/courses/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export function requestOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}
