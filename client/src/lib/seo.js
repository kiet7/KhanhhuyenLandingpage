import { useEffect } from "react";
import { SITE_URL } from "./og.js";

function setMeta(selector, attr, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/);
    tag.setAttribute(key, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
}

// Đặt <title>, meta description và canonical cho từng trang public (Google đọc sau khi chạy JS).
// `path` là đường dẫn chuẩn trên domain chính, vd "/gioi-thieu".
export function usePageMeta({ title, description, path }) {
  // Canonical đặt ngay theo đường dẫn, không chờ dữ liệu (tránh trang khóa học trỏ canonical về trang chủ)
  useEffect(() => {
    if (path != null) setMeta('link[rel="canonical"]', "href", SITE_URL + path);
  }, [path]);

  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta('meta[name="description"]', "content", description);
  }, [title, description]);
}
