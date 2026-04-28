"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("ACCESS_DENIED: Invalid credentials.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("CONNECTION_ERROR: Could not reach auth endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1516] flex flex-col items-center justify-center px-4">
      {/* Terminal header lines */}
      <div className="w-full max-w-md mb-8 font-mono text-xs text-[#00e5ff]/50 space-y-1">
        <div>&gt; INITIALIZING SECURE CHANNEL...</div>
        <div>&gt; CONNECTING TO ROOT_SYSTEM...</div>
        <div>&gt; AUTHENTICATION REQUIRED <span className="animate-pulse">_</span></div>
      </div>

      <div className="w-full max-w-md border border-[#333333] bg-[#192122]">
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333] bg-[#080f11]">
          <span className="font-mono text-xs uppercase tracking-widest text-[#00e5ff]">
            ADMIN_TERMINAL // AUTH
          </span>
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-[#333333]" />
            <span className="w-2 h-2 bg-[#333333]" />
            <span className="w-2 h-2 bg-[#00e5ff]" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#849396] mb-2">
              ACCESS_KEY
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoFocus
              className="w-full bg-[#080f11] border border-[#333333] text-[#dce4e5] px-4 py-3 font-mono text-sm focus:border-[#00e5ff] focus:outline-none transition-colors placeholder:text-[#3b494c]"
            />
          </div>

          {error && (
            <div className="border border-[#ff571a]/50 bg-[#ff571a]/5 px-4 py-3 font-mono text-xs text-[#ff571a]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono text-xs uppercase tracking-widest px-4 py-3 border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "AUTHENTICATING..." : "[ EXECUTE_LOGIN ]"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#333333] bg-[#080f11]">
          <span className="font-mono text-[10px] text-[#849396] uppercase tracking-widest">
            SESSION TTL: 24H // HTTPONLY_SECURE
          </span>
        </div>
      </div>
    </div>
  );
}
