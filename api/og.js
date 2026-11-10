// Vercel Function: trả index.html có sẵn thẻ meta/Open Graph + JSON-LD của khóa học hoặc bài viết
// cho bot (Facebook/Zalo không chạy JavaScript; Google/Cốc Cốc đọc nhanh và chắc hơn).
// vercel.json chỉ rewrite /khoa-hoc/:slug và /bai-viet/:slug về đây khi user-agent là bot,
// người dùng thường vẫn nhận SPA tĩnh.
import { BRAND, SITE_NAME, SITE_URL, OG_IMAGE, buildCourseOg, buildPostOg } from "../client/src/lib/og.js";
import { markdownToHtml } from "../client/src/lib/markdown.js";
import { fetchCourse, fetchPost, requestOrigin } from "./_api.js";

const AUTHOR = { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "Hồ Thị Khánh Huyền" };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function jsonLdTag(data) {
  // Chặn "</script>" trong dữ liệu làm vỡ thẻ script
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

// Schema Course cho Google (kết quả tìm kiếm dạng khóa học)
function courseJsonLd(course, og) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: og.description,
    url: og.url,
    inLanguage: "vi-VN",
    educationalLevel: course.level,
    provider: AUTHOR,
    ...(course.price
      ? { offers: { "@type": "Offer", price: course.price, priceCurrency: "VND", category: "Paid" } }
      : {}),
  };
}

// Schema BlogPosting cho bài viết
function postJsonLd(post, og) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: og.description,
    url: og.url,
    mainEntityOfPage: og.url,
    image: og.image,
    inLanguage: "vi-VN",
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    keywords: (post.tags || []).join(", "),
    author: AUTHOR,
    publisher: AUTHOR,
  };
}

function metaTags(og, { type = "website", jsonLd, publishedTime }) {
  const tags = [
    `<title>${escapeHtml(og.title)} | ${escapeHtml(BRAND)}</title>`,
    `<meta name="description" content="${escapeHtml(og.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(og.url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="vi_VN" />`,
    `<meta property="og:title" content="${escapeHtml(og.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(og.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(og.url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (publishedTime) tags.push(`<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`);
  if (og.image) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(og.image)}" />`,
      `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
      `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(og.title)}" />`
    );
  }
  tags.push(jsonLdTag(jsonLd));
  return tags.join("\n    ");
}

// Dựng phần <head> (và nội dung bài cho bot) theo loại trang. null = không lấy được dữ liệu.
async function buildPage(type, slug, origin) {
  if (type === "post") {
    const post = await fetchPost(slug);
    if (!post) return null;
    const og = buildPostOg(post, { origin });
    return {
      head: metaTags(og, { type: "article", jsonLd: postJsonLd(post, og), publishedTime: post.publishedAt }),
      // Nội dung bài render sẵn vào #root cho bot không chạy JS; React sẽ thay thế khi chạy
      body: `<article><h1>${escapeHtml(post.title)}</h1>${markdownToHtml(post.content)}</article>`,
    };
  }
  const course = await fetchCourse(slug);
  if (!course) return null;
  const og = buildCourseOg(course, { origin });
  return {
    head: metaTags(og, { jsonLd: courseJsonLd(course, og) }),
    body: `<article><h1>${escapeHtml(course.title)}</h1><p>${escapeHtml(og.description)}</p></article>`,
  };
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("slug") || "";
  const type = url.searchParams.get("type") === "post" ? "post" : "course";
  const origin = requestOrigin(req);

  const [html, page] = await Promise.all([
    fetch(`${origin}/index.html`).then((r) => r.text()),
    buildPage(type, slug, origin),
  ]);

  const out = page
    ? html
        .replace(/<!-- og:start[\s\S]*?<!-- og:end -->/, `<!-- og:start -->\n    ${page.head}\n    <!-- og:end -->`)
        .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`)
    : html; // không lấy được dữ liệu: giữ thẻ mặc định của site

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Cache ở CDN để lần sau không phải gọi backend; lỗi thì cache ngắn để thử lại sớm
  res.setHeader("Cache-Control", page ? "public, s-maxage=600, stale-while-revalidate=86400" : "public, s-maxage=60");
  res.end(out);
}
