import mongoose from "mongoose";

// Bài viết blog (hướng dẫn học tiếng Trung...) — nội dung soạn bằng Markdown.
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" }, // mô tả ngắn: hiện ở danh sách + meta description
    content: { type: String, default: "" }, // Markdown
    coverUrl: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null }, // tự đặt lần đầu xuất bản
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
