import { useEffect, useState } from "react";
import { listPosts } from "../api/posts";
import PostCard from "../components/PostCard";
import Spinner from "../components/ui/Spinner";
import { readCache, writeCache } from "../lib/cache";
import { BRAND } from "../lib/og";
import { usePageMeta } from "../lib/seo";

const ALL = "Tất cả";

export default function Blog() {
  const [posts, setPosts] = useState(() => readCache("posts"));
  const [tag, setTag] = useState(ALL);
  usePageMeta({
    title: `Bài viết học tiếng Trung, kinh nghiệm thi HSK – ${BRAND}`,
    description:
      "Chia sẻ kinh nghiệm học tiếng Trung, mẹo luyện thi HSK, HSKK, từ vựng và ngữ pháp từ cô Huyền (Hồ Thị Khánh Huyền) – giảng viên tiếng Trung Đại học Duy Tân.",
    path: "/bai-viet",
  });

  useEffect(() => {
    listPosts()
      .then((data) => {
        writeCache("posts", data);
        setPosts(data);
      })
      .catch(() => setPosts((prev) => prev ?? []));
  }, []);

  const tags = [ALL, ...new Set((posts || []).flatMap((p) => p.tags || []))];
  const filtered = posts && (tag === ALL ? posts : posts.filter((p) => p.tags?.includes(tag)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-primary-900 sm:text-4xl">
          Góc học tiếng Trung cùng cô Huyền
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-primary-900/60">
          Kinh nghiệm học, mẹo luyện thi HSK – HSKK, từ vựng và ngữ pháp tiếng Trung dễ hiểu cho người mới bắt đầu.
        </p>
      </div>

      {tags.length > 2 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tag === t ? "bg-primary-500 text-white" : "bg-white text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {filtered === null ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-24 text-center text-primary-900/50">Chưa có bài viết nào.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
