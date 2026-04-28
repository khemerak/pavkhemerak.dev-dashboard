import { TopBar } from "@/components/TopBar";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECTS = [
  {
    title: "Ket — Fast, Interactive Download Manager",
    description: "A minimalist, high-velocity CLI utility for organizing and retrieving technical snippets and study resources.",
    tags: ["SHELL", "TOOL", "DOWNLOADER"],
    status: "STABLE",
    language: "Rust",
    filename: "ket.exe",
    primaryHref: "https://github.com/khemerak/ket.git",
    secondaryHref: "https://github.com/khemerak/ket.git",
    primaryLabel: "View Source",
    secondaryLabel: "Documentation",
  },
  {
    title: "Arch Linux — Hyprland Rice",
    description: "A highly customized Linux environment featuring automated deployment scripts, tiling WM configs, and optimized system performance.",
    tags: ["ARCH", "HYPRLAND", "DOTFILES"],
    status: "MAINTAINED",
    language: "Bash & Lua",
    filename: ".config",
    primaryHref: "https://github.com/khemerak/dotfiles.git",
    secondaryHref: "https://github.com/khemerak/dotfiles.git",
    primaryLabel: "View Source",
    secondaryLabel: "Setup Guide",
  },
  {
    title: "WISPP — Official School Website",
    description: "A comprehensive, responsive web platform developed for Westbridge International School of Phnom Penh.",
    tags: ["WEB", "FULL-STACK", "EDUCATION"],
    status: "LIVE",
    language: "PHP / JavaScript",
    filename: "wispp.edu.kh",
    primaryHref: "https://wispp.edu.kh",
    secondaryHref: "https://wispp.edu.kh",
    primaryLabel: "Live Demo",
    secondaryLabel: "View Project",
  },
  {
    title: "Etherscan Bot Analyzer",
    description: "A high-performance Rust service to monitor and analyze smart contract interactions via the Etherscan API. Identifies bot patterns.",
    tags: ["RUST", "WEB3", "API"],
    status: "LIVE",
    language: "Rust",
    filename: "etherscan.rs",
    primaryHref: "/tools/etherscan",
    secondaryHref: "/blog",
    primaryLabel: "Launch App",
    secondaryLabel: "Documentation",
  },
];

const STATUS_COLORS: Record<string, string> = {
  LIVE: "text-[#00f13d] border-[#00f13d]/50 bg-[#00f13d]/5",
  STABLE: "text-[#00e5ff] border-[#00e5ff]/50 bg-[#00e5ff]/5",
  MAINTAINED: "text-[#ff571a] border-[#ff571a]/50 bg-[#ff571a]/5",
  BETA: "text-[#fec931] border-[#fec931]/50 bg-[#fec931]/5",
};

export default function PortfolioPage() {
  return (
    <>
      <TopBar title="PORTFOLIO" />

      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        <div className="flex justify-between items-start mb-6 border-b border-[#333333] pb-4">
          <div>
            <h2 className="font-mono text-xl font-semibold text-[#dce4e5] uppercase tracking-tight">
              PROJECT_INDEX
            </h2>
            <p className="font-mono text-xs text-[#849396] mt-1">
              {PROJECTS.length} projects indexed // source: ToolsSection.tsx
            </p>
          </div>
          <div className="border border-[#333333] bg-[#192122] px-4 py-2 font-mono text-xs text-[#849396] max-w-xs text-right">
            To add/edit projects, update{" "}
            <span className="text-[#00e5ff]">components/ToolsSection.tsx</span>{" "}
            in the frontend repo.
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PROJECTS.map((project) => (
            <div key={project.title} className="border border-[#333333] bg-[#192122] flex flex-col">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#333333] flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-sm font-semibold text-[#c3f5ff] uppercase leading-tight">
                    {project.title}
                  </h3>
                  <p className="font-mono text-[10px] text-[#849396] mt-0.5">{project.filename}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 border font-mono text-[10px] uppercase ${STATUS_COLORS[project.status] ?? "text-[#849396] border-[#333333]"}`}>
                  {project.status}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 py-4 flex-1">
                <p className="font-mono text-xs text-[#bac9cc] leading-relaxed mb-4">
                  {project.description}
                </p>
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 border border-[#00e5ff]/40 text-[#00e5ff] text-[10px] font-mono uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#849396]">
                  <span className="material-symbols-outlined text-sm">code</span>
                  {project.language}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-[#333333] flex gap-4">
                <Link
                  href={project.primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#00e5ff] hover:underline"
                >
                  [{project.primaryLabel}]
                </Link>
                <Link
                  href={project.secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#849396] hover:text-[#dce4e5] hover:underline"
                >
                  [{project.secondaryLabel}]
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add Project Placeholder */}
        <div className="mt-4 border border-dashed border-[#333333] p-6 flex items-center justify-between">
          <div className="font-mono text-xs text-[#849396] uppercase">
            Want to add a project? Edit{" "}
            <span className="text-[#00e5ff]">pavkhemerak.dev-frontend/components/ToolsSection.tsx</span>
          </div>
          <span className="font-mono text-[10px] text-[#3b494c] uppercase">CMS coming soon</span>
        </div>
      </div>
    </>
  );
}
