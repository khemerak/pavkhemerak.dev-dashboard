export function TerminalFooter() {
  return (
    <footer className="h-20 bg-[#080f11] border-t border-[#333333] px-6 font-mono text-xs overflow-hidden flex flex-col justify-end pb-4 gap-1">
      <div className="text-[#00e5ff]/80">&gt; SYSTEM_BOOT: OK</div>
      <div className="text-[#00e5ff]/60">&gt; BACKEND_CONNECTION: ACTIVE // PORT 3001</div>
      <div className="text-[#00e5ff]">
        &gt; ADMIN_SESSION: ACTIVE <span className="animate-pulse">_</span>
      </div>
    </footer>
  );
}
