"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import type { BlogPost, BlogListResponse } from "@/lib/api";

export default function PostsPage() {
  const [data, setData] = useState<BlogListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog-proxy?page=${page}&per_page=20`);
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleDelete(slug: string) {
    if (!confirm(`DELETE post "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    setError("");
    try {
      const res = await fetch(`/api/blog-proxy/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchPosts();
    } catch {
      setError(`Failed to delete post: ${slug}`);
    } finally {
      setDeleting(null);
    }
  }

  const posts = data?.posts ?? [];

  return (
    <>
      <TopBar title="BLOG_POSTS" action={{ label: "[ + NEW POST ]", href: "/posts/new" }} />

      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        {error && (
          <div className="mb-4 border border-[#ff571a]/50 bg-[#ff571a]/5 px-4 py-3 font-mono text-xs text-[#ff571a]">
            ERROR: {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-mono text-xl font-semibold text-[#dce4e5] uppercase tracking-tight">
            ALL_POSTS
          </h2>
          {data && (
            <span className="text-xs font-mono text-[#849396]">
              VIEWING {posts.length}/{data.total} ENTRIES
            </span>
          )}
        </div>

        <div className="border border-[#333333] bg-[#192122]">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 border-b border-[#333333] bg-[#242b2d] px-4 py-2">
            <div className="col-span-5 font-mono text-[10px] uppercase tracking-widest text-[#849396]">POST_TITLE</div>
            <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-[#849396] text-center">CATEGORY</div>
            <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-[#849396] text-center">DATE</div>
            <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-[#849396] text-right">ACTIONS</div>
          </div>

          {loading ? (
            <div className="px-4 py-12 flex items-center justify-center gap-3 font-mono text-xs text-[#849396] uppercase">
              <div className="w-4 h-4 border-2 border-[#00e5ff] border-t-transparent animate-spin" />
              Loading entries...
            </div>
          ) : posts.length === 0 ? (
            <div className="px-4 py-12 text-center font-mono text-xs text-[#849396] uppercase">
              No posts found
            </div>
          ) : (
            posts.map((post: BlogPost, i: number) => (
              <div
                key={post.slug}
                className={`grid grid-cols-1 md:grid-cols-12 px-4 py-3 hover:bg-[#080f11] transition-colors group ${
                  i < posts.length - 1 ? "border-b border-[#333333]" : ""
                }`}
              >
                <div className="col-span-5 flex flex-col justify-center">
                  <span className="font-mono text-sm text-[#c3f5ff] uppercase group-hover:text-[#00e5ff] transition-colors leading-snug">
                    {post.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#849396]">/{post.slug}</span>
                </div>
                <div className="col-span-2 flex items-center md:justify-center mt-2 md:mt-0">
                  <span className="px-2 py-0.5 border border-[#00e5ff]/50 text-[#00e5ff] text-[10px] font-mono uppercase">
                    {post.category}
                  </span>
                </div>
                <div className="col-span-2 flex items-center md:justify-center mt-2 md:mt-0">
                  <span className="font-mono text-xs text-[#849396]">{post.date}</span>
                </div>
                <div className="col-span-3 flex items-center justify-start md:justify-end space-x-4 mt-3 md:mt-0">
                  <Link
                    href={`/posts/${post.slug}/edit`}
                    className="font-mono text-xs text-[#00e5ff] hover:underline"
                  >
                    [EDIT]
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    disabled={deleting === post.slug}
                    className="font-mono text-xs text-[#ff571a] hover:underline disabled:opacity-50"
                  >
                    {deleting === post.slug ? "[...]" : "[DELETE]"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-4 flex justify-end space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center border border-[#333333] text-[#849396] hover:border-[#00e5ff] hover:text-[#00e5ff] disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center border font-mono text-xs ${
                  p === page
                    ? "border-[#00e5ff] text-[#00e5ff] bg-[#192122]"
                    : "border-[#333333] text-[#849396] hover:border-[#00e5ff] hover:text-[#00e5ff]"
                }`}
              >
                {String(p).padStart(2, "0")}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="w-8 h-8 flex items-center justify-center border border-[#333333] text-[#849396] hover:border-[#00e5ff] hover:text-[#00e5ff] disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
