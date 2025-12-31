"use client";

/**
 * useProtectedRoute Hook
 *
 * Client-side authentication guard for protected pages.
 * Provides additional layer of protection alongside Next.js middleware.
 *
 * Features:
 * - Checks authentication status on component mount
 * - Redirects to /login if not authenticated
 * - Shows loading state during auth check
 * - Works with AuthContext for reactive state
 * - Prevents flash of protected content
 *
 * Usage:
 * - Call at top of protected page components
 * - Returns isLoading boolean for loading states
 * - Handles redirect automatically
 *
 * @see /specs/006-auth-integration/spec.md - FR-006
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useProtectedRoute Return Type
 */
interface UseProtectedRouteReturn {
  /**
   * True while checking authentication status
   * Use to show loading spinner/skeleton
   */
  isLoading: boolean;
}

/**
 * useProtectedRoute Hook
 *
 * Protects pages by checking authentication and redirecting if needed.
 * Provides loading state for better UX during auth checks.
 *
 * @returns Object with isLoading boolean
 *
 * @example
 * export default function TasksPage() {
 *   const { isLoading } = useProtectedRoute();
 *
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <TaskList />;
 * }
 */
export function useProtectedRoute(): UseProtectedRouteReturn {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth context to finish loading
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Only show loading while AuthContext is loading
  // Once loaded, show the page immediately (redirect happens in useEffect)
  return {
    isLoading,
  };
}
