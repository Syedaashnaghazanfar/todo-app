/**
 * Authentication API Client
 *
 * Client-side functions for calling authentication endpoints.
 * Handles signup, login, logout, and session validation.
 *
 * @see /specs/006-auth-integration/contracts/auth-api.yaml
 */

import type { AuthResponse, LogoutResponse, User } from '@/types/auth';

/**
 * API base URL from environment variables
 *
 * Defaults to localhost:8000 for development.
 * Override with NEXT_PUBLIC_API_URL in production.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Sign up new user
 *
 * Creates new account and returns JWT in httpOnly cookie.
 * User is automatically logged in after successful signup.
 *
 * @param email - User email address (EmailStr validation)
 * @param password - User password (minimum 8 characters)
 * @returns Promise resolving to AuthResponse with user data
 * @throws Error with message from API response (400, 409)
 *
 * @example
 * try {
 *   const response = await signup('user@example.com', 'password123');
 *   console.log('User created:', response.user);
 * } catch (error) {
 *   console.error('Signup failed:', error.message);
 * }
 */
export async function signup(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for JWT
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Extract error message from API response
    const errorMessage = data.detail || 'Signup failed. Please try again.';
    throw new Error(errorMessage);
  }

  // Store JWT token in localStorage for cross-domain requests
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }

  return data as AuthResponse;
}

/**
 * Log in existing user
 *
 * Authenticates user and returns JWT in httpOnly cookie.
 * Session persists for 30 days unless explicitly logged out.
 *
 * @param email - Registered email address
 * @param password - User password
 * @returns Promise resolving to AuthResponse with user data
 * @throws Error with message from API response (401)
 *
 * @example
 * try {
 *   const response = await login('user@example.com', 'password123');
 *   console.log('Welcome back:', response.user.email);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for JWT
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Extract error message from API response
    const errorMessage = data.detail || 'Login failed. Please try again.';
    throw new Error(errorMessage);
  }

  // Store JWT token in localStorage for cross-domain requests
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }

  return data as AuthResponse;
}

/**
 * Log out current user
 *
 * Destroys session and clears auth cookie.
 * Requires valid authentication token.
 *
 * @returns Promise resolving to LogoutResponse with confirmation message
 * @throws Error if logout fails (401)
 *
 * @example
 * try {
 *   const response = await logout();
 *   console.log(response.message); // "You have been logged out successfully"
 * } catch (error) {
 *   console.error('Logout failed:', error.message);
 * }
 */
export async function logout(): Promise<LogoutResponse> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include', // Include cookies for JWT
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || 'Logout failed. Please try again.';
    throw new Error(errorMessage);
  }

  // Clear token from localStorage
  localStorage.removeItem('auth_token');

  return data as LogoutResponse;
}

/**
 * Get current authenticated user
 *
 * Validates session and returns current user information.
 * Used for session persistence and profile display.
 *
 * @returns Promise resolving to User data
 * @throws Error if not authenticated or session expired (401)
 *
 * @example
 * try {
 *   const user = await getCurrentUser();
 *   console.log('Logged in as:', user.email);
 * } catch (error) {
 *   console.error('Not authenticated:', error.message);
 * }
 */
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include', // Include cookies for JWT
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || 'Session validation failed.';
    throw new Error(errorMessage);
  }

  return data as User;
}

/**
 * Check if user is authenticated
 *
 * Lightweight check for authentication status.
 * Returns boolean without throwing errors.
 *
 * @returns Promise resolving to true if authenticated, false otherwise
 *
 * @example
 * const isLoggedIn = await isAuthenticated();
 * if (!isLoggedIn) {
 *   router.push('/login');
 * }
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
