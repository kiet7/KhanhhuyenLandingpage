// Bố cục ảnh chia sẻ khóa học 1200x630 (ảnh Open Graph Facebook/Zalo), mô phỏng CourseCard
// trên web nhưng xếp ngang. Viết dạng object { type, props } (không cần JSX) để dùng chung:
// - api/og-image.js đưa vào @vercel/og (satori) vẽ ra PNG
// - admin render cùng object này thành DOM để xem trước giống hệt ảnh thật
// Lưu ý satori: mọi div có nhiều con phải có display:flex; chỉ hỗ trợ một phần CSS flexbox.
import { formatPrice, formatDate } from "./format.js";
import { SITE_NAME, SITE_URL } from "./og.js";

export const CARD_SIZE = { width: 1200, height: 630 };
export const CARD_FONTS = [
  { name: "Baloo 2", weight: 800 },
  { name: "Be Vietnam Pro", weight: 400 },
  { name: "Be Vietnam Pro", weight: 600 },
];

const INSET = 36; // lề nền quanh card
const PAD = 28; // lề trong card
// Ảnh khóa học giữ tỉ lệ 16:9 như CourseCard (ảnh thường là poster có chữ, không nên cắt dọc)
const IMAGE_W = 640;
const IMAGE_H = 360;

const COLOR = {
  title: "#881c3d", // primary-900
  muted: "rgba(136, 28, 61, 0.62)",
  faint: "rgba(136, 28, 61, 0.5)",
  price: "#f2620d", // accent-600
};
// Cùng màu với components/ui/Badge.jsx
const BADGE = {
  "Sơ cấp": { background: "#ffefd1", color: "#c94a0d" },
  "Trung cấp": { background: "#ffe1e4", color: "#c31d4a" },
  "Cao cấp": { background: "rgba(251, 69, 112, 0.15)", color: "#a11c42" },
};

function el(type, style, children, attrs = {}) {
  return { type, props: { ...attrs, style, children } };
}

function cut(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

export function cloudinaryFill(url, width, height) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/c_fill,w_${width},h_${height},g_auto,q_auto,f_jpg/`);
}

function clockIcon() {
  return el(
    "svg",
    { width: 24, height: 24, marginRight: 10, flexShrink: 0 },
    [
      el("circle", undefined, undefined, { cx: 12, cy: 12, r: 9 }),
      el("path", undefined, undefined, { d: "M12 7.5V12l3 2", strokeLinecap: "round", strokeLinejoin: "round" }),
    ],
    { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }
  );
}

export function buildCourseCard(course, { logoUrl = `${SITE_URL}/logo.jpg` } = {}) {
  const domain = new URL(SITE_URL).hostname.replace(/^www\./, "");
  const badge = BADGE[course.level] || BADGE["Trung cấp"];
  const imageBox = { width: IMAGE_W, height: IMAGE_H, borderRadius: 24 };

  const image = course.imageUrl
    ? el("img", { ...imageBox, objectFit: "cover" }, undefined, {
        src: cloudinaryFill(course.imageUrl, IMAGE_W * 2, IMAGE_H * 2), // 2x cho ảnh nét
        width: IMAGE_W,
        height: IMAGE_H,
      })
    : el(
        "div",
        {
          ...imageBox,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #ffe1e4, #ffefd1)",
          color: "rgba(255,255,255,0.9)",
          fontSize: 180,
          fontFamily: "Baloo 2",
        },
        "中"
      );

  const brand = el("div", { display: "flex", alignItems: "center", fontSize: 22, color: COLOR.faint }, [
    el("img", { width: 44, height: 44, borderRadius: 999, marginRight: 14 }, undefined, {
      src: logoUrl,
      width: 44,
      height: 44,
    }),
    el("div", { display: "flex", fontWeight: 600, color: COLOR.title }, SITE_NAME),
    el("div", { display: "flex", marginLeft: 12 }, `· ${domain}`),
  ]);

  const details = [
    course.level &&
      el(
        "div",
        { display: "flex", alignSelf: "flex-start", borderRadius: 999, padding: "6px 18px", fontSize: 20, fontWeight: 600, ...badge },
        course.level
      ),
    el(
      "div",
      { display: "flex", marginTop: 14, fontFamily: "Baloo 2", fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: COLOR.title },
      cut(course.title, 48)
    ),
    course.shortDescription &&
      el("div", { display: "flex", marginTop: 10, fontSize: 22, lineHeight: 1.4, color: COLOR.muted }, cut(course.shortDescription, 90)),
    course.schedule &&
      el("div", { display: "flex", alignItems: "center", marginTop: 16, fontSize: 21, color: COLOR.faint }, [
        clockIcon(),
        el("div", { display: "flex" }, cut(course.schedule, 50)),
      ]),
    course.startDate &&
      el("div", { display: "flex", marginTop: 8, fontSize: 21, color: COLOR.faint }, `Khai giảng ${formatDate(course.startDate)}`),
    // đẩy giá xuống đáy card
    el("div", { display: "flex", flexGrow: 1 }, undefined),
    el("div", { display: "flex", alignItems: "flex-end", justifyContent: "space-between" }, [
      el("div", { display: "flex", fontFamily: "Baloo 2", fontWeight: 800, fontSize: 42, color: COLOR.price }, formatPrice(course.price)),
      course.durationWeeks
        ? el("div", { display: "flex", fontSize: 21, color: COLOR.faint, marginBottom: 8 }, `${course.durationWeeks} tuần`)
        : null,
    ].filter(Boolean)),
  ].filter(Boolean);

  return el(
    "div",
    {
      display: "flex",
      width: CARD_SIZE.width,
      height: CARD_SIZE.height,
      padding: INSET,
      backgroundImage: "linear-gradient(135deg, #fff1f2 0%, #fff8ed 100%)",
      fontFamily: "Be Vietnam Pro",
    },
    el(
      "div",
      {
        display: "flex",
        width: "100%",
        height: "100%",
        padding: PAD,
        borderRadius: 36,
        backgroundColor: "#ffffff",
        boxShadow: "0 12px 40px rgba(136, 28, 61, 0.12)",
      },
      [
        el("div", { display: "flex", flexDirection: "column", justifyContent: "space-between", width: IMAGE_W }, [
          image,
          brand,
        ]),
        el("div", { display: "flex", flexDirection: "column", flex: 1, marginLeft: 32, paddingTop: 4 }, details),
      ]
    )
  );
}

// Gom toàn bộ chữ trong bố cục để tải font Google chỉ với các ký tự cần (subset nhỏ, nhanh).
export function collectText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join("");
  return collectText(node.props?.children);
}
