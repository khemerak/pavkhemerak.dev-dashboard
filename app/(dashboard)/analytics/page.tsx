import { TopBar } from "@/components/TopBar";
import { MetricCard } from "@/components/MetricCard";
import { getDashboardStats } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  const maxViews = Math.max(...stats.topPosts.map((p) => p.views), 1);

  return (
    <>
      <TopBar title="ANALYTICS" />

      <div className="flex-1 overflow-y-auto bg-[#0d1516]">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#333333]">
          <MetricCard
            label="TOTAL_VIEWS"
            value={stats.totalViews.toLocaleString()}
            trend={stats.totalViews > 0 ? "STREAM_ACTIVE" : "NO_DATA_YET"}
            trendUp={stats.totalViews > 0}
            icon="visibility"
          />
          <MetricCard
            label="TOTAL_POSTS"
            value={stats.totalPosts}
            trend="INDEXED_ENTRIES"
            icon="article"
          />
          <MetricCard
            label="AVG_VIEWS_PER_POST"
            value={stats.totalPosts > 0 ? Math.round(stats.totalViews / stats.totalPosts).toLocaleString() : "0"}
            trend="COMPUTED_RATIO"
            icon="bar_chart"
          />
        </div>

        {/* Top Posts Bar Chart */}
        <div className="p-6 border-b border-[#333333]">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-mono text-2xl font-semibold text-[#dce4e5] uppercase tracking-tight">
                TOP_POSTS_BY_VIEWS
              </h2>
              <p className="font-mono text-xs text-[#849396] mt-1">
                RANKED BY PAGE VIEW COUNT // MOST VIEWED FIRST
              </p>
            </div>
          </div>

          {stats.topPosts.length === 0 ? (
            <div className="border border-[#333333] bg-[#080f11] h-48 flex items-center justify-center">
              <div className="text-center font-mono text-xs text-[#849396] uppercase tracking-widest">
                <span className="material-symbols-outlined text-4xl block mb-2 text-[#333333]">visibility_off</span>
                No view data yet.
                <br />
                <span className="text-[#00e5ff]/50">Views are tracked when users read blog posts.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topPosts.map((post) => {
                const pct = Math.max((post.views / maxViews) * 100, 2);
                return (
                  <div key={post.slug} className="flex items-center gap-4">
                    <div className="w-48 shrink-0">
                      <span className="font-mono text-xs text-[#c3f5ff] truncate block uppercase">
                        {post.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#849396]">/{post.slug}</span>
                    </div>
                    <div className="flex-1 bg-[#080f11] border border-[#333333] h-8 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#00e5ff]/20 border-r border-[#00e5ff] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="font-mono text-xs text-[#00e5ff] font-bold">
                          {post.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <span className="px-2 py-0.5 border border-[#00e5ff]/40 text-[#00e5ff] text-[10px] font-mono uppercase">
                        {post.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="p-6">
          <h3 className="font-mono text-xl font-semibold text-[#dce4e5] uppercase tracking-tight mb-4">
            CATEGORY_DISTRIBUTION
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.categories.map(({ name, count }) => {
              const pct = stats.totalPosts > 0 ? Math.round((count / stats.totalPosts) * 100) : 0;
              return (
                <div key={name} className="border border-[#333333] bg-[#192122] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-1">{name}</p>
                  <p className="font-mono text-2xl font-bold text-[#00e5ff]">{count}</p>
                  <div className="mt-2 w-full bg-[#080f11] h-1">
                    <div className="bg-[#00e5ff] h-1" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="font-mono text-[10px] text-[#849396] mt-1">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
