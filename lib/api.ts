const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_KEY = process.env.ADMIN_API_KEY ?? "change-me-in-production";

// ── Types ─────────────────────────────────────────────────────
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  imageUrl?: string;
  imageAlt?: string;
  tags: string[];
  codeSnippet?: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  categories: { name: string; count: number }[];
  latestPostDate: string | null;
  topPosts: { slug: string; title: string; views: number; category: string }[];
}

export interface CreatePostBody {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  imageUrl?: string;
  imageAlt?: string;
  tags: string[];
  codeSnippet?: string;
}

// ── Helpers ───────────────────────────────────────────────────
function adminHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "x-api-key": API_KEY };
}

// ── Blog API ──────────────────────────────────────────────────
export async function listPosts(page = 1, perPage = 20): Promise<BlogListResponse> {
  const res = await fetch(`${BACKEND}/api/blog/posts?page=${page}&per_page=${perPage}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function getPost(slug: string): Promise<BlogPostDetail> {
  const res = await fetch(`${BACKEND}/api/blog/posts/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch post: ${slug}`);
  return res.json();
}

export async function createPost(body: CreatePostBody): Promise<BlogPostDetail> {
  const res = await fetch(`${BACKEND}/api/blog/posts`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function updatePost(slug: string, body: Partial<CreatePostBody>): Promise<BlogPostDetail> {
  const res = await fetch(`${BACKEND}/api/blog/posts/${slug}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function deletePost(slug: string): Promise<void> {
  const res = await fetch(`${BACKEND}/api/blog/posts/${slug}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

export async function listCategories(): Promise<string[]> {
  const res = await fetch(`${BACKEND}/api/blog/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BACKEND}/api/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) {
    // Fallback: compute from posts
    const posts = await listPosts(1, 50);
    const catMap: Record<string, number> = {};
    for (const p of posts.posts) {
      catMap[p.category] = (catMap[p.category] ?? 0) + 1;
    }
    return {
      totalPosts: posts.total,
      totalViews: 0,
      categories: Object.entries(catMap).map(([name, count]) => ({ name, count })),
      latestPostDate: posts.posts[0]?.date ?? null,
      topPosts: [],
    };
  }
  return res.json();
}
