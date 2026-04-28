import { Sidebar } from "@/components/Sidebar";
import { TerminalFooter } from "@/components/TerminalFooter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        {children}
        <TerminalFooter />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d1516] border-t border-[#333333] grid grid-cols-3 z-50">
        {[
          { href: "/", icon: "dashboard", label: "HOME" },
          { href: "/posts", icon: "article", label: "POSTS" },
          { href: "/api/auth/logout", icon: "logout", label: "EXIT" },
        ].map(({ href, icon, label }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center justify-center text-[#849396] hover:text-[#00e5ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="text-[8px] font-mono mt-1 uppercase">{label}</span>
          </a>
        ))}
      </nav>
      <div className="md:hidden h-16 w-full" />
    </div>
  );
}
