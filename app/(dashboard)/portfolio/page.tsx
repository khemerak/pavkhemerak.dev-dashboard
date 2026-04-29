"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { PORTFOLIO_TEMPLATE } from "@/lib/portfolioTemplate";

type LabelValue = { label: string; value: string };
type LanguageSkill = { keyword: string; name: string; delay?: string };
type LinuxSkill = { name: string; label: string; labelColor: string };
type ProjectTag = { label: string; color: string };
type ProjectAction = { label: string; icon?: string; href?: string };
type Project = {
  title: string;
  description: string;
  tags: ProjectTag[];
  status: string;
  statusColor: string;
  language: string;
  filename: string;
  imageUrl: string;
  imageAlt: string;
  primaryAction: ProjectAction;
  secondaryAction: ProjectAction;
};
type Social = { label: string; href: string; icon: string };
type PortfolioContent = {
  profile: { displayName: string; tags: string[]; facts: LabelValue[] };
  skills: { languages: LanguageSkill[]; linux: LinuxSkill[]; ecosystems: string[] };
  tools: { projects: Project[] };
  contact: { location: string; email: string; socials: Social[] };
};

const inputCls = "w-full bg-[#0d1516] border border-[#333333] px-3 py-2 font-mono text-xs text-[#dce4e5] outline-none focus:border-[#00e5ff]";
const areaCls = `${inputCls} min-h-[84px]`;

function normalizeContent(raw: unknown): PortfolioContent {
  const fallback = PORTFOLIO_TEMPLATE as PortfolioContent;
  if (!raw || typeof raw !== "object") return fallback;
  const data = raw as Partial<PortfolioContent>;
  return {
    profile: {
      displayName: data.profile?.displayName ?? fallback.profile.displayName,
      tags: data.profile?.tags ?? fallback.profile.tags,
      facts: data.profile?.facts ?? fallback.profile.facts,
    },
    skills: {
      languages: data.skills?.languages ?? fallback.skills.languages,
      linux: data.skills?.linux ?? fallback.skills.linux,
      ecosystems: data.skills?.ecosystems ?? fallback.skills.ecosystems,
    },
    tools: {
      projects: data.tools?.projects ?? fallback.tools.projects,
    },
    contact: {
      location: data.contact?.location ?? fallback.contact.location,
      email: data.contact?.email ?? fallback.contact.email,
      socials: data.contact?.socials ?? fallback.contact.socials,
    },
  };
}

export default function PortfolioPage() {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/portfolio-proxy");
        const data = await res.json();
        const nextContent = normalizeContent(data?.content ?? PORTFOLIO_TEMPLATE);
        setSavedAt(data?.updatedAt ?? null);
        setContent(nextContent);
      } catch {
        setError("Failed to load portfolio content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  async function saveChanges() {
    if (!content) {
      setError("No content loaded.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portfolio-proxy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error("Save failed");
      setSavedAt(data.updatedAt ?? null);
    } catch {
      setError("Save failed. Verify backend is reachable and ADMIN_API_KEY is correct.");
    } finally {
      setSaving(false);
    }
  }

  function resetTemplate() {
    setContent(normalizeContent(PORTFOLIO_TEMPLATE));
    setError("");
  }

  return (
    <>
      <TopBar title="PORTFOLIO_CMS" />

      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        <div className="mb-4 border border-[#333333] bg-[#192122] px-4 py-3">
          <h2 className="font-mono text-sm text-[#c3f5ff] uppercase tracking-widest">PORTFOLIO CMS EDITOR</h2>
          <p className="font-mono text-xs text-[#849396] mt-1">
            Manage profile, skills, projects, and contact in a clickable UI.
          </p>
          {savedAt && <p className="font-mono text-[10px] text-[#849396] mt-2">LAST_SAVE: {savedAt}</p>}
        </div>

        {error && (
          <div className="mb-4 border border-[#ff571a]/50 bg-[#ff571a]/5 px-4 py-3 font-mono text-xs text-[#ff571a]">
            ERROR: {error}
          </div>
        )}

        {loading ? (
          <div className="px-4 py-12 flex items-center justify-center gap-3 font-mono text-xs text-[#849396] uppercase">
            <div className="w-4 h-4 border-2 border-[#00e5ff] border-t-transparent animate-spin" />
            Loading portfolio content...
          </div>
        ) : (
          content && (
            <div className="space-y-4">
              <section className="border border-[#333333] bg-[#192122] p-4">
                <h3 className="font-mono text-xs text-[#00e5ff] uppercase mb-3">Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className={inputCls}
                    value={content.profile.displayName}
                    onChange={(e) => setContent({ ...content, profile: { ...content.profile, displayName: e.target.value } })}
                    placeholder="Display name"
                  />
                  <input
                    className={inputCls}
                    value={content.profile.tags.join(" | ")}
                    onChange={(e) => setContent({ ...content, profile: { ...content.profile, tags: e.target.value.split("|").map((x) => x.trim()).filter(Boolean) } })}
                    placeholder="Tags separated by |"
                  />
                </div>
              </section>

              <section className="border border-[#333333] bg-[#192122] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-xs text-[#00e5ff] uppercase">Projects</h3>
                  <button
                    onClick={() => setContent({
                      ...content,
                      tools: {
                        ...content.tools,
                        projects: [...content.tools.projects, {
                          title: "New Project",
                          description: "",
                          tags: [],
                          status: "LIVE",
                          statusColor: "text-[#00f13d] border-[#00f13d]/50 bg-[#00f13d]/5",
                          language: "",
                          filename: "",
                          imageUrl: "",
                          imageAlt: "",
                          primaryAction: { label: "View Source", icon: "terminal", href: "" },
                          secondaryAction: { label: "Documentation", icon: "menu_book", href: "" },
                        }],
                      },
                    })}
                    className="border border-[#00e5ff] px-3 py-1 font-mono text-[10px] text-[#00e5ff] hover:bg-[#00e5ff]/10"
                  >
                    + ADD PROJECT
                  </button>
                </div>

                <div className="space-y-3">
                  {content.tools.projects.map((project, idx) => (
                    <div key={`${project.title}-${idx}`} className="border border-[#333333] bg-[#0d1516] p-3 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input className={inputCls} value={project.title} onChange={(e) => {
                          const projects = [...content.tools.projects];
                          projects[idx] = { ...project, title: e.target.value };
                          setContent({ ...content, tools: { ...content.tools, projects } });
                        }} placeholder="Project title" />
                        <input className={inputCls} value={project.language} onChange={(e) => {
                          const projects = [...content.tools.projects];
                          projects[idx] = { ...project, language: e.target.value };
                          setContent({ ...content, tools: { ...content.tools, projects } });
                        }} placeholder="Language" />
                        <input className={inputCls} value={project.filename} onChange={(e) => {
                          const projects = [...content.tools.projects];
                          projects[idx] = { ...project, filename: e.target.value };
                          setContent({ ...content, tools: { ...content.tools, projects } });
                        }} placeholder="Filename" />
                      </div>
                      <textarea className={areaCls} value={project.description} onChange={(e) => {
                        const projects = [...content.tools.projects];
                        projects[idx] = { ...project, description: e.target.value };
                        setContent({ ...content, tools: { ...content.tools, projects } });
                      }} placeholder="Project description" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input className={inputCls} value={project.imageUrl} onChange={(e) => {
                          const projects = [...content.tools.projects];
                          projects[idx] = { ...project, imageUrl: e.target.value };
                          setContent({ ...content, tools: { ...content.tools, projects } });
                        }} placeholder="Image URL" />
                        <input className={inputCls} value={project.primaryAction.href ?? ""} onChange={(e) => {
                          const projects = [...content.tools.projects];
                          projects[idx] = { ...project, primaryAction: { ...project.primaryAction, href: e.target.value } };
                          setContent({ ...content, tools: { ...content.tools, projects } });
                        }} placeholder="Primary action URL" />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            const projects = content.tools.projects.filter((_, i) => i !== idx);
                            setContent({ ...content, tools: { ...content.tools, projects } });
                          }}
                          className="border border-[#ff571a] px-3 py-1 font-mono text-[10px] text-[#ff571a] hover:bg-[#ff571a]/10"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-[#333333] bg-[#192122] p-4">
                <h3 className="font-mono text-xs text-[#00e5ff] uppercase mb-3">Contact + Skills Quick Edit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className={inputCls}
                    value={content.contact.location}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, location: e.target.value } })}
                    placeholder="Location"
                  />
                  <input
                    className={inputCls}
                    value={content.contact.email}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                    placeholder="Email"
                  />
                  <textarea
                    className={areaCls}
                    value={content.skills.ecosystems.join("\n")}
                    onChange={(e) => setContent({ ...content, skills: { ...content.skills, ecosystems: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } })}
                    placeholder="Ecosystems (one per line)"
                  />
                  <textarea
                    className={areaCls}
                    value={content.profile.facts.map((f) => `${f.label}:${f.value}`).join("\n")}
                    onChange={(e) => setContent({
                      ...content,
                      profile: {
                        ...content.profile,
                        facts: e.target.value.split("\n").map((row) => {
                          const [label, ...rest] = row.split(":");
                          return { label: (label ?? "").trim(), value: rest.join(":").trim() };
                        }).filter((x) => x.label || x.value),
                      },
                    })}
                    placeholder="Facts (label:value per line)"
                  />
                </div>
              </section>

              <div className="flex items-center gap-3">
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="border border-[#00e5ff] px-4 py-2 font-mono text-xs text-[#00e5ff] hover:bg-[#00e5ff]/10 disabled:opacity-50"
                >
                  {saving ? "[ SAVING... ]" : "[ SAVE CMS CONTENT ]"}
                </button>
                <button
                  onClick={resetTemplate}
                  className="border border-[#333333] px-4 py-2 font-mono text-xs text-[#849396] hover:text-[#dce4e5]"
                >
                  [ RESET TO TEMPLATE ]
                </button>
              </div>
            </div>
          )
        )}

        <div className="mt-4 border border-[#333333] bg-[#192122] px-4 py-3">
          <p className="font-mono text-[10px] text-[#849396] uppercase">
            Saves to <span className="text-[#00e5ff]">/api/portfolio/content</span>. Frontend sections read this data at runtime.
          </p>
        </div>
      </div>
    </>
  );
}
