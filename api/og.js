// Vercel Function: trả index.html có sẵn thẻ Open Graph của khóa học cho bot mạng xã hội.
// Facebook/Zalo không chạy JavaScript nên không đọc được nội dung SPA; vercel.json chỉ
// rewrite /khoa-hoc/:slug về đây khi user-agent là bot, người dùng thường vẫn nhận SPA tĩnh.
import { BRAND, SITE_NAME, SITE_URL, OG_IMAGE, buildCourseOg } from "../client/src/lib/og.js";
import { fetchCourse, requestOrigin } from "./_course.js";

// Schema Course cho Google (kết quả tìm kiếm dạng khóa học). Nhà cung cấp trỏ tới Person
// khai báo trong index.html (#person).
function courseJsonLd(course, og) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: og.description,
    url: og.url,
    inLanguage: "vi-VN",
    educationalLevel: course.level,
    provider: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "Hồ Thị Khánh Huyền" },
    ...(course.price
      ? { offers: { "@type": "Offer", price: course.price, priceCurrency: "VND", category: "Paid" } }
      : {}),
  };
  // Chặn "</script>" trong dữ liệu làm vỡ thẻ script
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function metaTags(og, course) {
  const tags = [
    `<title>${escapeHtml(og.title)} | ${escapeHtml(BRAND)}</title>`,
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
  tags.push(courseJsonLd(course, og));
  return tags.join("\n    ");
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("slug") || "";
  const origin = requestOrigin(req);

  const [html, course] = await Promise.all([
    fetch(`${origin}/index.html`).then((r) => r.text()),
    fetchCourse(slug),
  ]);

  const page = course
    ? html.replace(
        /<!-- og:start[\s\S]*?<!-- og:end -->/,
        // Ảnh lấy từ cùng domain mà bot đang đọc, tránh phụ thuộc DNS của domain khác
        `<!-- og:start -->\n    ${metaTags(buildCourseOg(course, { origin }), course)}\n    <!-- og:end -->`
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
