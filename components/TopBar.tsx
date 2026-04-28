"use client";
import Link from "next/link";

interface TopBarProps {
  title: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export function TopBar({ title, action }: TopBarProps) {
  return (
    <header className="flex justify-between items-center px-6 w-full border-b border-[#333333] h-16 bg-[#0d1516] flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <span className="material-symbols-outlined text-[#00e5ff] text-[20px]">terminal</span>
        <h1 className="font-mono uppercase text-xs tracking-widest text-[#00e5ff]">
          ADMIN_TERMINAL // {title}
        </h1>
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="font-mono uppercase text-xs tracking-widest px-4 py-2 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black transition-all duration-75"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="font-mono uppercase text-xs tracking-widest px-4 py-2 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black transition-all duration-75"
          >
            {action.label}
          </button>
        )
      )}
    </header>
  );
}
