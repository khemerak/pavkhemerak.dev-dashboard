/**
 * Session State Management
 * 
 * Handles client-side session state management including:
 * - Clearing session state on logout
 * - Preserving session during page refresh
 * - Distinguishing between refresh and tab closure
 * 
 * Validates: Requirements 2.2, 2.3, 5.1, 5.2, 7.4, 12.1, 12.2, 12.3
 */

/**
 * Session state key for tracking refresh vs tab closure
 * Uses sessionStorage to persist across page refresh but clear on tab closure
 */
const SESSION_STATE_KEY = "__session_state__";
const REFRESH_FLAG_KEY = "__is_refresh__";

export interface SessionState {
  isAuthenticated: boolean;
  lastActivity: number;
}

/**
 * Initialize session state tracking
 * Must be called on page load to detect refresh vs tab closure
 * 
 * Requirement 12.2: Distinguish between refresh and tab closure
 */
export function initializeSessionState(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Check if this is a page refresh
  const isRefresh = sessionStorage.getItem(REFRESH_FLAG_KEY) === "true";

  if (isRefresh) {
    // This is a refresh - preserve session state
    sessionStorage.setItem(REFRESH_FLAG_KEY, "false");
  } else {
    // This is a new session - clear any previous state
    clearSessionState();
  }

  // Mark that we're now in an active session
  sessionStorage.setItem(REFRESH_FLAG_KEY, "true");
}

/**
 * Clear all session state on logout
 * 
 * Requirement 2.2: Clear admin_session cookie on client side
 * Requirement 2.3: Clear any cached authentication state
 * Requirement 7.4: Do not store session token in localStorage or sessionStorage
 */
export function clearSessionState(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Clear sessionStorage (used for refresh detection)
  sessionStorage.removeItem(SESSION_STATE_KEY);
  sessionStorage.removeItem(REFRESH_FLAG_KEY);

  // Clear localStorage (if any auth state was stored there)
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_info");
  localStorage.removeItem("session_data");

  // Note: HTTP-only cookies are cleared by the server via Set-Cookie header
  // We cannot clear them from JavaScript, but the server handles this
}

/**
 * Check if this is a page refresh
 * 
 * Requirement 12.2: Distinguish between refresh and tab closure
 * 
 * Returns true if the page is being refreshed (F5, Ctrl+R, etc.)
 * Returns false if this is a new page load or tab closure
 */
export function isPageRefresh(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Check if refresh flag is set in sessionStorage
  // sessionStorage persists across refresh but clears on tab closure
  return sessionStorage.getItem(REFRESH_FLAG_KEY) === "true";
}

/**
 * Get current session state
 * 
 * Returns the current session state including authentication status
 */
export function getSessionState(): SessionState {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      lastActivity: 0,
    };
  }

  const stateJson = sessionStorage.getItem(SESSION_STATE_KEY);
  if (!stateJson) {
    return {
      isAuthenticated: false,
      lastActivity: 0,
    };
  }

  try {
    return JSON.parse(stateJson);
  } catch {
    return {
      isAuthenticated: false,
      lastActivity: 0,
    };
  }
}

/**
 * Update session state
 * 
 * Updates the current session state with new values
 */
export function updateSessionState(state: Partial<SessionState>): void {
  if (typeof window === "undefined") {
    return;
  }

  const currentState = getSessionState();
  const newState: SessionState = {
    ...currentState,
    ...state,
    lastActivity: Date.now(),
  };

  sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(newState));
}

/**
 * Mark session as authenticated
 * 
 * Called after successful login
 */
export function markSessionAuthenticated(): void {
  updateSessionState({
    isAuthenticated: true,
  });
}

/**
 * Mark session as unauthenticated
 * 
 * Called on logout
 */
export function markSessionUnauthenticated(): void {
  updateSessionState({
    isAuthenticated: false,
  });
  clearSessionState();
}

/**
 * Check if session is still valid
 * 
 * Requirement 12.1: Ensure page refresh does not trigger logout
 * 
 * Returns true if session is authenticated and not expired
 */
export function isSessionValid(): boolean {
  const state = getSessionState();
  
  if (!state.isAuthenticated) {
    return false;
  }

  // Session is valid if authenticated
  // Expiration is handled by the server via JWT expiration
  return true;
}
