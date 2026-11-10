import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostBySlug, listPosts } from "../api/posts";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import PostCard from "../components/PostCard";
import PostContent from "../components/PostContent";
import ShareButtons from "../components/ShareButtons";
import { readCache, writeCache } from "../lib/cache";
import { formatDate } from "../lib/format";
import { readingMinutes } from "../lib/markdown";
import { BRAND, buildPostOg, postUrl } from "../lib/og";
import { usePageMeta } from "../lib/seo";

const RELATED_COUNT = 3;

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);
  const [allPosts, setAllPosts] = useState(() => readCache("posts") || []);

  useEffect(() => {
    setPost(undefined);
    getPostBySlug(slug)
      .then(setPost)
      .catch(() => setPost(null));
  }, [slug]);

  // Danh sách bài để gợi ý "Bài viết khác" (vào thẳng link bài viết thì chưa có cache)
  useEffect(() => {
    listPosts()
      .then((data) => {
        writeCache("posts", data);
        setAllPosts(data);
      })
      .catch(() => {});
  }, []);

  const og = post ? buildPostOg(post) : null;
  usePageMeta({ title: og && `${og.title} | ${BRAND}`, description: og?.description, path: `/bai-viet/${slug}` });

  if (post === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="py-24 text-center">
        <p className="text-primary-900/60">Không tìm thấy bài viết này.</p>
        <Link to="/bai-viet" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Xem các bài viết khác
        </Link>
      </div>
    );
  }

  // Bài liên quan: ưu tiên bài cùng thẻ
  const others = allPosts.filter((p) => p.slug !== post.slug);
  const related = [
    ...others.filter((p) => p.tags?.some((t) => post.tags?.includes(t))),
    ...others,
  ]
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, RELATED_COUNT);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/bai-viet" className="text-sm font-semibold text-primary-600 hover:underline">
        ← Tất cả bài viết
      </Link>

      <article>
        <header className="mt-4">
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-primary-900 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-primary-900/50">
            Cô Huyền Tiếng Trung · {formatDate(post.publishedAt || post.createdAt)} · {readingMinutes(post.content)} phút đọc
          </p>
        </header>

        {post.coverUrl && (
          <div className="mt-6 aspect-[1.91/1] w-full overflow-hidden rounded-3xl bg-primary-50">
            <img src={post.coverUrl} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <PostContent markdown={post.content} className="mt-8" />
      </article>

      <div className="mt-10 border-t border-primary-100 pt-6">
        <ShareButtons url={postUrl(post)} />
      </div>

      <div className="mt-10 rounded-3xl bg-linear-to-br from-primary-500 to-accent-500 p-6 text-white sm:p-8">
        <p className="font-display text-xl font-bold">Muốn học tiếng Trung bài bản cùng cô Huyền?</p>
        <p className="mt-2 text-white/90">
          Lớp giao tiếp, luyện thi HSK – HSKK cho người mới bắt đầu và sinh viên, học tại Đà Nẵng hoặc online.
        </p>
        <Button as={Link} to="/khoa-hoc" variant="white" className="mt-5">
          Xem các khóa học
        </Button>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-primary-900">Bài viết khác</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
