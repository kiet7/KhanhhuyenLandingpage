// Vercel Function: vẽ ảnh chia sẻ 1200x630 cho khóa học, giống card khóa học trên web.
// Được tham chiếu từ thẻ og:image do api/og.js trả cho Facebook/Zalo.
import { ImageResponse } from "@vercel/og";
import { buildCourseCard, collectText, CARD_FONTS, CARD_SIZE } from "../client/src/lib/ogCard.js";
import { fetchCourse, requestOrigin } from "./_api.js";

// Tải font từ Google Fonts, chỉ gồm các ký tự cần vẽ (Google trả TTF khi user-agent không phải trình duyệt).
async function loadGoogleFont(family, weight, text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const fontUrl = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!fontUrl) throw new Error(`Không tải được font ${family} ${weight}`);
  return (await fetch(fontUrl)).arrayBuffer();
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const origin = requestOrigin(req);
  const course = await fetchCourse(url.searchParams.get("slug"));

  if (!course) {
    // Không lấy được khóa học (sai slug hoặc backend chưa thức): dùng logo, cache ngắn để thử lại
    res.statusCode = 302;
    res.setHeader("Location", `${origin}/logo.jpg`);
    res.setHeader("Cache-Control", "public, s-maxage=60");
    return res.end();
  }

  const card = buildCourseCard(course, { logoUrl: `${origin}/logo.jpg` });
  const text = collectText(card) + "0123456789.,·…";
  const fonts = await Promise.all(
    CARD_FONTS.map(async (f) => ({
      name: f.name,
      weight: f.weight,
      style: "normal",
      data: await loadGoogleFont(f.name, f.weight, text),
    }))
  );

  const image = new ImageResponse(card, { ...CARD_SIZE, fonts });
  const buffer = Buffer.from(await image.arrayBuffer());

  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  // URL ảnh có tham số v=<thời điểm sửa khóa học> nên cache lâu được; sửa khóa học sẽ ra URL mới
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=31536000, immutable");
  res.end(buffer);
}
