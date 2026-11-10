// Cache dữ liệu public (profile, khóa học) trong localStorage để lần truy cập sau
// hiển thị ngay, không phải chờ backend Render khởi động lại (cold start ~30-60s).
// Dữ liệu luôn được gọi API lại ở nền và ghi đè khi có kết quả mới.
const PREFIX = "kh-cache:";

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    // localStorage đầy hoặc bị chặn — bỏ qua, chỉ mất tính năng cache
  }
}
