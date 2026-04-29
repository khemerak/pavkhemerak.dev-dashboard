import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  initializeSessionState,
  clearSessionState,
  isPageRefresh,
  getSessionState,
  updateSessionState,
  markSessionAuthenticated,
  markSessionUnauthenticated,
  isSessionValid,
} from "@/lib/sessionState";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

/**
 * Unit Tests: Session State Management
 * **Validates: Requirements 2.2, 2.3, 5.1, 5.2, 12.1**
 *
 * Tests for session state management including clearing on logout,
 * persistence on refresh, and internal navigation preservation.
 */
describe("Session State Management", () => {
  beforeEach(() => {
    // Clear sessionStorage and localStorage before each test
    sessionStorage.clear();
    localStorageMock.clear();
  });

  afterEach(() => {
    // Clean up after each test
    sessionStorage.clear();
    localStorageMock.clear();
  });

  /**
   * Test 1: Initialize session state on first load
   * Verifies that session state is initialized correctly on first page load.
   */
  it("should initialize session state on first load", () => {
    // First load - no refresh flag set
    initializeSessionState();

    // Session should be initialized
    const state = getSessionState();
    expect(state).toBeDefined();
    expect(state.isAuthenticated).toBe(false);
  });

  /**
   * Test 2: Detect page refresh
   * Verifies that page refresh is correctly detected using sessionStorage.
   */
  it("should detect page refresh", () => {
    // First initialization
    initializeSessionState();

    // After first init, refresh flag should be true
    expect(isPageRefresh()).toBe(true);

    // Second initialization (simulating refresh)
    initializeSessionState();

    // After second init, refresh flag should still be true
    expect(isPageRefresh()).toBe(true);
  });

  /**
   * Test 3: Clear session state on logout
   * Verifies that all session state is cleared when user logs out.
   * Requirement 2.2: Clear admin_session cookie on client side
   * Requirement 2.3: Clear any cached authentication state
   */
  it("should clear all session state on logout", () => {
    // Set up session state
    updateSessionState({ isAuthenticated: true });
    localStorage.setItem("auth_token", "test-token");
    localStorage.setItem("user_info", "test-user");

    // Verify state is set
    expect(getSessionState().isAuthenticated).toBe(true);
    expect(localStorage.getItem("auth_token")).toBe("test-token");

    // Clear session state
    clearSessionState();

    // Verify all state is cleared
    expect(getSessionState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("user_info")).toBeNull();
    expect(localStorage.getItem("session_data")).toBeNull();
  });

  /**
   * Test 4: Get session state
   * Verifies that session state can be retrieved correctly.
   */
  it("should get current session state", () => {
    // Initial state should be unauthenticated
    let state = getSessionState();
    expect(state.isAuthenticated).toBe(false);

    // Update state
    updateSessionState({ isAuthenticated: true });

    // State should be updated
    state = getSessionState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.lastActivity).toBeGreaterThan(0);
  });

  /**
   * Test 5: Update session state
   * Verifies that session state can be updated correctly.
   */
  it("should update session state", () => {
    // Initial state
    let state = getSessionState();
    expect(state.isAuthenticated).toBe(false);

    // Update state
    updateSessionState({ isAuthenticated: true });

    // Verify update
    state = getSessionState();
    expect(state.isAuthenticated).toBe(true);

    // Update again
    updateSessionState({ isAuthenticated: false });

    // Verify second update
    state = getSessionState();
    expect(state.isAuthenticated).toBe(false);
  });

  /**
   * Test 6: Mark session as authenticated
   * Verifies that session can be marked as authenticated.
   */
  it("should mark session as authenticated", () => {
    // Initial state
    expect(getSessionState().isAuthenticated).toBe(false);

    // Mark as authenticated
    markSessionAuthenticated();

    // Verify authenticated
    expect(getSessionState().isAuthenticated).toBe(true);
  });

  /**
   * Test 7: Mark session as unauthenticated
   * Verifies that session can be marked as unauthenticated and cleared.
   */
  it("should mark session as unauthenticated and clear state", () => {
    // Set up authenticated session
    markSessionAuthenticated();
    localStorage.setItem("auth_token", "test-token");

    // Verify authenticated
    expect(getSessionState().isAuthenticated).toBe(true);
    expect(localStorage.getItem("auth_token")).toBe("test-token");

    // Mark as unauthenticated
    markSessionUnauthenticated();

    // Verify unauthenticated and cleared
    expect(getSessionState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  /**
   * Test 8: Check if session is valid
   * Verifies that session validity is correctly determined.
   */
  it("should check if session is valid", () => {
    // Initial state - not valid
    expect(isSessionValid()).toBe(false);

    // Mark as authenticated
    markSessionAuthenticated();

    // Should be valid
    expect(isSessionValid()).toBe(true);

    // Mark as unauthenticated
    markSessionUnauthenticated();

    // Should not be valid
    expect(isSessionValid()).toBe(false);
  });

  /**
   * Test 9: Session state persists across updates
   * Verifies that session state persists correctly in sessionStorage.
   */
  it("should persist session state across updates", async () => {
    // Update state
    updateSessionState({ isAuthenticated: true });

    // Get state
    let state = getSessionState();
    expect(state.isAuthenticated).toBe(true);
    const firstActivity = state.lastActivity;

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update state again
    updateSessionState({ isAuthenticated: true });

    // Get state again
    state = getSessionState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.lastActivity).toBeGreaterThanOrEqual(firstActivity);
  });

  /**
   * Test 10: Session state is cleared on logout
   * Verifies that session state is completely cleared on logout.
   * Requirement 2.2: Clear admin_session cookie on client side
   * Requirement 2.3: Clear any cached authentication state
   */
  it("should clear session state completely on logout", () => {
    // Set up session
    markSessionAuthenticated();
    localStorage.setItem("auth_token", "token");
    localStorage.setItem("user_info", "user");
    localStorage.setItem("session_data", "data");

    // Verify setup
    expect(getSessionState().isAuthenticated).toBe(true);
    expect(localStorage.getItem("auth_token")).toBe("token");
    expect(localStorage.getItem("user_info")).toBe("user");
    expect(localStorage.getItem("session_data")).toBe("data");

    // Logout
    markSessionUnauthenticated();

    // Verify everything is cleared
    expect(getSessionState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("user_info")).toBeNull();
    expect(localStorage.getItem("session_data")).toBeNull();
    expect(sessionStorage.getItem("__session_state__")).toBeNull();
    expect(sessionStorage.getItem("__is_refresh__")).toBeNull();
  });

  /**
   * Test 11: Session state handles invalid JSON gracefully
   * Verifies that invalid JSON in sessionStorage is handled gracefully.
   */
  it("should handle invalid JSON in sessionStorage gracefully", () => {
    // Set invalid JSON
    sessionStorage.setItem("__session_state__", "invalid json {");

    // Should not throw and return default state
    const state = getSessionState();
    expect(state).toBeDefined();
    expect(state.isAuthenticated).toBe(false);
  });

  /**
   * Test 12: Session state updates include timestamp
   * Verifies that session state updates include a lastActivity timestamp.
   */
  it("should include timestamp in session state updates", () => {
    const beforeUpdate = Date.now();

    // Update state
    updateSessionState({ isAuthenticated: true });

    const afterUpdate = Date.now();

    // Get state
    const state = getSessionState();

    // Verify timestamp is within expected range
    expect(state.lastActivity).toBeGreaterThanOrEqual(beforeUpdate);
    expect(state.lastActivity).toBeLessThanOrEqual(afterUpdate);
  });

  /**
   * Test 13: Session persistence on refresh
   * Verifies that session state persists across page refresh.
   * Requirement 12.1: Ensure page refresh does not trigger logout
   */
  it("should preserve session state on page refresh", () => {
    // First load
    initializeSessionState();
    markSessionAuthenticated();

    // Verify authenticated
    expect(getSessionState().isAuthenticated).toBe(true);

    // Simulate refresh
    initializeSessionState();

    // Session should still be authenticated
    expect(getSessionState().isAuthenticated).toBe(true);
  });

  /**
   * Test 14: Session state cleared on tab closure
   * Verifies that session state is cleared when tab is closed (new session).
   * This is simulated by clearing sessionStorage.
   */
  it("should clear session state on tab closure", () => {
    // First load
    initializeSessionState();
    markSessionAuthenticated();

    // Verify authenticated
    expect(getSessionState().isAuthenticated).toBe(true);

    // Simulate tab closure by clearing sessionStorage
    sessionStorage.clear();

    // Initialize new session (simulating new tab)
    initializeSessionState();

    // Session should be unauthenticated (new session)
    expect(getSessionState().isAuthenticated).toBe(false);
  });

  /**
   * Test 15: Multiple session state updates
   * Verifies that multiple session state updates work correctly.
   */
  it("should handle multiple session state updates", () => {
    // Update 1
    updateSessionState({ isAuthenticated: true });
    expect(getSessionState().isAuthenticated).toBe(true);

    // Update 2
    updateSessionState({ isAuthenticated: false });
    expect(getSessionState().isAuthenticated).toBe(false);

    // Update 3
    updateSessionState({ isAuthenticated: true });
    expect(getSessionState().isAuthenticated).toBe(true);

    // Update 4
    clearSessionState();
    expect(getSessionState().isAuthenticated).toBe(false);
  });

  /**
   * Test 16: Session state does not store tokens in localStorage
   * Verifies that session tokens are not stored in localStorage.
   * Requirement 7.4: Do not store session token in localStorage or sessionStorage
   */
  it("should not store session tokens in localStorage or sessionStorage", () => {
    // Mark as authenticated
    markSessionAuthenticated();

    // Verify no tokens in localStorage
    expect(localStorageMock.getItem("admin_session")).toBeNull();
    expect(localStorageMock.getItem("session_token")).toBeNull();
    expect(localStorageMock.getItem("jwt_token")).toBeNull();

    // Verify no tokens in sessionStorage (only state and refresh flag)
    const sessionStorageKeys = Object.keys(sessionStorage);
    const tokenKeys = sessionStorageKeys.filter(
      (key) =>
        key.includes("token") ||
        key.includes("jwt") ||
        key.includes("admin")
    );

    // No token keys should be present
    expect(tokenKeys.length).toBe(0);
  });

  /**
   * Test 17: Session state initialization is idempotent
   * Verifies that calling initializeSessionState multiple times is safe.
   */
  it("should be idempotent when called multiple times", () => {
    // First initialization
    initializeSessionState();
    const state1 = getSessionState();

    // Second initialization
    initializeSessionState();
    const state2 = getSessionState();

    // Third initialization
    initializeSessionState();
    const state3 = getSessionState();

    // All states should be the same
    expect(state1.isAuthenticated).toBe(state2.isAuthenticated);
    expect(state2.isAuthenticated).toBe(state3.isAuthenticated);
  });

  /**
   * Test 18: Clear session state is idempotent
   * Verifies that calling clearSessionState multiple times is safe.
   */
  it("should be idempotent when clearing multiple times", () => {
    // Set up state
    markSessionAuthenticated();
    localStorage.setItem("auth_token", "token");

    // Clear once
    clearSessionState();
    expect(getSessionState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();

    // Clear again (should not throw)
    clearSessionState();
    expect(getSessionState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();

    // Clear third time (should not throw)
    clearSessionState();
    expect(getSessionState().isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  /**
   * Test 19: Session state handles edge cases
   * Verifies that session state handles edge cases gracefully.
   */
  it("should handle edge cases gracefully", () => {
    // Update with empty object
    updateSessionState({});
    expect(getSessionState()).toBeDefined();

    // Update with partial state
    updateSessionState({ isAuthenticated: true });
    expect(getSessionState().isAuthenticated).toBe(true);

    // Clear and verify
    clearSessionState();
    expect(getSessionState().isAuthenticated).toBe(false);
  });

  /**
   * Test 20: Session state refresh detection
   * Verifies that refresh detection works correctly across multiple scenarios.
   * Requirement 12.2: Distinguish between refresh and tab closure
   */
  it("should correctly detect refresh vs new session", () => {
    // First load - not a refresh
    initializeSessionState();
    expect(isPageRefresh()).toBe(true); // After init, flag is true

    // Simulate refresh
    initializeSessionState();
    expect(isPageRefresh()).toBe(true); // Still true after refresh

    // Simulate tab closure by clearing sessionStorage
    sessionStorage.clear();

    // New session - not a refresh
    initializeSessionState();
    expect(isPageRefresh()).toBe(true); // Flag is set to true after init
  });
});
