"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "OVERVIEW", icon: "dashboard" },
  { href: "/analytics", label: "ANALYTICS", icon: "monitoring" },
  { href: "/posts", label: "BLOG_POSTS", icon: "article" },
  { href: "/portfolio", label: "PORTFOLIO", icon: "folder_open" },
  { href: "/settings", label: "SETTINGS", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-[#333333] bg-[#0d1516] flex-shrink-0 fixed left-0 top-0 bottom-0 z-40">
      {/* Brand */}
      <div className="p-6 border-b border-[#333333]">
        <span className="text-[#00e5ff] font-bold tracking-widest font-mono text-sm uppercase">
          ROOT_SYSTEM
        </span>
        <div className="mt-1 text-[10px] font-mono text-[#849396] uppercase tracking-widest">
          pavkhemerak.dev
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map(({ href, label, icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-6 py-4 font-mono text-xs uppercase tracking-tighter transition-colors border-l-4 ${
                isActive
                  ? "text-[#00e5ff] border-[#00e5ff] bg-[#192122]"
                  : "text-[#849396] border-transparent hover:bg-[#192122] hover:text-[#00e5ff]"
              }`}
            >
              <span className="material-symbols-outlined mr-4 text-[20px]">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout + Status */}
      <div className="border-t border-[#333333]">
        <button
          onClick={logout}
          className="flex items-center w-full px-6 py-4 font-mono text-xs uppercase tracking-tighter text-[#849396] border-l-4 border-transparent hover:bg-[#192122] hover:text-[#ff571a] transition-colors"
        >
          <span className="material-symbols-outlined mr-4 text-[20px]">logout</span>
          LOGOUT
        </button>
        <div className="px-6 py-4 text-[10px] font-mono text-[#849396]/50 uppercase tracking-widest leading-relaxed">
          System Status: Online<br />
          Terminal ID: 00FF-A1
        </div>
      </div>
    </aside>
  );
}
