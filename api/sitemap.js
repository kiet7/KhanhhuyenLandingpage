// Vercel Function: sitemap.xml (vercel.json rewrite /sitemap.xml về đây) gồm các trang
// public, toàn bộ khóa học đang mở và bài viết đã xuất bản, để Google/Cốc Cốc tìm thấy mọi trang.
import { SITE_URL } from "../client/src/lib/og.js";
import { fetchCourses, fetchPosts } from "./_api.js";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/gioi-thieu", priority: "0.9", changefreq: "monthly" },
  { path: "/khoa-hoc", priority: "0.9", changefreq: "weekly" },
  { path: "/bai-viet", priority: "0.8", changefreq: "weekly" },
];

const day = (date) => (date ? String(date).slice(0, 10) : undefined);

function urlEntry({ path, lastmod, priority, changefreq }) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export default async function handler(req, res) {
  const [courses, posts] = await Promise.all([fetchCourses(), fetchPosts()]);
  const entries = [
    ...STATIC_PAGES,
    ...(courses || []).map((c) => ({
      path: `/khoa-hoc/${encodeURIComponent(c.slug)}`,
      lastmod: day(c.updatedAt),
      priority: "0.8",
      changefreq: "weekly",
    })),
    ...(posts || []).map((p) => ({
      path: `/bai-viet/${encodeURIComponent(p.slug)}`,
      lastmod: day(p.updatedAt),
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];
  const complete = courses !== null && posts !== null;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Backend chưa thức thì sitemap thiếu trang → cache ngắn để lần sau lấy đủ
  res.setHeader("Cache-Control", complete ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=60");
  res.end(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
      .map(urlEntry)
      .join("\n")}\n</urlset>\n`
  );
}
