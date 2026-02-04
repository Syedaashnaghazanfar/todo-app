/**
 * Authentication Type Definitions
 *
 * TypeScript interfaces for authentication state, user data, and form inputs.
 * Used across all auth-related components and API clients.
 *
 * @see /specs/006-auth-integration/spec.md - FR-001 to FR-003
 */

/**
 * User Entity
 *
 * Represents authenticated user information returned from API.
 * Matches backend UserResponse schema.
 */
export interface User {
  /** Unique user identifier (UUID v4) */
  id: string;
  /** User email address (lowercase) */
  email: string;
  /** Account creation timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Authentication State
 *
 * Global state for tracking user authentication status.
 * Used by AuthContext to manage session state.
 */
export interface AuthState {
  /** Current authenticated user (null if not logged in) */
  user: User | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether auth status is being checked (loading state) */
  isLoading: boolean;
}

/**
 * Signup Form Data
 *
 * Input data for user registration form.
 * Validated before submission to /auth/signup.
 */
export interface SignupFormData {
  /** User email address (EmailStr validation) */
  email: string;
  /** User password (minimum 8 characters) */
  password: string;
}

/**
 * Login Form Data
 *
 * Input data for user login form.
 * Submitted to /auth/login endpoint.
 */
export interface LoginFormData {
  /** Registered email address */
  email: string;
  /** User password */
  password: string;
}

/**
 * Auth API Response
 *
 * Successful authentication response from backend.
 * Returned by signup and login endpoints.
 */
export interface AuthResponse {
  /** Authenticated user information */
  user: User;
  /** Success message for user feedback */
  message: string;
}

/**
 * Logout Response
 *
 * Response from logout endpoint.
 */
export interface LogoutResponse {
  /** Logout confirmation message */
  message: string;
}

/**
 * API Error Response
 *
 * Standard error format from backend.
 */
export interface ErrorResponse {
  /** Error message describing what went wrong */
  detail: string;
}
