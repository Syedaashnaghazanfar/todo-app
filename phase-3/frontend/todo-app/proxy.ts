/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Implements authentication-based access control for protected routes.
 * Runs on every request to check auth status and redirect as needed.
 *
 * Features:
 * - Protects /tasks, /analytics, /history, /tasks/[id] routes
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users away from /login and /signup to /tasks
 * - Checks auth_token cookie for authentication status
 * - Server-side proxy (runs before page renders)
 *
 * @see /specs/006-auth-integration/spec.md - FR-005, FR-006, FR-007
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes that require authentication
 *
 * Users must be logged in to access these routes.
 * Unauthenticated users will be redirected to /login.
 */
const PROTECTED_ROUTES = [
  '/tasks',
  '/analytics',
  '/history',
];

/**
 * Auth routes that authenticated users should not access
 *
 * Already logged-in users will be redirected to /tasks.
 */
const AUTH_ROUTES = [
  '/login',
  '/signup',
];

/**
 * Check if path matches any protected route
 *
 * Handles both exact matches and dynamic routes (e.g., /tasks/[id]).
 *
 * @param pathname - Request pathname
 * @returns True if path is protected, false otherwise
 */
function isProtectedRoute(pathname: string): boolean {
  // Check exact matches
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Check dynamic routes (e.g., /tasks/123)
  if (pathname.startsWith('/tasks/') && pathname !== '/tasks') {
    return true;
  }

  return false;
}

/**
 * Check if path is an auth route
 *
 * @param pathname - Request pathname
 * @returns True if path is auth route, false otherwise
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

/**
 * Check if user is authenticated
 *
 * Validates presence of auth_token cookie.
 * Does NOT validate JWT signature (done server-side on API calls).
 *
 * @param request - Next.js request object
 * @returns True if auth_token exists, false otherwise
 */
function isAuthenticated(request: NextRequest): boolean {
  const authToken = request.cookies.get('auth_token');
  return !!authToken && !!authToken.value;
}

/**
 * Proxy function (replaces middleware in Next.js 16+)
 *
 * Runs on every request to protected and auth routes.
 * Enforces authentication requirements and redirects as needed.
 *
 * @param request - Next.js request object
 * @returns NextResponse (continue or redirect)
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  // T056: Protect routes - redirect unauthenticated users to /login
  if (isProtectedRoute(pathname) && !authenticated) {
    // Build login URL with redirect parameter
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // T057: Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && authenticated) {
    // Already logged in - redirect to tasks
    const tasksUrl = new URL('/tasks', request.url);
    return NextResponse.redirect(tasksUrl);
  }

  // Allow request to continue
  return NextResponse.next();
}

/**
 * Proxy configuration
 *
 * Specifies which routes this proxy runs on.
 * Uses matcher to avoid running on static files, API routes, etc.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes (handled separately with JWT validation)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
