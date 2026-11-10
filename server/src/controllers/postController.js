import Post from "../models/Post.js";
import { isAdminRequest } from "../middleware/auth.js";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Chuẩn hóa dữ liệu gửi lên từ form admin
function normalize(data, existing) {
  if (data.slug !== undefined || !existing) data.slug = slugify(data.slug || data.title || "");
  if (Array.isArray(data.tags)) data.tags = data.tags.map((t) => t.trim()).filter(Boolean);
  // Lần đầu xuất bản thì ghi lại ngày đăng (giữ nguyên nếu đã có)
  if (data.published && !(existing?.publishedAt || data.publishedAt)) data.publishedAt = new Date();
  if (data.publishedAt === "") data.publishedAt = null;
  return data;
}

// Public: chỉ bài đã xuất bản, không kèm nội dung (nhẹ). Admin (?all=true + đăng nhập): cả bài nháp.
export async function listPosts(req, res) {
  const all = req.query.all === "true" && isAdminRequest(req);
  const filter = all ? {} : { published: true };
  const posts = await Post.find(filter)
    .select(all ? "" : "-content")
    .sort({ publishedAt: -1, createdAt: -1 });
  res.json(posts);
}

export async function getPostBySlug(req, res) {
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post || (!post.published && !isAdminRequest(req))) {
    return res.status(404).json({ message: "Không tìm thấy bài viết" });
  }
  res.json(post);
}

export async function createPost(req, res) {
  const post = await Post.create(normalize({ ...req.body }));
  res.status(201).json(post);
}

export async function updatePost(req, res) {
  const existing = await Post.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy bài viết" });
  }
  existing.set(normalize({ ...req.body }, existing));
  await existing.save();
  res.json(existing);
}

export async function deletePost(req, res) {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Không tìm thấy bài viết" });
  }
  res.json({ message: "Đã xóa bài viết" });
}
