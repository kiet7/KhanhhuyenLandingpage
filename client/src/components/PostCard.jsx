import { Link } from "react-router-dom";
import Card from "./ui/Card";
import { formatDate } from "../lib/format";

export default function PostCard({ post }) {
  return (
    <Card className="overflow-hidden">
      <Link to={`/bai-viet/${post.slug}`} className="flex h-full flex-col">
        <div className="aspect-[1.91/1] w-full bg-linear-to-br from-primary-100 to-accent-100">
          {post.coverUrl && (
            <img src={post.coverUrl} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-primary-900">{post.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-primary-900/60">{post.excerpt}</p>
          <p className="mt-auto pt-3 text-xs text-primary-900/40">{formatDate(post.publishedAt || post.createdAt)}</p>
        </div>
      </Link>
    </Card>
  );
}
