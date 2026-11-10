import { useEffect, useState } from "react";
import { listPosts, getPostBySlug, createPost, updatePost, deletePost } from "../../api/posts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import PostForm, { emptyPost } from "../components/PostForm";
import { formatDate } from "../../lib/format";

export default function ManagePosts() {
  const [posts, setPosts] = useState(null);
  const [editing, setEditing] = useState(null); // null = list view, object = form view
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    listPosts(true).then(setPosts);
  }

  useEffect(refresh, []);

  function startCreate() {
    setError("");
    setEditing({ ...emptyPost });
  }

  async function startEdit(post) {
    setError("");
    // danh sách có thể không kèm nội dung đầy đủ → lấy lại bài theo slug
    setEditing(post.content !== undefined ? { ...post } : await getPostBySlug(post.slug));
  }

  async function handleSave(payload) {
    setSaving(true);
    setError("");
    try {
      if (editing._id) {
        await updatePost(editing._id, payload);
      } else {
        await createPost(payload);
      }
      setEditing(null);
      refresh();
    } catch (err) {
      setError(
        err.response?.data?.message?.includes("duplicate") || err.response?.status === 500
          ? "Không lưu được – có thể đường dẫn (slug) đã trùng với bài khác."
          : err.response?.data?.message || "Không lưu được bài viết."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post) {
    if (!confirm(`Xóa bài viết "${post.title}"?`)) return;
    await deletePost(post._id);
    refresh();
  }

  if (editing) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-primary-900">
            {editing._id ? "Sửa bài viết" : "Viết bài mới"}
          </h1>
          <button type="button" onClick={() => setEditing(null)} className="text-sm text-primary-600 hover:underline">
            ← Quay lại danh sách
          </button>
        </div>
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <PostForm key={editing._id || "new"} initial={editing} onSubmit={handleSave} saving={saving} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary-900">Bài viết</h1>
        <Button onClick={startCreate}>+ Viết bài mới</Button>
      </div>

      {posts === null ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-primary-900/60">
          Chưa có bài viết nào. Bài viết hữu ích (kinh nghiệm học, mẹo thi HSK...) giúp website lên top Google.
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {posts.map((post) => (
            <Card key={post._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-primary-50">
                  {post.coverUrl && <img src={post.coverUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary-900">{post.title}</p>
                    {post.published ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Đã đăng</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">Nháp</Badge>
                    )}
                  </div>
                  <p className="text-sm text-primary-900/50">
                    {post.published ? `Đăng ${formatDate(post.publishedAt)}` : `Sửa ${formatDate(post.updatedAt)}`}
                    {post.tags?.length > 0 && ` · ${post.tags.join(", ")}`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {post.published && (
                  <a
                    href={`/bai-viet/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100"
                  >
                    Xem
                  </a>
                )}
                <button
                  onClick={() => startEdit(post)}
                  className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(post)}
                  className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-100"
                >
                  Xóa
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
