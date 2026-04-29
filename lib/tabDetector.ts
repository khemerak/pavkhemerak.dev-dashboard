/**
 * Tab Detector
 * 
 * Detects and manages multiple dashboard tabs using localStorage.
 * Tracks active tabs and determines when to clear session (only on last tab close).
 * 
 * Validates: Requirements 8.1, 8.2, 8.3
 */

/**
 * Configuration for tab detector
 */
export interface TabDetectorConfig {
  /** Unique identifier for this tab (generated on init) */
  tabId?: string;
  /** Enable debug logging */
  debugMode?: boolean;
}

/**
 * Tab information stored in localStorage
 */
interface TabInfo {
  tabId: string;
  timestamp: number;
  isActive: boolean;
}

/**
 * Storage keys for tab tracking
 */
const TABS_STORAGE_KEY = "__dashboard_tabs__";
const CURRENT_TAB_ID_KEY = "__current_tab_id__";
const TAB_HEARTBEAT_INTERVAL = 5000; // 5 seconds

/**
 * TabDetector class
 * 
 * Manages multiple dashboard tabs by:
 * 1. Tracking active tabs in localStorage
 * 2. Detecting when the last tab is closed
 * 3. Ensuring new tabs share the same session as existing tabs
 * 4. Cleaning up inactive tabs
 */
export class TabDetector {
  private config: Required<TabDetectorConfig>;
  private tabId: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: TabDetectorConfig = {}) {
    this.config = {
      tabId: config.tabId || this.generateTabId(),
      debugMode: config.debugMode ?? false,
    };
    this.tabId = this.config.tabId;
  }

  /**
   * Initialize tab detector
   * Must be called on page load to start tracking tabs
   * 
   * Requirement 8.1: Detect if multiple dashboard tabs are open
   */
  public init(): void {
    if (typeof window === "undefined") {
      return;
    }

    if (this.isInitialized) {
      if (this.config.debugMode) {
        console.log("[TabDetector] Already initialized");
      }
      return;
    }

    // Register this tab
    this.registerTab();

    // Start heartbeat to keep tab alive
    this.startHeartbeat();

    // Listen for storage changes (other tabs)
    window.addEventListener("storage", this.handleStorageChange.bind(this));

    // Listen for beforeunload to clean up on tab close
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));

    this.isInitialized = true;

    if (this.config.debugMode) {
      console.log("[TabDetector] Initialized with tabId:", this.tabId);
    }
  }

  /**
   * Generate a unique tab ID
   * Uses timestamp + random number for uniqueness
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register this tab in localStorage
   * Requirement 8.1: Use localStorage to track tabs
   */
  private registerTab(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const tabs = this.getAllTabs();
      
      // Add this tab
      tabs[this.tabId] = {
        tabId: this.tabId,
        timestamp: Date.now(),
        isActive: true,
      };

      // Store updated tabs
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
      localStorage.setItem(CURRENT_TAB_ID_KEY, this.tabId);

      if (this.config.debugMode) {
        console.log("[TabDetector] Registered tab:", this.tabId);
        console.log("[TabDetector] Active tabs:", Object.keys(tabs).length);
      }
    } catch (error) {
      if (this.config.debugMode) {
        console.error("[TabDetector] Error registering tab:", error);
      }
    }
  }

  /**
   * Get all tabs from localStorage
   * Requirement 8.1: Use localStorage to track tabs
   */
  private getAllTabs(): Record<string, TabInfo> {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const tabsJson = localStorage.getItem(TABS_STORAGE_KEY);
      if (!tabsJson) {
        return {};
      }

      const tabs = JSON.parse(tabsJson);
      
      // Clean up inactive tabs (older than 10 seconds)
      const now = Date.now();
      const activeTabs: Record<string, TabInfo> = {};

      for (const [tabId, tab] of Object.entries(tabs)) {
        if (now - (tab as TabInfo).timestamp < 10000) {
          activeTabs[tabId] = tab as TabInfo;
        }
      }

      return activeTabs;
    } catch (error) {
      if (this.config.debugMode) {
        console.error("[TabDetector] Error reading tabs:", error);
      }
      return {};
    }
  }

  /**
   * Start heartbeat to keep tab alive
   * Periodically updates tab timestamp to indicate it's still active
   */
  private startHeartbeat(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      this.registerTab();
    }, TAB_HEARTBEAT_INTERVAL);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle storage changes from other tabs
   * Requirement 8.3: Ensure new tabs share same session as existing tabs
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === TABS_STORAGE_KEY) {
      if (this.config.debugMode) {
        const tabs = this.getAllTabs();
        console.log("[TabDetector] Storage changed, active tabs:", Object.keys(tabs).length);
      }
    }
  }

  /**
   * Handle beforeunload event
   * Requirement 8.2: When closing the last dashboard tab, clear session
   */
  private handleBeforeUnload(): void {
    if (this.config.debugMode) {
      console.log("[TabDetector] beforeunload event fired");
    }

    // Unregister this tab
    this.unregisterTab();
  }

  /**
   * Unregister this tab from localStorage
   * Requirement 8.2: When closing non-last tab, preserve session
   */
  private unregisterTab(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const tabs = this.getAllTabs();
      
      // Remove this tab
      delete tabs[this.tabId];

      if (Object.keys(tabs).length === 0) {
        // Last tab is closing - clear session
        if (this.config.debugMode) {
          console.log("[TabDetector] Last tab closing, clearing session");
        }
        localStorage.removeItem(TABS_STORAGE_KEY);
        localStorage.removeItem(CURRENT_TAB_ID_KEY);
      } else {
        // Other tabs still open - preserve session
        if (this.config.debugMode) {
          console.log("[TabDetector] Other tabs still open, preserving session");
          console.log("[TabDetector] Remaining tabs:", Object.keys(tabs).length);
        }
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
      }
    } catch (error) {
      if (this.config.debugMode) {
        console.error("[TabDetector] Error unregistering tab:", error);
      }
    }
  }

  /**
   * Check if this is the last tab
   * Requirement 8.2: Determine if this is the last dashboard tab
   */
  public isLastTab(): boolean {
    const tabs = this.getAllTabs();
    return Object.keys(tabs).length <= 1;
  }

  /**
   * Check if multiple tabs are open
   * Requirement 8.1: Detect if multiple dashboard tabs are open
   */
  public hasMultipleTabs(): boolean {
    const tabs = this.getAllTabs();
    return Object.keys(tabs).length > 1;
  }

  /**
   * Get count of active tabs
   * Requirement 8.1: Detect if multiple dashboard tabs are open
   */
  public getActiveTabCount(): number {
    const tabs = this.getAllTabs();
    return Object.keys(tabs).length;
  }

  /**
   * Get current tab ID
   */
  public getTabId(): string {
    return this.tabId;
  }

  /**
   * Destroy tab detector
   * Called on page unload to clean up
   */
  public destroy(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.stopHeartbeat();
    window.removeEventListener("storage", this.handleStorageChange.bind(this));
    window.removeEventListener("beforeunload", this.handleBeforeUnload.bind(this));

    if (this.config.debugMode) {
      console.log("[TabDetector] Destroyed");
    }
  }
}
