import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PostContent from "../../components/PostContent";
import ImageUploader from "./ImageUploader";
import ImageCropModal from "./ImageCropModal";
import { uploadImage } from "../../api/upload";
import { readingMinutes } from "../../lib/markdown";
import { BRAND, SITE_URL } from "../../lib/og";

export const emptyPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  tags: [],
  published: false,
};

// Google thường hiển thị ~60 ký tự tiêu đề và ~155 ký tự mô tả
const TITLE_LIMIT = 60;
const EXCERPT_LIMIT = 155;

const inputClass =
  "w-full rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400";

// Nút thanh công cụ: wrap = bọc vùng chọn, line = thêm tiền tố đầu dòng
const TOOLS = [
  { label: "H2", title: "Tiêu đề mục lớn", line: "## " },
  { label: "H3", title: "Tiêu đề mục nhỏ", line: "### " },
  { label: "B", title: "In đậm", wrap: ["**", "**", "chữ đậm"], className: "font-bold" },
  { label: "I", title: "In nghiêng", wrap: ["*", "*", "chữ nghiêng"], className: "italic" },
  { label: "• Danh sách", title: "Danh sách gạch đầu dòng", line: "- " },
  { label: "1. Danh sách", title: "Danh sách đánh số", line: "1. " },
  { label: "❝ Trích dẫn", title: "Trích dẫn / ghi chú nổi bật", line: "> " },
  { label: "🔗 Link", title: "Chèn liên kết", wrap: ["[", "](https://)", "chữ hiển thị"] },
];

function CharCount({ value, limit }) {
  const over = value.length > limit;
  return (
    <span className={`text-xs ${over ? "font-semibold text-amber-600" : "text-primary-900/40"}`}>
      {value.length}/{limit}
      {over && " – Google có thể cắt bớt"}
    </span>
  );
}

function Field({ label, hint, extra, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="flex items-center justify-between gap-2 text-sm font-semibold text-primary-900">
        {label}
        {extra}
      </span>
      {children}
      {hint && <span className="text-xs text-primary-900/50">{hint}</span>}
    </label>
  );
}

export default function PostForm({ initial, onSubmit, saving = false }) {
  const [form, setForm] = useState({ ...emptyPost, ...initial });
  const [tagsText, setTagsText] = useState((initial.tags || []).join(", "));
  const [tab, setTab] = useState("write");
  const [cropping, setCropping] = useState(null); // ảnh đang chèn vào nội dung
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  function setContent(content) {
    setForm((f) => ({ ...f, content }));
  }

  // Chèn/bọc Markdown tại vị trí con trỏ trong textarea
  function applyTool(tool) {
    const ta = textareaRef.current;
    const { selectionStart: start, selectionEnd: end, value } = ta;
    let next;
    let cursorStart;
    let cursorEnd;
    if (tool.wrap) {
      const [before, after, placeholder] = tool.wrap;
      const selected = value.slice(start, end) || placeholder;
      next = value.slice(0, start) + before + selected + after + value.slice(end);
      cursorStart = start + before.length;
      cursorEnd = cursorStart + selected.length;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end);
      const prefixed = block
        .split("\n")
        .map((l) => tool.line + l.replace(/^(#{1,6} |[-*] |\d+\. |> )/, ""))
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(end);
      cursorStart = cursorEnd = lineStart + prefixed.length;
    }
    // Cập nhật đồng bộ rồi đặt lại con trỏ ngay, để chữ gõ tiếp theo vào đúng chỗ
    flushSync(() => setContent(next));
    ta.focus();
    ta.setSelectionRange(cursorStart, cursorEnd);
  }

  function insertAtCursor(text) {
    const ta = textareaRef.current;
    const pos = ta ? ta.selectionStart : form.content.length;
    setForm((f) => ({ ...f, content: f.content.slice(0, pos) + text + f.content.slice(pos) }));
  }

  function handleImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropping({ src: URL.createObjectURL(file), type: file.type === "image/png" ? "image/png" : "image/jpeg", file });
  }

  async function uploadAndInsert(file) {
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      insertAtCursor(`\n![${form.title || "Hình minh họa"}](${url})\n`);
    } catch {
      alert("Upload ảnh thất bại. Kiểm tra cấu hình Cloudinary.");
    } finally {
      setUploading(false);
    }
  }

  function closeCrop() {
    URL.revokeObjectURL(cropping.src);
    setCropping(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    });
  }

  const previewSlug = form.slug || "duong-dan-tu-tao";
  const minutes = readingMinutes(form.content);
  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-6">
        <Field
          label="Tiêu đề bài viết *"
          extra={<CharCount value={form.title} limit={TITLE_LIMIT} />}
          hint="Nên chứa từ khóa người đọc hay tìm, vd: “Cách học tiếng Trung cho người mới bắt đầu”."
        >
          <input
            required
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="VD: 5 mẹo nhớ 214 bộ thủ tiếng Trung nhanh"
            className={inputClass}
          />
        </Field>

        <Field
          label="Mô tả ngắn"
          extra={<CharCount value={form.excerpt} limit={EXCERPT_LIMIT} />}
          hint="Hiện ở danh sách bài viết, kết quả Google và khi chia sẻ Facebook."
        >
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={2}
            placeholder="Tóm tắt 1–2 câu nội dung bài viết"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Đường dẫn (slug)" hint="Để trống sẽ tự tạo từ tiêu đề.">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="vd: meo-nho-bo-thu"
              className={inputClass}
            />
          </Field>
          <Field label="Thẻ phân loại" hint="Cách nhau bằng dấu phẩy, vd: HSK, Từ vựng, Kinh nghiệm học.">
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="HSK, Từ vựng"
              className={inputClass}
            />
          </Field>
        </div>

        <ImageUploader
          label="Ảnh bìa"
          value={form.coverUrl}
          onChange={(url) => setForm((f) => ({ ...f, coverUrl: url }))}
          recommended={{ width: 1200, height: 630 }}
          previewClassName="h-20 w-38"
          hint="Ảnh ngang 1.91:1 – dùng làm ảnh đầu bài và ảnh khi chia sẻ Facebook/Zalo."
        />

        {/* Xem trước kết quả trên Google */}
        <div>
          <p className="mb-1 text-sm font-semibold text-primary-900">Xem trước trên Google</p>
          <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-4 font-[Arial,sans-serif]">
            <p className="truncate text-xs text-[#202124]">
              {SITE_URL.replace("https://", "")} › bai-viet › {previewSlug}
            </p>
            <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">
              {form.title || "Tiêu đề bài viết"} | {BRAND}
            </p>
            <p className="line-clamp-2 text-sm text-[#4d5156]">{form.excerpt || "Mô tả ngắn của bài viết…"}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-full bg-primary-50 p-1">
            {[
              ["write", "Soạn bài"],
              ["preview", "Xem trước"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  tab === value ? "bg-white text-primary-700 shadow-sm" : "text-primary-900/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-primary-900/50">
            {words} từ · ~{minutes} phút đọc
          </span>
        </div>

        {tab === "write" ? (
          <>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  title={tool.title}
                  onClick={() => applyTool(tool)}
                  className={`rounded-lg bg-primary-50 px-3 py-1.5 text-sm text-primary-700 hover:bg-primary-100 ${tool.className || ""}`}
                >
                  {tool.label}
                </button>
              ))}
              <button
                type="button"
                title="Chèn ảnh vào vị trí con trỏ"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-lg bg-accent-100 px-3 py-1.5 text-sm font-semibold text-accent-700 hover:bg-accent-200"
              >
                {uploading ? "Đang tải ảnh..." : "🖼 Chèn ảnh"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </div>
            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              placeholder={"Viết nội dung bài ở đây...\n\n## Tiêu đề mục\nĐoạn văn bình thường. **Chữ đậm**, *chữ nghiêng*.\n\n- Ý thứ nhất\n- Ý thứ hai"}
              className={`${inputClass} mt-3 font-mono text-sm leading-relaxed`}
            />
            <p className="mt-2 text-xs text-primary-900/50">
              Mẹo SEO: chia bài thành nhiều mục <b>## Tiêu đề mục</b>, nhắc từ khóa chính 2–3 lần một cách tự nhiên, bài
              nên dài từ 600 từ trở lên, và cuối bài gợi ý khóa học phù hợp.
            </p>
          </>
        ) : (
          <div className="mt-6 min-h-60 rounded-2xl bg-cream-50 p-4 sm:p-6">
            {form.content.trim() ? (
              <PostContent markdown={form.content} />
            ) : (
              <p className="text-sm text-primary-900/40">Chưa có nội dung.</p>
            )}
          </div>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <label className="flex items-center gap-3 text-sm text-primary-900">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4 accent-primary-500"
          />
          <span>
            <b>Xuất bản</b> – hiển thị công khai trên website
            <span className="block text-xs text-primary-900/50">Bỏ chọn để lưu nháp (chỉ admin xem được).</span>
          </span>
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : form.published ? "Lưu & xuất bản" : "Lưu nháp"}
        </Button>
      </Card>

      {cropping && (
        <ImageCropModal
          src={cropping.src}
          type={cropping.type}
          onCancel={closeCrop}
          onConfirm={async (blob) => {
            closeCrop();
            await uploadAndInsert(new File([blob], `image.${blob.type === "image/png" ? "png" : "jpg"}`, { type: blob.type }));
          }}
          onUseOriginal={() => {
            const file = cropping.file;
            closeCrop();
            uploadAndInsert(file);
          }}
        />
      )}
    </form>
  );
}
