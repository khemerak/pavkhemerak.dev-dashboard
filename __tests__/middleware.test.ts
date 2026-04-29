import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { middleware } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me-super-secret-32-chars-min"
);

/**
 * Helper function to create a valid JWT token
 */
async function createValidToken(): Promise<string> {
  return await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/**
 * Helper function to create an expired JWT token
 */
async function createExpiredToken(): Promise<string> {
  return await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("-1h") // Expired 1 hour ago
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/**
 * Helper function to create a NextRequest with optional cookie
 */
function createRequest(
  pathname: string,
  cookie?: string
): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  const request = new NextRequest(url);

  if (cookie) {
    // Manually set the cookie header
    const headers = new Headers(request.headers);
    headers.set("cookie", `admin_session=${cookie}`);
    return new NextRequest(url, {
      ...request,
      headers,
    });
  }

  return request;
}

/**
 * Unit Tests: Middleware Session Cookie Checking
 * **Validates: Requirements 10.4, 12.1**
 *
 * Tests for the middleware behavior in checking session cookies
 * on protected routes and redirecting to login when missing.
 */
describe("Middleware - Session Cookie Checking", () => {
  /**
   * Test 1: Redirect to login when cookie missing on protected route
   * Verifies that accessing a protected route without a session cookie
   * redirects to the login page.
   */
  it("should redirect to /login when admin_session cookie is missing on protected route", async () => {
    const request = createRequest("/analytics");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Redirect status
    expect(response?.headers.get("location")).toContain("/login");
  });

  /**
   * Test 2: Allow access with valid session cookie on protected route
   * Verifies that accessing a protected route with a valid session cookie
   * allows the request to proceed.
   */
  it("should allow access to protected route with valid session cookie", async () => {
    const validToken = await createValidToken();
    const request = createRequest("/analytics", validToken);
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // NextResponse.next() returns 200
  });

  /**
   * Test 3: Redirect to login when session cookie is invalid
   * Verifies that accessing a protected route with an invalid session cookie
   * redirects to the login page.
   */
  it("should redirect to /login when admin_session cookie is invalid", async () => {
    const request = createRequest("/analytics", "invalid-token");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Redirect status
    expect(response?.headers.get("location")).toContain("/login");
  });

  /**
   * Test 4: Redirect to login when session cookie is expired
   * Verifies that accessing a protected route with an expired session cookie
   * redirects to the login page.
   */
  it("should redirect to /login when admin_session cookie is expired", async () => {
    const expiredToken = await createExpiredToken();
    const request = createRequest("/analytics", expiredToken);
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Redirect status
    expect(response?.headers.get("location")).toContain("/login");
  });

  /**
   * Test 5: Allow access to /login without session cookie
   * Verifies that the login page is accessible without a session cookie.
   */
  it("should allow access to /login without session cookie", async () => {
    const request = createRequest("/login");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // NextResponse.next() returns 200
  });

  /**
   * Test 6: Allow access to /api/auth/login without session cookie
   * Verifies that the login API endpoint is accessible without a session cookie.
   */
  it("should allow access to /api/auth/login without session cookie", async () => {
    const request = createRequest("/api/auth/login");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // NextResponse.next() returns 200
  });

  /**
   * Test 7: Allow access to /api/auth/logout without session cookie
   * Verifies that the logout API endpoint is accessible without a session cookie.
   */
  it("should allow access to /api/auth/logout without session cookie", async () => {
    const request = createRequest("/api/auth/logout");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // NextResponse.next() returns 200
  });

  /**
   * Test 8: Protect /posts route
   * Verifies that the /posts route is protected and requires a session cookie.
   */
  it("should protect /posts route and redirect to login without cookie", async () => {
    const request = createRequest("/posts");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Redirect status
    expect(response?.headers.get("location")).toContain("/login");
  });

  /**
   * Test 9: Protect /portfolio route
   * Verifies that the /portfolio route is protected and requires a session cookie.
   */
  it("should protect /portfolio route and redirect to login without cookie", async () => {
    const request = createRequest("/portfolio");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Redirect status
    expect(response?.headers.get("location")).toContain("/login");
  });

  /**
   * Test 10: Protect /settings route
   * Verifies that the /settings route is protected and requires a session cookie.
   */
  it("should protect /settings route and redirect to login without cookie", async () => {
    const request = createRequest("/settings");
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Redirect status
    expect(response?.headers.get("location")).toContain("/login");
  });

  /**
   * Test 11: Allow access to protected routes with valid cookie
   * Verifies that all protected routes are accessible with a valid session cookie.
   */
  it("should allow access to all protected routes with valid session cookie", async () => {
    const validToken = await createValidToken();
    const protectedRoutes = ["/analytics", "/posts", "/portfolio", "/settings"];

    for (const route of protectedRoutes) {
      const request = createRequest(route, validToken);
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response?.status).toBe(200);
    }
  });

  /**
   * Test 12: Redirect to login on all protected routes without cookie
   * Verifies that all protected routes redirect to login when cookie is missing.
   */
  it("should redirect to login on all protected routes without cookie", async () => {
    const protectedRoutes = ["/analytics", "/posts", "/portfolio", "/settings"];

    for (const route of protectedRoutes) {
      const request = createRequest(route);
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response?.status).toBe(307);
      expect(response?.headers.get("location")).toContain("/login");
    }
  });

  /**
   * Test 13: Delete invalid cookie on redirect
   * Verifies that when redirecting due to invalid token,
   * the invalid cookie is deleted from the response.
   */
  it("should delete invalid cookie when redirecting to login", async () => {
    const request = createRequest("/analytics", "invalid-token");
    const response = await middleware(request);

    expect(response).toBeDefined();
    // Check if Set-Cookie header contains admin_session deletion
    const setCookieHeader = response?.headers.get("set-cookie");
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain("admin_session");
  });

  /**
   * Test 14: Preserve valid cookie on successful access
   * Verifies that when accessing a protected route with a valid cookie,
   * the cookie is not modified in the response.
   */
  it("should preserve valid cookie when allowing access", async () => {
    const validToken = await createValidToken();
    const request = createRequest("/analytics", validToken);
    const response = await middleware(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
    // NextResponse.next() should not modify the cookie
    const setCookieHeader = response?.headers.get("set-cookie");
    expect(setCookieHeader).toBeNull();
  });

  /**
   * Test 15: Redirect to login preserves original URL
   * Verifies that when redirecting to login, the redirect URL
   * is properly formed.
   */
  it("should redirect to login with proper URL", async () => {
    const request = createRequest("/analytics");
    const response = await middleware(request);

    expect(response).toBeDefined();
    const location = response?.headers.get("location");
    expect(location).toBeDefined();
    expect(location).toContain("http");
    expect(location).toContain("/login");
  });
});

/**
 * Property-Based Tests: Middleware Session Validation
 * **Validates: Requirements 10.4, 12.1**
 *
 * Property-based tests to verify middleware behavior across
 * various inputs and scenarios.
 */
describe("Middleware - Property-Based Tests", () => {
  /**
   * Property 1: Protected Routes Require Valid Cookie
   * For any protected route, accessing without a valid session cookie
   * SHALL redirect to /login.
   */
  it("should redirect to login for any protected route without valid cookie", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("/analytics"),
          fc.constant("/posts"),
          fc.constant("/portfolio"),
          fc.constant("/settings"),
          fc.constant("/analytics/page/1"),
          fc.constant("/posts/new"),
          fc.constant("/posts/slug/edit")
        ),
        async (route) => {
          const request = createRequest(route);
          const response = await middleware(request);

          expect(response).toBeDefined();
          expect(response?.status).toBe(307);
          expect(response?.headers.get("location")).toContain("/login");
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2: Valid Cookie Allows Access to Protected Routes
   * For any protected route, accessing with a valid session cookie
   * SHALL allow the request to proceed.
   */
  it("should allow access to protected routes with valid cookie", async () => {
    const validToken = await createValidToken();

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("/analytics"),
          fc.constant("/posts"),
          fc.constant("/portfolio"),
          fc.constant("/settings")
        ),
        async (route) => {
          const request = createRequest(route, validToken);
          const response = await middleware(request);

          expect(response).toBeDefined();
          expect(response?.status).toBe(200);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Public Routes Always Accessible
   * For any public route, accessing without a session cookie
   * SHALL allow the request to proceed.
   */
  it("should allow access to public routes without cookie", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("/login"),
          fc.constant("/api/auth/login"),
          fc.constant("/api/auth/logout")
        ),
        async (route) => {
          const request = createRequest(route);
          const response = await middleware(request);

          expect(response).toBeDefined();
          expect(response?.status).toBe(200);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4: Invalid Tokens Always Redirect
   * For any invalid token, accessing a protected route
   * SHALL redirect to /login.
   */
  it("should redirect to login for any invalid token", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (invalidToken) => {
          const request = createRequest("/analytics", invalidToken);
          const response = await middleware(request);

          expect(response).toBeDefined();
          expect(response?.status).toBe(307);
          expect(response?.headers.get("location")).toContain("/login");
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5: Expired Tokens Always Redirect
   * For any expired token, accessing a protected route
   * SHALL redirect to /login.
   */
  it("should redirect to login for expired token", async () => {
    const expiredToken = await createExpiredToken();

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant("/analytics"),
          fc.constant("/posts"),
          fc.constant("/portfolio"),
          fc.constant("/settings")
        ),
        async (route) => {
          const request = createRequest(route, expiredToken);
          const response = await middleware(request);

          expect(response).toBeDefined();
          expect(response?.status).toBe(307);
          expect(response?.headers.get("location")).toContain("/login");
        }
      ),
      { numRuns: 50 }
    );
  });
});
