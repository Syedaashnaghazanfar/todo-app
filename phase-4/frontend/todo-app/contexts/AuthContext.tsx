"use client";

/**
 * Authentication Context
 *
 * Provides global authentication state and methods across the application.
 * Handles session persistence, user state management, and authentication actions.
 *
 * Features:
 * - User state management (user, isAuthenticated, loading)
 * - Session persistence via checkAuthStatus (calls GET /auth/me on mount)
 * - Login/signup/logout methods
 * - Automatic session restoration on app load
 * - React Context API for global state
 *
 * @see /specs/006-auth-integration/spec.md - FR-006, FR-007, FR-010
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types/auth';
import { getCurrentUser, login as loginApi, signup as signupApi, logout as logoutApi } from '@/services/authApi';
import { sessionExpired } from '@/utils/authAlerts';

/**
 * Authentication Context Interface
 *
 * Defines the shape of the auth context value.
 */
interface AuthContextValue extends AuthState {
  /**
   * Login user with email and password
   *
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to User object
   * @throws Error if login fails
   */
  login: (email: string, password: string) => Promise<User>;

  /**
   * Sign up new user with email and password
   *
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to User object
   * @throws Error if signup fails
   */
  signup: (email: string, password: string) => Promise<User>;

  /**
   * Logout current user and clear session
   *
   * Clears user state and redirects to login page.
   *
   * @returns Promise resolving when logout complete
   */
  logout: () => Promise<void>;

  /**
   * Check authentication status and restore session
   *
   * Calls GET /auth/me to validate session.
   * Updates user state if session valid.
   * Called on app mount and can be called manually.
   *
   * @returns Promise resolving to true if authenticated, false otherwise
   */
  checkAuthStatus: () => Promise<boolean>;
}

/**
 * Authentication Context
 *
 * Created with default values (loading state).
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Wraps the application and provides auth state/methods to all components.
 * Automatically checks auth status on mount.
 *
 * @param props.children - Child components to wrap
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check authentication status (T054: checkAuthStatus method)
   *
   * Validates session by calling GET /auth/me.
   * Updates user state if session valid.
   * Handles session expiration gracefully.
   *
   * @returns Promise resolving to true if authenticated, false otherwise
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      // Session invalid or expired - clear state
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   *
   * Calls login API and updates state on success.
   * Does NOT redirect - let calling component handle navigation.
   *
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to User object
   * @throws Error if login fails
   */
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await loginApi(email, password);

    // Update state with user data from response
    const userData: User = {
      id: response.user.id,
      email: response.user.email,
      created_at: response.user.created_at,
    };

    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  }, []);

  /**
   * Sign up new user
   *
   * Calls signup API and updates state on success.
   * Does NOT redirect - let calling component handle navigation.
   *
   * @param email - User email
   * @param password - User password
   * @returns Promise resolving to User object
   * @throws Error if signup fails
   */
  const signup = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await signupApi(email, password);

    // Update state with user data from response
    const userData: User = {
      id: response.user.id,
      email: response.user.email,
      created_at: response.user.created_at,
    };

    setUser(userData);
    setIsAuthenticated(true);

    return userData;
  }, []);

  /**
   * Logout user
   *
   * Calls logout API, clears state, and redirects to login page.
   *
   * @returns Promise resolving when logout complete
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi();
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout API failed:', error);
    } finally {
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  /**
   * Check auth status on mount
   *
   * Restores session if valid auth cookie exists.
   * Handles session expiration gracefully (no alerts on initial load).
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Context value with all auth state and methods
   */
  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 *
 * Access authentication context from any component.
 * Must be used within AuthProvider.
 *
 * @returns AuthContextValue with user state and auth methods
 * @throws Error if used outside AuthProvider
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <div>Please log in</div>;
 * }
 *
 * return <div>Welcome, {user.email}</div>;
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Export context for testing purposes
 */
export { AuthContext };
