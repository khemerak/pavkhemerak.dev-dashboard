import { TopBar } from "@/components/TopBar";
import { MetricCard } from "@/components/MetricCard";
import { getDashboardStats, listPosts } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    listPosts(1, 5),
  ]);

  return (
    <>
      <TopBar title="OVERVIEW" action={{ label: "[ CREATE NEW POST ]", href: "/posts/new" }} />

      <div className="flex-1 overflow-y-auto bg-[#0d1516]">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#333333]">
          <MetricCard
            label="TOTAL_POSTS"
            value={stats.totalPosts}
            trend="STABLE_INSTANCE"
            icon="sync"
          />
          <MetricCard
            label="CATEGORIES"
            value={stats.categories.length}
            trend="ACTIVE_STREAMS"
            icon="category"
          />
          <MetricCard
            label="LATEST_ENTRY"
            value={stats.latestPostDate ?? "N/A"}
            trend="LAST_WRITE_OP"
            icon="schedule"
          />
        </div>

        {/* Category Breakdown */}
        <div className="p-6 border-b border-[#333333]">
          <h2 className="font-mono text-sm uppercase tracking-widest text-[#dce4e5] mb-4">
            CATEGORY_BREAKDOWN
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.categories.map(({ name, count }) => (
              <div key={name} className="border border-[#333333] bg-[#192122] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-2">{name}</p>
                <p className="font-mono text-2xl font-bold text-[#00e5ff]">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Chart Placeholder */}
        <div className="p-6 border-b border-[#333333]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-mono text-2xl font-semibold text-[#dce4e5] uppercase tracking-tight">
                TRAFFIC_FEED
              </h2>
              <p className="font-mono text-xs text-[#849396] mt-1">
                ANALYTICS NOT CONFIGURED // INTEGRATE PLAUSIBLE OR UMAMI
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#849396] inline-block" />
              <span className="font-mono text-[10px] text-[#849396] uppercase">NO_STREAM</span>
            </div>
          </div>
          <div className="relative h-48 bg-[#080f11] border border-[#333333] overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-30">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-r border-b border-[#333333]" />
              ))}
            </div>
            <div className="relative text-center font-mono text-xs text-[#849396] uppercase tracking-widest z-10">
              <span className="material-symbols-outlined text-4xl block mb-2 text-[#333333]">monitoring</span>
              No analytics data available
              <br />
              <span className="text-[#00e5ff]/50">Configure Plausible or Umami to enable</span>
            </div>
          </div>
        </div>

        {/* Recent Posts Table */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-xl font-semibold text-[#dce4e5] uppercase tracking-tight">
              RECENT_CONTENT
            </h3>
            <Link href="/posts" className="font-mono text-xs text-[#00e5ff] hover:underline">
              VIEW_ALL →
            </Link>
          </div>
          <div className="border border-[#333333] bg-[#192122]">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 border-b border-[#333333] bg-[#242b2d] px-4 py-2">
              <div className="col-span-6 font-mono text-[10px] uppercase tracking-widest text-[#849396]">POST_TITLE</div>
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-[#849396] text-center">CATEGORY</div>
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-[#849396] text-right">ACTIONS</div>
            </div>
            {recent.posts.length === 0 ? (
              <div className="px-4 py-8 text-center font-mono text-xs text-[#849396] uppercase">
                No posts found
              </div>
            ) : (
              recent.posts.map((post, i) => (
                <div
                  key={post.slug}
                  className={`grid grid-cols-1 md:grid-cols-12 px-4 py-3 hover:bg-[#080f11] transition-colors group ${
                    i < recent.posts.length - 1 ? "border-b border-[#333333]" : ""
                  }`}
                >
                  <div className="col-span-6 flex flex-col justify-center">
                    <span className="font-mono text-sm text-[#c3f5ff] uppercase group-hover:text-[#00e5ff] transition-colors truncate">
                      {post.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#849396]">{post.date} • {post.readTime}</span>
                  </div>
                  <div className="col-span-3 flex items-center md:justify-center mt-2 md:mt-0">
                    <span className="px-2 py-0.5 border border-[#00e5ff] text-[#00e5ff] text-[10px] font-mono uppercase">
                      {post.category}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center justify-start md:justify-end space-x-4 mt-3 md:mt-0">
                    <Link
                      href={`/posts/${post.slug}/edit`}
                      className="font-mono text-xs text-[#00e5ff] hover:underline"
                    >
                      [EDIT]
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
