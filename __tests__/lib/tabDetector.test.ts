import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { TabDetector } from "@/lib/tabDetector";

// Mock localStorage for tests
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

/**
 * Unit Tests: TabDetector
 * **Validates: Requirements 8.1, 8.2, 8.3**
 *
 * Tests for the TabDetector class that manages multiple dashboard tabs.
 */
describe("TabDetector", () => {
  let detector: TabDetector;

  beforeEach(() => {
    // Replace global localStorage with mock
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.clear();
  });

  afterEach(() => {
    if (detector) {
      detector.destroy();
    }
    mockLocalStorage.clear();
  });

  /**
   * Test 1: Constructor creates detector
   * Verifies that the detector can be instantiated.
   */
  it("should create detector with config", () => {
    detector = new TabDetector({
      debugMode: false,
    });
    expect(detector).toBeDefined();
  });

  /**
   * Test 2: Constructor generates tab ID
   * Verifies that a unique tab ID is generated.
   */
  it("should generate unique tab ID", () => {
    detector = new TabDetector();
    const tabId1 = detector.getTabId();
    expect(tabId1).toBeDefined();
    expect(tabId1).toMatch(/^tab_\d+_[a-z0-9]+$/);

    const detector2 = new TabDetector();
    const tabId2 = detector2.getTabId();
    expect(tabId2).not.toBe(tabId1);

    detector2.destroy();
  });

  /**
   * Test 3: init() registers tab
   * Verifies that init() registers the tab in localStorage.
   */
  it("should register tab on init", () => {
    detector = new TabDetector();
    detector.init();

    const tabsJson = localStorage.getItem("__dashboard_tabs__");
    expect(tabsJson).toBeDefined();

    const tabs = JSON.parse(tabsJson!);
    expect(Object.keys(tabs).length).toBe(1);
    expect(tabs[detector.getTabId()]).toBeDefined();
  });

  /**
   * Test 4: isLastTab() returns true for single tab
   * Verifies that isLastTab() returns true when only one tab is open.
   */
  it("should return true for isLastTab when only one tab open", () => {
    detector = new TabDetector();
    detector.init();

    expect(detector.isLastTab()).toBe(true);
  });

  /**
   * Test 5: hasMultipleTabs() returns false for single tab
   * Verifies that hasMultipleTabs() returns false when only one tab is open.
   */
  it("should return false for hasMultipleTabs when only one tab open", () => {
    detector = new TabDetector();
    detector.init();

    expect(detector.hasMultipleTabs()).toBe(false);
  });

  /**
   * Test 6: getActiveTabCount() returns correct count
   * Verifies that getActiveTabCount() returns the correct number of tabs.
   */
  it("should return correct active tab count", () => {
    detector = new TabDetector();
    detector.init();

    expect(detector.getActiveTabCount()).toBe(1);
  });

  /**
   * Test 7: Multiple tabs can be registered
   * Verifies that multiple tabs can be registered in localStorage.
   */
  it("should support multiple tabs", () => {
    detector = new TabDetector();
    detector.init();

    // Simulate another tab registering
    const detector2 = new TabDetector();
    detector2.init();

    // Both detectors should see multiple tabs
    expect(detector.hasMultipleTabs()).toBe(true);
    expect(detector2.hasMultipleTabs()).toBe(true);
    expect(detector.getActiveTabCount()).toBe(2);
    expect(detector2.getActiveTabCount()).toBe(2);

    detector2.destroy();
  });

  /**
   * Test 8: isLastTab() returns false for multiple tabs
   * Verifies that isLastTab() returns false when multiple tabs are open.
   */
  it("should return false for isLastTab when multiple tabs open", () => {
    detector = new TabDetector();
    detector.init();

    const detector2 = new TabDetector();
    detector2.init();

    expect(detector.isLastTab()).toBe(false);
    expect(detector2.isLastTab()).toBe(false);

    detector2.destroy();
  });

  /**
   * Test 9: destroy() removes tab from localStorage
   * Verifies that destroy() removes the tab from localStorage.
   */
  it("should remove tab from localStorage on destroy", () => {
    detector = new TabDetector();
    detector.init();

    expect(detector.getActiveTabCount()).toBe(1);

    detector.destroy();

    // After destroy, tab should be removed
    const tabsJson = localStorage.getItem("__dashboard_tabs__");
    if (tabsJson) {
      const tabs = JSON.parse(tabsJson);
      expect(Object.keys(tabs).length).toBe(0);
    }
  });

  /**
   * Test 10: destroy() clears localStorage when last tab closes
   * Verifies that destroy() clears localStorage when the last tab closes.
   */
  it("should clear localStorage when last tab closes", () => {
    detector = new TabDetector();
    detector.init();

    expect(localStorage.getItem("__dashboard_tabs__")).toBeDefined();

    detector.destroy();

    // After destroying the last tab, localStorage should be cleared
    expect(localStorage.getItem("__dashboard_tabs__")).toBeNull();
    expect(localStorage.getItem("__current_tab_id__")).toBeNull();
  });

  /**
   * Test 11: destroy() preserves localStorage when other tabs open
   * Verifies that destroy() preserves localStorage when other tabs are still open.
   */
  it("should preserve localStorage when other tabs still open", () => {
    detector = new TabDetector();
    detector.init();

    const detector2 = new TabDetector();
    detector2.init();

    expect(detector.getActiveTabCount()).toBe(2);

    // Destroy first detector
    detector.destroy();

    // localStorage should still have the second tab
    const tabsJson = localStorage.getItem("__dashboard_tabs__");
    expect(tabsJson).toBeDefined();

    const tabs = JSON.parse(tabsJson!);
    expect(Object.keys(tabs).length).toBe(1);
    expect(tabs[detector2.getTabId()]).toBeDefined();

    detector2.destroy();
  });

  /**
   * Test 12: getTabId() returns consistent ID
   * Verifies that getTabId() returns the same ID throughout the tab's lifetime.
   */
  it("should return consistent tab ID", () => {
    detector = new TabDetector();
    const tabId1 = detector.getTabId();

    detector.init();
    const tabId2 = detector.getTabId();

    expect(tabId1).toBe(tabId2);
  });

  /**
   * Test 13: Custom tab ID is used
   * Verifies that a custom tab ID can be provided in config.
   */
  it("should use custom tab ID from config", () => {
    const customTabId = "custom_tab_123";
    detector = new TabDetector({ tabId: customTabId });

    expect(detector.getTabId()).toBe(customTabId);
  });

  /**
   * Test 14: Debug mode logs events
   * Verifies that debug mode logs events to console.
   */
  it("should log events when debug mode is enabled", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    detector = new TabDetector({ debugMode: true });
    detector.init();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[TabDetector] Initialized")
    );

    consoleLogSpy.mockRestore();
  });

  /**
   * Test 15: Storage event handler works
   * Verifies that storage event handler responds to changes from other tabs.
   */
  it("should handle storage events from other tabs", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    detector = new TabDetector({ debugMode: true });
    detector.init();

    // Simulate storage change from another tab
    const storageEvent = new StorageEvent("storage", {
      key: "__dashboard_tabs__",
      newValue: JSON.stringify({}),
    });

    window.dispatchEvent(storageEvent);

    // Should log storage change
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[TabDetector] Storage changed")
    );

    consoleLogSpy.mockRestore();
  });

  /**
   * Test 16: Heartbeat keeps tab alive
   * Verifies that heartbeat updates tab timestamp.
   */
  it("should update tab timestamp on heartbeat", async () => {
    detector = new TabDetector();
    detector.init();

    const tabsJson1 = localStorage.getItem("__dashboard_tabs__");
    const tabs1 = JSON.parse(tabsJson1!);
    const timestamp1 = tabs1[detector.getTabId()].timestamp;

    // Wait for heartbeat (5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5100));

    const tabsJson2 = localStorage.getItem("__dashboard_tabs__");
    const tabs2 = JSON.parse(tabsJson2!);
    const timestamp2 = tabs2[detector.getTabId()].timestamp;

    // Timestamp should be updated
    expect(timestamp2).toBeGreaterThan(timestamp1);
  });

  /**
   * Test 17: Inactive tabs are cleaned up
   * Verifies that tabs older than 10 seconds are removed.
   */
  it("should clean up inactive tabs", () => {
    detector = new TabDetector();
    detector.init();

    // Manually add an old tab to localStorage
    const tabs = {
      [detector.getTabId()]: {
        tabId: detector.getTabId(),
        timestamp: Date.now(),
        isActive: true,
      },
      old_tab: {
        tabId: "old_tab",
        timestamp: Date.now() - 15000, // 15 seconds old
        isActive: true,
      },
    };

    localStorage.setItem("__dashboard_tabs__", JSON.stringify(tabs));

    // Call getActiveTabCount which should clean up old tabs
    const count = detector.getActiveTabCount();

    // Should only have 1 active tab (old tab should be cleaned up)
    expect(count).toBe(1);
  });

  /**
   * Test 18: Multiple init calls don't duplicate tabs
   * Verifies that calling init multiple times doesn't create duplicate tabs.
   */
  it("should handle multiple init calls", () => {
    detector = new TabDetector();
    detector.init();
    detector.init();

    expect(detector.getActiveTabCount()).toBe(1);
  });

  /**
   * Test 19: destroy() removes event listeners
   * Verifies that destroy() removes all event listeners.
   */
  it("should remove event listeners on destroy", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    detector = new TabDetector();
    detector.init();

    removeEventListenerSpy.mockClear();

    detector.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "storage",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
  });

  /**
   * Test 20: Tab info includes required fields
   * Verifies that tab info stored in localStorage has all required fields.
   */
  it("should store tab info with required fields", () => {
    detector = new TabDetector();
    detector.init();

    const tabsJson = localStorage.getItem("__dashboard_tabs__");
    const tabs = JSON.parse(tabsJson!);
    const tabInfo = tabs[detector.getTabId()];

    expect(tabInfo).toHaveProperty("tabId");
    expect(tabInfo).toHaveProperty("timestamp");
    expect(tabInfo).toHaveProperty("isActive");
    expect(tabInfo.isActive).toBe(true);
  });
});

/**
 * Property-Based Tests: TabDetector
 * **Validates: Requirements 8.1, 8.2**
 *
 * Property-based tests to verify multiple tab handling behavior.
 */
describe("TabDetector - Property-Based Tests", () => {
  beforeEach(() => {
    // Replace global localStorage with mock
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  /**
   * Property 5: Multiple Tab Independence
   * **Validates: Requirements 8.1, 8.2**
   *
   * For any set of open dashboard tabs, closing one tab SHALL not affect the session of other tabs.
   * Only when the last tab closes SHALL the session be cleared.
   *
   * This property verifies that:
   * 1. Multiple tabs can be open simultaneously
   * 2. Closing one tab doesn't affect others
   * 3. Session is only cleared when the last tab closes
   * 4. Tab count is accurately tracked
   */
  it("should maintain independence of multiple tabs", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (numTabs) => {
          const detectors: TabDetector[] = [];

          // Create multiple tabs
          for (let i = 0; i < numTabs; i++) {
            const detector = new TabDetector();
            detector.init();
            detectors.push(detector);
          }

          // Verify all tabs are registered
          expect(detectors[0].getActiveTabCount()).toBe(numTabs);

          // Verify multiple tabs detection
          if (numTabs > 1) {
            expect(detectors[0].hasMultipleTabs()).toBe(true);
            expect(detectors[0].isLastTab()).toBe(false);
          } else {
            expect(detectors[0].hasMultipleTabs()).toBe(false);
            expect(detectors[0].isLastTab()).toBe(true);
          }

          // Close all tabs except the last one
          for (let i = 0; i < numTabs - 1; i++) {
            detectors[i].destroy();

            // Verify remaining tabs still see correct count
            if (i < numTabs - 1) {
              const remainingCount = numTabs - i - 1;
              expect(detectors[numTabs - 1].getActiveTabCount()).toBe(remainingCount);
            }
          }

          // Close the last tab
          detectors[numTabs - 1].destroy();

          // Verify localStorage is cleared
          expect(localStorage.getItem("__dashboard_tabs__")).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Tab Count Accuracy
   * **Validates: Requirements 8.1**
   *
   * For any number of open tabs, getActiveTabCount() SHALL return the correct count.
   */
  it("should accurately track tab count", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (numTabs) => {
          const detectors: TabDetector[] = [];

          for (let i = 0; i < numTabs; i++) {
            const detector = new TabDetector();
            detector.init();
            detectors.push(detector);

            // Each detector should see the correct count
            expect(detector.getActiveTabCount()).toBe(i + 1);
          }

          // All detectors should see the same count
          const expectedCount = numTabs;
          for (const detector of detectors) {
            expect(detector.getActiveTabCount()).toBe(expectedCount);
          }

          // Clean up
          for (const detector of detectors) {
            detector.destroy();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Last Tab Detection
   * **Validates: Requirements 8.2**
   *
   * For any number of open tabs, isLastTab() SHALL return true only when one tab remains.
   */
  it("should correctly identify last tab", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (numTabs) => {
          const detectors: TabDetector[] = [];

          for (let i = 0; i < numTabs; i++) {
            const detector = new TabDetector();
            detector.init();
            detectors.push(detector);
          }

          // Close all tabs except the last one
          for (let i = 0; i < numTabs - 1; i++) {
            detectors[i].destroy();
          }

          // Last tab should report isLastTab() = true
          expect(detectors[numTabs - 1].isLastTab()).toBe(true);

          // Clean up
          detectors[numTabs - 1].destroy();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Session Sharing
   * **Validates: Requirements 8.3**
   *
   * For any new tab opened while others are open, the new tab SHALL share the same session.
   * This is verified by checking that all tabs see the same tab list in localStorage.
   */
  it("should share session across all tabs", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (numTabs) => {
          const detectors: TabDetector[] = [];

          for (let i = 0; i < numTabs; i++) {
            const detector = new TabDetector();
            detector.init();
            detectors.push(detector);

            // Each new tab should see all previously opened tabs
            const expectedCount = i + 1;
            expect(detector.getActiveTabCount()).toBe(expectedCount);
          }

          // All tabs should see the same tab list
          const firstTabCount = detectors[0].getActiveTabCount();
          for (const detector of detectors) {
            expect(detector.getActiveTabCount()).toBe(firstTabCount);
          }

          // Clean up
          for (const detector of detectors) {
            detector.destroy();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Integration Tests: Multiple Tab Scenarios
 * **Validates: Requirements 8.1, 8.2, 8.3**
 *
 * Integration tests for multiple tab handling scenarios.
 */
describe("TabDetector - Integration Tests", () => {
  beforeEach(() => {
    // Replace global localStorage with mock
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  /**
   * Task 8.5: Test closing one tab doesn't affect others
   * Verifies that closing one tab doesn't affect the session of other tabs.
   */
  it("should preserve session when closing one tab", () => {
    const detector1 = new TabDetector();
    detector1.init();

    const detector2 = new TabDetector();
    detector2.init();

    expect(detector1.getActiveTabCount()).toBe(2);
    expect(detector2.getActiveTabCount()).toBe(2);

    // Close first tab
    detector1.destroy();

    // Second tab should still see one active tab
    expect(detector2.getActiveTabCount()).toBe(1);
    expect(detector2.isLastTab()).toBe(true);

    // localStorage should still have tab info
    expect(localStorage.getItem("__dashboard_tabs__")).toBeDefined();

    detector2.destroy();
  });

  /**
   * Task 8.5: Test closing last tab clears session
   * Verifies that closing the last tab clears the session.
   */
  it("should clear session when closing last tab", () => {
    const detector = new TabDetector();
    detector.init();

    expect(localStorage.getItem("__dashboard_tabs__")).toBeDefined();

    detector.destroy();

    // localStorage should be cleared
    expect(localStorage.getItem("__dashboard_tabs__")).toBeNull();
    expect(localStorage.getItem("__current_tab_id__")).toBeNull();
  });

  /**
   * Task 8.5: Test new tab shares session with existing tabs
   * Verifies that a new tab shares the same session as existing tabs.
   */
  it("should share session when opening new tab", () => {
    const detector1 = new TabDetector();
    detector1.init();

    // Verify first tab is registered
    expect(detector1.getActiveTabCount()).toBe(1);

    // Open new tab
    const detector2 = new TabDetector();
    detector2.init();

    // Both tabs should see each other
    expect(detector1.getActiveTabCount()).toBe(2);
    expect(detector2.getActiveTabCount()).toBe(2);

    // Both tabs should have different IDs
    expect(detector1.getTabId()).not.toBe(detector2.getTabId());

    // Both tabs should see multiple tabs
    expect(detector1.hasMultipleTabs()).toBe(true);
    expect(detector2.hasMultipleTabs()).toBe(true);

    detector1.destroy();
    detector2.destroy();
  });

  /**
   * Task 8.5: Test multiple tabs scenario
   * Verifies the complete multiple tabs scenario.
   */
  it("should handle complete multiple tabs scenario", () => {
    // Open first tab
    const detector1 = new TabDetector();
    detector1.init();
    expect(detector1.isLastTab()).toBe(true);

    // Open second tab
    const detector2 = new TabDetector();
    detector2.init();
    expect(detector1.isLastTab()).toBe(false);
    expect(detector2.isLastTab()).toBe(false);

    // Open third tab
    const detector3 = new TabDetector();
    detector3.init();
    expect(detector1.getActiveTabCount()).toBe(3);
    expect(detector2.getActiveTabCount()).toBe(3);
    expect(detector3.getActiveTabCount()).toBe(3);

    // Close first tab
    detector1.destroy();
    expect(detector2.getActiveTabCount()).toBe(2);
    expect(detector3.getActiveTabCount()).toBe(2);
    expect(detector2.isLastTab()).toBe(false);

    // Close second tab
    detector2.destroy();
    expect(detector3.getActiveTabCount()).toBe(1);
    expect(detector3.isLastTab()).toBe(true);

    // Close last tab
    detector3.destroy();
    expect(localStorage.getItem("__dashboard_tabs__")).toBeNull();
  });
});
