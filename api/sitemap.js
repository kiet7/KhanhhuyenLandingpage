// Vercel Function: sitemap.xml (vercel.json rewrite /sitemap.xml về đây) gồm các trang
// public và toàn bộ khóa học đang mở, để Google/Cốc Cốc tìm thấy mọi trang khóa học.
import { SITE_URL } from "../client/src/lib/og.js";
import { fetchCourses } from "./_course.js";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/gioi-thieu", priority: "0.9", changefreq: "monthly" },
  { path: "/khoa-hoc", priority: "0.9", changefreq: "weekly" },
];

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
  const courses = (await fetchCourses()) || [];
  const entries = [
    ...STATIC_PAGES,
    ...courses.map((c) => ({
      path: `/khoa-hoc/${encodeURIComponent(c.slug)}`,
      lastmod: c.updatedAt ? String(c.updatedAt).slice(0, 10) : undefined,
      priority: "0.8",
      changefreq: "weekly",
    })),
  ];

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", courses.length ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=60");
  res.end(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
      .map(urlEntry)
      .join("\n")}\n</urlset>\n`
  );
}
