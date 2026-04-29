import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BrowserLifecycleDetector } from "@/lib/autoLogout";

/**
 * Integration Tests: BrowserLifecycleDetector Integration
 * **Validates: Requirements 1.1, 1.2**
 *
 * Tests for the integration of BrowserLifecycleDetector into the dashboard layout.
 * These tests verify that the detector is properly initialized on page load,
 * event listeners are attached, and cleanup occurs on unmount.
 */
describe("BrowserLifecycleDetector - Integration Tests", () => {
  let detector: BrowserLifecycleDetector;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000/analytics",
        hostname: "localhost",
      },
      writable: true,
    });

    // Mock navigator.sendBeacon if it doesn't exist
    if (!navigator.sendBeacon) {
      Object.defineProperty(navigator, "sendBeacon", {
        value: vi.fn().mockReturnValue(true),
        writable: true,
      });
    }
  });

  afterEach(() => {
    if (detector) {
      detector.destroy();
    }
    vi.clearAllMocks();
  });

  /**
   * Task 7.1: Initialize detector on page load
   * Test detector initialization on page load
   * Requirements: 1.1, 1.2
   */
  it("should initialize detector on page load", () => {
    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    expect(detector).toBeDefined();

    // Verify detector can be initialized
    detector.init();
    expect(detector).toBeDefined();
  });

  /**
   * Task 7.2: Configure detector settings
   * Test detector configuration with correct settings
   * Requirements: 4.4, 6.1
   */
  it("should configure detector with correct settings", () => {
    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Verify that Beacon API is enabled
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    // Trigger beforeunload event
    const event = new Event("beforeunload");
    window.dispatchEvent(event);

    // Verify Beacon API was called (indicating it's enabled)
    expect(sendBeaconSpy).toHaveBeenCalled();
  });

  /**
   * Task 7.2: Configure detector settings - Development mode
   * Test detector configuration with debug mode enabled
   * Requirements: 4.4, 6.1
   */
  it("should enable debug mode in development", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: true,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Verify debug logging is enabled
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "[BrowserLifecycleDetector] Initialized"
    );

    consoleLogSpy.mockRestore();
  });

  /**
   * Task 7.3: Cleanup event listeners on unmount
   * Test event listeners are properly attached
   * Requirements: 1.1, 1.2
   */
  it("should attach event listeners on initialization", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Verify event listeners were attached
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "unload",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
  });

  /**
   * Task 7.3: Cleanup event listeners on unmount
   * Test cleanup on unmount
   * Requirements: 1.1
   */
  it("should remove event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Clear previous calls
    removeEventListenerSpy.mockClear();

    // Destroy detector (simulating unmount)
    detector.destroy();

    // Verify event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "unload",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "click",
      expect.any(Function)
    );
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test detector initialization on page load
   * Requirements: 1.1, 1.2
   */
  it("should initialize detector and handle tab closure", () => {
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Simulate tab closure by triggering beforeunload
    const event = new Event("beforeunload");
    window.dispatchEvent(event);

    // Verify logout request was sent
    const logoutCalls = sendBeaconSpy.mock.calls.filter(
      (call: any[]) => call[0] === "/api/auth/logout"
    );
    expect(logoutCalls.length).toBeGreaterThan(0);
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test event listeners are properly attached
   * Requirements: 1.1, 1.2
   */
  it("should properly attach and trigger event listeners", () => {
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Verify beforeunload listener works
    const beforeUnloadEvent = new Event("beforeunload");
    window.dispatchEvent(beforeUnloadEvent);

    expect(sendBeaconSpy).toHaveBeenCalled();
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test cleanup on unmount
   * Requirements: 1.1
   */
  it("should prevent memory leaks by cleaning up on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Get the number of listeners added
    const addedListeners = addEventListenerSpy.mock.calls.length;

    // Clear mocks
    addEventListenerSpy.mockClear();
    removeEventListenerSpy.mockClear();

    // Destroy detector
    detector.destroy();

    // Verify all listeners were removed
    expect(removeEventListenerSpy.mock.calls.length).toBe(addedListeners);
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test detector initialization with custom endpoint
   * Requirements: 1.1, 1.2
   */
  it("should initialize detector with custom logout endpoint", () => {
    const customEndpoint = "/custom/logout";
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    const config = {
      logoutEndpoint: customEndpoint,
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Trigger beforeunload event
    const event = new Event("beforeunload");
    window.dispatchEvent(event);

    // Verify logout request was sent to custom endpoint
    const customEndpointCalls = sendBeaconSpy.mock.calls.filter(
      (call: any[]) => call[0] === customEndpoint
    );
    expect(customEndpointCalls.length).toBeGreaterThan(0);
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test detector handles multiple initialization calls gracefully
   * Requirements: 1.1, 1.2
   */
  it("should handle multiple initialization calls", () => {
    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);

    // Initialize multiple times
    detector.init();
    detector.init();

    // Should not throw and detector should still work
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    const event = new Event("beforeunload");
    window.dispatchEvent(event);

    expect(sendBeaconSpy).toHaveBeenCalled();
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test detector preserves session on internal navigation
   * Requirements: 1.1, 1.2
   */
  it("should preserve session on internal navigation", () => {
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Simulate internal navigation
    const link = document.createElement("a");
    link.href = "http://localhost:3000/posts";
    document.body.appendChild(link);

    const clickEvent = new MouseEvent("click", { bubbles: true });
    link.dispatchEvent(clickEvent);

    // Trigger beforeunload event
    const beforeUnloadEvent = new Event("beforeunload");
    window.dispatchEvent(beforeUnloadEvent);

    // Verify logout was NOT sent (internal navigation)
    const logoutCalls = sendBeaconSpy.mock.calls.filter(
      (call: any[]) => call[0] === "/api/auth/logout"
    );
    expect(logoutCalls.length).toBe(0);

    document.body.removeChild(link);
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test detector triggers logout on external navigation
   * Requirements: 1.1, 1.2
   */
  it("should trigger logout on external navigation", async () => {
    const sendBeaconSpy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: true,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Simulate external navigation
    const link = document.createElement("a");
    link.href = "https://example.com";
    document.body.appendChild(link);

    const clickEvent = new MouseEvent("click", { bubbles: true });
    link.dispatchEvent(clickEvent);

    // Wait for flag to be set
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Trigger beforeunload event
    const beforeUnloadEvent = new Event("beforeunload");
    window.dispatchEvent(beforeUnloadEvent);

    // Verify logout WAS sent (external navigation)
    const logoutCalls = sendBeaconSpy.mock.calls.filter(
      (call: any[]) => call[0] === "/api/auth/logout"
    );
    expect(logoutCalls.length).toBeGreaterThan(0);

    document.body.removeChild(link);
  });

  /**
   * Task 7.4: Write integration tests for detector integration
   * Test detector with Beacon API disabled falls back to fetch
   * Requirements: 1.1, 1.2
   */
  it("should fall back to fetch when Beacon API is disabled", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }))
    );

    const config = {
      logoutEndpoint: "/api/auth/logout",
      enableBeaconApi: false,
      enableFetchKeepalive: true,
      debugMode: false,
    };

    detector = new BrowserLifecycleDetector(config);
    detector.init();

    // Trigger beforeunload event
    const event = new Event("beforeunload");
    window.dispatchEvent(event);

    // Wait for async fetch to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify fetch was called
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
      })
    );
  });
});
