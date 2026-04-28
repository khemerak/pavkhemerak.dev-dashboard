interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: string;
}

export function MetricCard({ label, value, trend, trendUp, icon }: MetricCardProps) {
  return (
    <div className="p-6 bg-[#192122] border-b border-r border-[#333333] last:border-r-0 md:border-b-0">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-3">
        {label}
      </p>
      <p className="font-mono text-[40px] leading-none font-bold text-[#00e5ff] tracking-tight">
        {value}
      </p>
      {trend && (
        <div className={`mt-4 flex items-center text-xs font-mono ${trendUp ? "text-[#00f13d]" : "text-[#849396]"}`}>
          <span className="material-symbols-outlined text-sm mr-1">
            {trendUp ? "trending_up" : icon ?? "sync"}
          </span>
          {trend}
        </div>
      )}
    </div>
  );
}
