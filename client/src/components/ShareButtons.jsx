import { useState } from "react";

const FB_SHARE_URL = "https://www.facebook.com/sharer/sharer.php?u=";

// Nút chia sẻ link lên Facebook + sao chép link. Nội dung thẻ hiển thị trên Facebook
// (tiêu đề, mô tả, ảnh) do api/og.js render từ dữ liệu khóa học.
export default function ShareButtons({ url }) {
  const [copied, setCopied] = useState(false);

  function shareFacebook() {
    const w = 600;
    const h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    // Không dùng "noopener" trong features: khi đó window.open luôn trả về null, không phân biệt
    // được popup bị chặn. Cắt liên kết opener thủ công sau khi mở.
    const popup = window.open(
      FB_SHARE_URL + encodeURIComponent(url),
      "fb-share",
      `width=${w},height=${h},left=${left},top=${top}`
    );
    if (popup) popup.opener = null;
    else window.location.href = FB_SHARE_URL + encodeURIComponent(url); // popup bị chặn (thường trên điện thoại)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Sao chép link khóa học:", url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-primary-900/50">Chia sẻ:</span>
      <button
        type="button"
        onClick={shareFacebook}
        className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
        </svg>
        Facebook
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100"
      >
        {copied ? "✓ Đã sao chép" : "🔗 Sao chép link"}
      </button>
    </div>
  );
}
