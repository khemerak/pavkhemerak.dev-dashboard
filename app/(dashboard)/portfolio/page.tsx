"use client";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { PORTFOLIO_TEMPLATE } from "@/lib/portfolioTemplate";

export default function PortfolioPage() {
  const [rawJson, setRawJson] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parsed = useMemo(() => {
    try {
      return rawJson ? JSON.parse(rawJson) : null;
    } catch {
      return null;
    }
  }, [rawJson]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/portfolio-proxy");
        const data = await res.json();
        const content = data?.content ?? PORTFOLIO_TEMPLATE;
        setSavedAt(data?.updatedAt ?? null);
        setRawJson(JSON.stringify(content, null, 2));
      } catch {
        setError("Failed to load portfolio content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  async function saveChanges() {
    if (!parsed || typeof parsed !== "object") {
      setError("Invalid JSON. Fix syntax before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/portfolio-proxy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
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
    setRawJson(JSON.stringify(PORTFOLIO_TEMPLATE, null, 2));
    setError("");
  }

  return (
    <>
      <TopBar title="PORTFOLIO_CMS" />

      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        <div className="mb-4 border border-[#333333] bg-[#192122] px-4 py-3">
          <h2 className="font-mono text-sm text-[#c3f5ff] uppercase tracking-widest">PORTFOLIO CONTENT JSON</h2>
          <p className="font-mono text-xs text-[#849396] mt-1">
            Edit and save your profile, skills, projects, and contact data without touching frontend source files.
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
          <div className="border border-[#333333] bg-[#192122] p-4">
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              className="w-full min-h-[520px] bg-[#0d1516] border border-[#333333] p-4 font-mono text-xs text-[#dce4e5] outline-none focus:border-[#00e5ff]"
              spellCheck={false}
            />
            <div className="mt-4 flex items-center gap-3">
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
              <span className={`font-mono text-[10px] uppercase ${parsed ? "text-[#00f13d]" : "text-[#ff571a]"}`}>
                {parsed ? "JSON_VALID" : "JSON_INVALID"}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 border border-[#333333] bg-[#192122] px-4 py-3">
          <p className="font-mono text-[10px] text-[#849396] uppercase">
            This editor updates backend endpoint <span className="text-[#00e5ff]">/api/portfolio/content</span>.
            Frontend sections consume this content at runtime with fallback defaults.
          </p>
        </div>
      </div>
    </>
  );
}
