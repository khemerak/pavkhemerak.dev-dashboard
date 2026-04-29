/**
 * BrowserLifecycleDetector
 * 
 * Detects when a user closes the browser tab or window and triggers a logout action.
 * Uses the beforeunload event to detect tab closure and sends a logout request via
 * Beacon API (preferred) or fetch with keepalive (fallback).
 * 
 * Supports multiple tabs: only clears session when the last tab is closed.
 * 
 * Validates: Requirements 4.1, 4.2, 8.1, 8.2, 8.3
 */

import { TabDetector } from "./tabDetector";

export interface AutoLogoutConfig {
  /** Endpoint to send logout request to (e.g., "/api/auth/logout") */
  logoutEndpoint: string;
  /** Enable Beacon API for sending logout request */
  enableBeaconApi?: boolean;
  /** Enable fetch with keepalive as fallback */
  enableFetchKeepalive?: boolean;
  /** Enable debug logging */
  debugMode?: boolean;
  /** Enable multiple tab detection */
  enableMultiTabDetection?: boolean;
}

export class BrowserLifecycleDetector {
  private config: Required<AutoLogoutConfig>;
  private isNavigatingAway = false;
  private logoutSent = false;
  private tabDetector: TabDetector | null = null;

  constructor(config: AutoLogoutConfig) {
    this.config = {
      logoutEndpoint: config.logoutEndpoint,
      enableBeaconApi: config.enableBeaconApi ?? true,
      enableFetchKeepalive: config.enableFetchKeepalive ?? true,
      debugMode: config.debugMode ?? false,
      enableMultiTabDetection: config.enableMultiTabDetection ?? true,
    };
  }

  /**
   * Initialize event listeners for browser lifecycle events
   * Requirement 4.1: Listen to beforeunload event on window
   * Requirement 4.2: Listen to unload event as fallback
   * Requirement 8.1: Initialize tab detector for multiple tab handling
   */
  public init(): void {
    if (typeof window === "undefined") {
      return;
    }

    // Initialize tab detector for multiple tab handling
    // Requirement 8.1: Detect if multiple dashboard tabs are open
    if (this.config.enableMultiTabDetection) {
      this.tabDetector = new TabDetector({
        debugMode: this.config.debugMode,
      });
      this.tabDetector.init();
    }

    // Listen to beforeunload event (primary detection method)
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));

    // Listen to unload event (fallback)
    window.addEventListener("unload", this.handleUnload.bind(this));

    // Track internal navigation to distinguish from tab closure
    window.addEventListener("click", this.handleLinkClick.bind(this));

    if (this.config.debugMode) {
      console.log("[BrowserLifecycleDetector] Initialized");
    }
  }

  /**
   * Handle beforeunload event
   * Fires when user closes tab, navigates away, or refreshes
   * Requirement 4.1: Detect when user is closing tab or navigating away
   * Requirement 8.2: Only send logout if this is the last tab
   */
  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.config.debugMode) {
      console.log("[BrowserLifecycleDetector] beforeunload event fired");
    }

    // Check if this is an internal navigation (same domain)
    // Requirement 5.1: Do not trigger logout for internal navigation
    if (this.isNavigatingAway) {
      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Internal navigation detected, skipping logout");
      }
      return;
    }

    // Check if multiple tabs are open
    // Requirement 8.2: Only send logout if this is the last tab
    if (this.config.enableMultiTabDetection && this.tabDetector) {
      if (!this.tabDetector.isLastTab()) {
        if (this.config.debugMode) {
          console.log("[BrowserLifecycleDetector] Multiple tabs open, preserving session");
        }
        return;
      }
    }

    // Send logout request
    this.sendLogoutRequest();
    this.logoutSent = true;
  }

  /**
   * Handle unload event (fallback)
   * Fires after beforeunload, as a fallback detection method
   * Requirement 4.2: Use unload event as fallback to detect tab closure
   * Requirement 4.2: Ensure logout is triggered even if beforeunload fails
   * Requirement 8.2: Only send logout if this is the last tab
   * 
   * This method serves as a fallback to ensure logout is triggered even if:
   * - beforeunload event doesn't fire (some browsers/scenarios)
   * - beforeunload event fires but logout request fails
   * - beforeunload event is prevented by user action
   */
  private handleUnload(): void {
    if (this.config.debugMode) {
      console.log("[BrowserLifecycleDetector] unload event fired");
    }

    // Only send logout if not already sent via beforeunload
    // This prevents duplicate logout requests
    if (this.logoutSent) {
      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Logout already sent via beforeunload, skipping unload");
      }
      return;
    }

    // Check if this is an internal navigation (same domain)
    // Requirement 5.1: Do not trigger logout for internal navigation
    if (this.isNavigatingAway) {
      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Internal navigation detected, skipping logout");
      }
      return;
    }

    // Check if multiple tabs are open
    // Requirement 8.2: Only send logout if this is the last tab
    if (this.config.enableMultiTabDetection && this.tabDetector) {
      if (!this.tabDetector.isLastTab()) {
        if (this.config.debugMode) {
          console.log("[BrowserLifecycleDetector] Multiple tabs open, preserving session");
        }
        return;
      }
    }

    // Send logout request as fallback
    if (this.config.debugMode) {
      console.log("[BrowserLifecycleDetector] Sending logout via unload event (fallback)");
    }
    this.sendLogoutRequest();
    this.logoutSent = true;
  }

  /**
   * Handle link clicks to detect internal navigation
   * Requirement 5.1: Distinguish between tab closure and navigation to another page
   */
  private handleLinkClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest("a") as HTMLAnchorElement | null;

    if (!link) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href) {
      return;
    }

    // Check if this is an internal navigation (same domain)
    if (this.isInternalNavigation(href)) {
      this.isNavigatingAway = true;
      // Reset logoutSent flag for internal navigation
      // This allows unload event to send logout if navigation fails
      this.logoutSent = false;

      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Internal navigation detected:", href);
      }

      // Reset flag after a short delay to allow beforeunload to fire
      setTimeout(() => {
        this.isNavigatingAway = false;
      }, 100);
    }
  }

  /**
   * Check if navigation is within the dashboard domain
   * Requirement 5.1: Do not trigger logout for internal navigation
   */
  private isInternalNavigation(url: string): boolean {
    // Handle relative URLs (always internal)
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return true;
    }

    // Handle absolute URLs - check if same domain
    try {
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(url);

      // Same domain = internal navigation
      return currentUrl.hostname === targetUrl.hostname;
    } catch {
      // If URL parsing fails, assume external
      return false;
    }
  }

  /**
   * Send logout request via Beacon API or fetch with keepalive
   * Requirement 4.4: Send logout request using Beacon API or fetch with keepalive
   * Requirement 6.1: Ensure request completes even if tab closes
   */
  private sendLogoutRequest(): void {
    if (this.config.debugMode) {
      console.log("[BrowserLifecycleDetector] Sending logout request");
    }

    // Try Beacon API first (preferred method)
    if (this.config.enableBeaconApi && this.sendLogoutBeacon()) {
      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Logout sent via Beacon API");
      }
      return;
    }

    // Fall back to fetch with keepalive
    if (this.config.enableFetchKeepalive) {
      this.sendLogoutFetch();
      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Logout sent via fetch keepalive");
      }
    }
  }

  /**
   * Send logout request via Beacon API
   * Requirement 4.4: Use Beacon API to ensure request completes
   * Returns true if successful, false if Beacon API not available
   */
  private sendLogoutBeacon(): boolean {
    if (!navigator.sendBeacon) {
      return false;
    }

    try {
      // Beacon API sends POST request with empty body
      const success = navigator.sendBeacon(this.config.logoutEndpoint);

      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Beacon API result:", success);
      }

      return success;
    } catch (error) {
      if (this.config.debugMode) {
        console.error("[BrowserLifecycleDetector] Beacon API error:", error);
      }
      return false;
    }
  }

  /**
   * Send logout request via fetch with keepalive
   * Requirement 4.4: Use fetch keepalive as fallback
   * Requirement 6.1: Ensure request completes even if tab closes
   */
  private async sendLogoutFetch(): Promise<void> {
    try {
      await fetch(this.config.logoutEndpoint, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (this.config.debugMode) {
        console.log("[BrowserLifecycleDetector] Logout sent via fetch keepalive");
      }
    } catch (error) {
      // Requirement 6.2: Clear local session state even if logout request fails
      if (this.config.debugMode) {
        console.error("[BrowserLifecycleDetector] Fetch error:", error);
      }
    }
  }

  /**
   * Clean up event listeners
   * Called when component unmounts to prevent memory leaks
   */
  public destroy(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.removeEventListener("beforeunload", this.handleBeforeUnload.bind(this));
    window.removeEventListener("unload", this.handleUnload.bind(this));
    window.removeEventListener("click", this.handleLinkClick.bind(this));

    // Clean up tab detector
    if (this.tabDetector) {
      this.tabDetector.destroy();
      this.tabDetector = null;
    }

    if (this.config.debugMode) {
      console.log("[BrowserLifecycleDetector] Destroyed");
    }
  }
}
