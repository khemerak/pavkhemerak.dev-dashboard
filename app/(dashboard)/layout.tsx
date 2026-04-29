"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TerminalFooter } from "@/components/TerminalFooter";
import { BrowserLifecycleDetector } from "@/lib/autoLogout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Task 7.1: Initialize detector on page load
    // Import BrowserLifecycleDetector in dashboard layout
    // Create detector instance with logout endpoint configuration
    // Initialize event listeners on component mount
    // Requirements: 1.1, 1.2

    const detector = new BrowserLifecycleDetector({
      // Task 7.2: Configure detector settings
      // Set logoutEndpoint to /api/auth/logout
      // Enable Beacon API if available
      // Enable fetch keepalive as fallback
      // Set debug mode for development
      // Requirements: 4.4, 6.1
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: process.env.NODE_ENV === "development",
    });

    detector.init();

    // Task 7.3: Cleanup event listeners on unmount
    // Destroy detector instance on component unmount
    // Remove event listeners to prevent memory leaks
    // Requirements: 1.1
    return () => {
      detector.destroy();
    };
  }, []);

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
