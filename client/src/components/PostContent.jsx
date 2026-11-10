import DOMPurify from "dompurify";
import { markdownToHtml } from "../lib/markdown";

// Nội dung bài viết (Markdown → HTML đã lọc XSS). Định dạng chữ ở class .post-content (index.css).
export default function PostContent({ markdown, className = "" }) {
  const html = DOMPurify.sanitize(markdownToHtml(markdown));
  return <div className={`post-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
