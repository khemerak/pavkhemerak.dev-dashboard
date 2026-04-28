"use client";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-[#333333] text-[#849396] hover:border-[#00e5ff] hover:text-[#00e5ff] transition-colors"
    >
      {copied ? "[COPIED]" : "[COPY]"}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#333333] bg-[#192122] mb-6">
      <div className="px-5 py-3 border-b border-[#333333] bg-[#080f11]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#00e5ff]">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function testPing() {
    setPingLoading(true);
    setPingStatus(null);
    try {
      const start = Date.now();
      const res = await fetch("/api/health-proxy");
      const ms = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        setPingStatus(`OK // ${ms}ms // ${JSON.stringify(data)}`);
      } else {
        setPingStatus(`ERROR ${res.status}`);
      }
    } catch {
      setPingStatus("UNREACHABLE — is the backend running?");
    } finally {
      setPingLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg("");
    try {
      // Verify current password by attempting login
      const verify = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: currentPassword }),
      });
      if (!verify.ok) {
        setPwMsg("ERROR: Current password is incorrect.");
        return;
      }
      setPwMsg("PASSWORD CHANGE: Update DASHBOARD_PASSWORD in your .env.local (local) or Vercel environment variables (production), then redeploy.");
    } catch {
      setPwMsg("Network error.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <>
      <TopBar title="SETTINGS" />

      <div className="flex-1 overflow-y-auto bg-[#0d1516] p-6">
        {/* API Credentials */}
        <Section title="API_CREDENTIALS">
          <p className="font-mono text-xs text-[#849396] mb-4">
            The <span className="text-[#00e5ff]">ADMIN_API_KEY</span> is used to authenticate write operations (create, update, delete posts).
            It is stored server-side only and never exposed to the browser.
          </p>
          <div className="flex items-center gap-3 bg-[#080f11] border border-[#333333] px-4 py-3">
            <span className="font-mono text-xs text-[#00e5ff] tracking-widest flex-1 select-all">
              •••••••••••••••••••••••••• (stored in env)
            </span>
            <CopyButton text="See ADMIN_API_KEY in your .env.local or Vercel env vars" />
          </div>
          <p className="font-mono text-[10px] text-[#849396] mt-3 uppercase tracking-widest">
            To rotate: generate a new key → update backend .env → update Vercel dashboard env var → redeploy both.
          </p>
        </Section>

        {/* Backend Connection */}
        <Section title="BACKEND_CONNECTION">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-[#080f11] border border-[#333333] px-4 py-2 font-mono text-xs text-[#849396]">
              TARGET: {BACKEND_URL}
            </div>
            <button
              onClick={testPing}
              disabled={pingLoading}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black transition-all duration-75 disabled:opacity-50 whitespace-nowrap"
            >
              {pingLoading ? "PINGING..." : "[ PING ]"}
            </button>
          </div>
          {pingStatus && (
            <div className={`border px-4 py-3 font-mono text-xs ${pingStatus.startsWith("OK") ? "border-[#00f13d]/50 text-[#00f13d]" : "border-[#ff571a]/50 text-[#ff571a]"}`}>
              &gt; {pingStatus}
            </div>
          )}
        </Section>

        {/* Change Password */}
        <Section title="DASHBOARD_SECURITY">
          <p className="font-mono text-xs text-[#849396] mb-4">
            Verify your current password, then follow the instructions to update it.
          </p>
          <form onSubmit={changePassword} className="space-y-3 max-w-md">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-1.5">
                CURRENT_PASSWORD
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-1.5">
                NEW_PASSWORD (for reference)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {pwMsg && (
              <div className={`border px-4 py-3 font-mono text-xs ${pwMsg.startsWith("ERROR") ? "border-[#ff571a]/50 text-[#ff571a]" : "border-[#00e5ff]/50 text-[#00e5ff]"}`}>
                {pwMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black transition-all duration-75 disabled:opacity-50"
            >
              {pwLoading ? "VERIFYING..." : "[ VERIFY & GET INSTRUCTIONS ]"}
            </button>
          </form>
        </Section>

        {/* System Info */}
        <Section title="SYSTEM_INFO">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {[
              { label: "DASHBOARD_VERSION", value: "1.0.0" },
              { label: "BACKEND_URL", value: BACKEND_URL },
              { label: "ENVIRONMENT", value: process.env.NODE_ENV ?? "development" },
              { label: "SESSION_TTL", value: "24H // HTTPONLY JWT" },
              { label: "AUTH_METHOD", value: "PASSWORD + JWT COOKIE" },
              { label: "WRITE_AUTH", value: "X-API-KEY HEADER (SERVER-SIDE)" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3 bg-[#080f11] border border-[#333333] px-4 py-3">
                <span className="text-[#849396] uppercase tracking-widest shrink-0 w-48">{label}</span>
                <span className="text-[#00e5ff] break-all">{value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
