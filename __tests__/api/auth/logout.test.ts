import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { POST } from "@/app/api/auth/logout/route";

/**
 * Unit Tests: Logout Endpoint
 * **Validates: Requirements 3.1, 3.2, 3.3**
 *
 * Tests for the logout endpoint behavior in isolation.
 */
describe("POST /api/auth/logout - Unit Tests", () => {
  /**
   * Test 1: Successful logout returns 200 OK
   * Verifies that the logout endpoint returns HTTP 200 status code
   * with a success response body.
   */
  it("should return 200 OK with success message", async () => {
    const response = await POST();

    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual({
      ok: true,
      message: "Logged out successfully",
    });
  });

  /**
   * Test 2: Cookie is cleared with correct headers
   * Verifies that the response includes a Set-Cookie header that
   * clears the admin_session cookie with the correct security attributes.
   */
  it("should clear admin_session cookie with correct headers", async () => {
    const response = await POST();

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeDefined();

    // Verify cookie name and empty value
    expect(setCookieHeader).toContain("admin_session=");

    // Verify max-age=0 (cookie deletion)
    expect(setCookieHeader).toContain("Max-Age=0");

    // Verify security attributes
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("Secure");
    expect(setCookieHeader?.toLowerCase()).toContain("samesite=strict");

    // Verify path is root
    expect(setCookieHeader).toContain("Path=/");
  });

  /**
   * Test 3: Endpoint works without authentication
   * Verifies that the logout endpoint can be called without
   * providing any authentication credentials or valid session token.
   * This allows users to logout even if their token is invalid.
   */
  it("should work without authentication", async () => {
    // Call logout endpoint without any authentication
    const response = await POST();

    // Should still return 200 OK
    expect(response.status).toBe(200);

    // Should still clear the cookie
    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain("admin_session=");
    expect(setCookieHeader).toContain("Max-Age=0");
  });

  /**
   * Test 4: Multiple logout calls are idempotent
   * Verifies that calling the logout endpoint multiple times
   * always returns the same successful response and clears the cookie.
   */
  it("should be idempotent - multiple calls return same result", async () => {
    const response1 = await POST();
    const response2 = await POST();
    const response3 = await POST();

    // All responses should have 200 status
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response3.status).toBe(200);

    // All responses should have the same body
    const json1 = await response1.json();
    const json2 = await response2.json();
    const json3 = await response3.json();

    expect(json1).toEqual(json2);
    expect(json2).toEqual(json3);

    // All responses should have the same Set-Cookie header
    const setCookie1 = response1.headers.get("set-cookie");
    const setCookie2 = response2.headers.get("set-cookie");
    const setCookie3 = response3.headers.get("set-cookie");

    expect(setCookie1).toBe(setCookie2);
    expect(setCookie2).toBe(setCookie3);
  });

  /**
   * Test 5: Response has correct content-type
   * Verifies that the response includes the correct content-type header
   * for JSON responses.
   */
  it("should return JSON content-type", async () => {
    const response = await POST();

    const contentType = response.headers.get("content-type");
    expect(contentType).toContain("application/json");
  });

  /**
   * Test 6: Cookie attributes are secure
   * Verifies that all security attributes are properly set on the
   * session cookie to prevent unauthorized access.
   */
  it("should set all required security attributes on cookie", async () => {
    const response = await POST();

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeDefined();

    // HttpOnly prevents JavaScript access
    expect(setCookieHeader).toContain("HttpOnly");

    // Secure ensures cookie only sent over HTTPS
    expect(setCookieHeader).toContain("Secure");

    // SameSite=Strict prevents CSRF attacks
    expect(setCookieHeader?.toLowerCase()).toContain("samesite=strict");

    // Path=/ makes cookie available to all routes
    expect(setCookieHeader).toContain("Path=/");
  });
});

/**
 * Property-Based Test: Logout Idempotency
 * **Validates: Requirements 3.2, 3.3**
 *
 * For any logout request, calling the logout endpoint multiple times
 * SHALL always return 200 OK and clear the session cookie.
 */
describe("POST /api/auth/logout - Idempotency", () => {
  /**
   * Property 1: Logout Idempotency
   * For any number of logout calls, each call SHALL return 200 OK
   * and the response SHALL include a Set-Cookie header that clears
   * the admin_session cookie with max-age=0.
   */
  it("should return 200 OK and clear session cookie on every call", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // Generate 1-10 logout calls
        async (numCalls) => {
          const responses = [];

          // Make multiple logout calls
          for (let i = 0; i < numCalls; i++) {
            const response = await POST();
            responses.push(response);
          }

          // Verify all responses are 200 OK
          for (const response of responses) {
            expect(response.status).toBe(200);
          }

          // Verify all responses have the correct JSON body
          for (const response of responses) {
            const json = await response.json();
            expect(json).toEqual({
              ok: true,
              message: "Logged out successfully",
            });
          }

          // Verify all responses include Set-Cookie header clearing the session
          for (const response of responses) {
            const setCookieHeader = response.headers.get("set-cookie");
            expect(setCookieHeader).toBeDefined();
            expect(setCookieHeader).toContain("admin_session=");
            expect(setCookieHeader).toContain("Max-Age=0");
            expect(setCookieHeader).toContain("Path=/");
            expect(setCookieHeader).toContain("HttpOnly");
            expect(setCookieHeader).toContain("Secure");
            expect(setCookieHeader?.toLowerCase()).toContain("samesite=strict");
          }
        }
      ),
      { numRuns: 100 } // Run property test 100 times with different inputs
    );
  });

  /**
   * Property 2: Logout Response Consistency
   * For any logout call, the response structure SHALL always be consistent
   * with the same status code, headers, and body format.
   */
  it("should return consistent response structure across multiple calls", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // Generate 2-5 logout calls
        async (numCalls) => {
          const responses = [];

          for (let i = 0; i < numCalls; i++) {
            const response = await POST();
            responses.push(response);
          }

          // All responses should have the same status
          const firstStatus = responses[0].status;
          for (const response of responses) {
            expect(response.status).toBe(firstStatus);
          }

          // All responses should have the same content-type
          const firstContentType = responses[0].headers.get("content-type");
          for (const response of responses) {
            expect(response.headers.get("content-type")).toBe(firstContentType);
          }

          // All responses should have the same Set-Cookie header format
          const firstSetCookie = responses[0].headers.get("set-cookie");
          for (const response of responses) {
            const setCookie = response.headers.get("set-cookie");
            expect(setCookie).toBe(firstSetCookie);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Session Cookie Clearing
   * For any logout call, the admin_session cookie SHALL be cleared
   * with the correct attributes (max-age=0, HttpOnly, Secure, SameSite=Strict).
   */
  it("should always clear admin_session cookie with correct attributes", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }), // Generate 1-20 logout calls
        async (numCalls) => {
          for (let i = 0; i < numCalls; i++) {
            const response = await POST();
            const setCookieHeader = response.headers.get("set-cookie");

            // Verify Set-Cookie header exists
            expect(setCookieHeader).toBeDefined();

            // Verify cookie name is admin_session
            expect(setCookieHeader).toContain("admin_session=");

            // Verify max-age is 0 (cookie is deleted)
            expect(setCookieHeader).toContain("Max-Age=0");

            // Verify security attributes
            expect(setCookieHeader).toContain("HttpOnly");
            expect(setCookieHeader).toContain("Secure");
            expect(setCookieHeader?.toLowerCase()).toContain("samesite=strict");

            // Verify path is root
            expect(setCookieHeader).toContain("Path=/");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
