/**
 * Authentication Alert Utilities
 *
 * SweetAlert2 wrapper functions for authentication feedback.
 * Provides consistent purple-themed alerts across all auth flows.
 *
 * @see /specs/006-auth-integration/spec.md - FR-011 to FR-016
 */

import Swal from 'sweetalert2';

/**
 * Purple theme configuration for SweetAlert2
 *
 * Matches application primary color (#8b5cf6)
 */
const purpleTheme = {
  confirmButtonColor: '#8b5cf6',
  cancelButtonColor: '#6b7280',
  background: '#ffffff',
  color: '#1f2937',
  iconColor: '#8b5cf6',
};

/**
 * Show signup success alert
 *
 * Displays after successful account creation.
 * Auto-closes after 2 seconds to allow redirect.
 *
 * @example
 * await signupSuccess();
 * router.push('/tasks');
 */
export const signupSuccess = async (): Promise<void> => {
  await Swal.fire({
    icon: 'success',
    title: 'Account Created!',
    text: 'Account created successfully! Welcome to TodoApp.',
    ...purpleTheme,
    timer: 2000,
    showConfirmButton: false,
  });
};

/**
 * Show signup error alert
 *
 * Displays specific error message from API response.
 * User must dismiss to continue.
 *
 * @param message - Error message from backend (e.g., "Email already registered")
 *
 * @example
 * signupError('Email already registered. Please login instead.');
 */
export const signupError = (message: string): void => {
  Swal.fire({
    icon: 'error',
    title: 'Signup Failed',
    text: message,
    ...purpleTheme,
    confirmButtonText: 'OK',
  });
};

/**
 * Show login success alert
 *
 * Displays after successful authentication.
 * Auto-closes after 1.5 seconds to allow redirect.
 *
 * @example
 * await loginSuccess();
 * router.push('/tasks');
 */
export const loginSuccess = async (): Promise<void> => {
  await Swal.fire({
    icon: 'success',
    title: 'Welcome Back!',
    text: 'Login successful. Redirecting to your tasks...',
    ...purpleTheme,
    timer: 1500,
    showConfirmButton: false,
  });
};

/**
 * Show login error alert
 *
 * Displays authentication failure message.
 * User must dismiss to continue.
 *
 * @param message - Error message from backend (default: "Invalid email or password")
 *
 * @example
 * loginError('Invalid email or password');
 */
export const loginError = (message: string = 'Invalid email or password'): void => {
  Swal.fire({
    icon: 'error',
    title: 'Login Failed',
    text: message,
    ...purpleTheme,
    confirmButtonText: 'Try Again',
  });
};

/**
 * Show session expired alert
 *
 * Displays when JWT token is invalid or expired (401 response).
 * Redirects to login page after dismissal.
 *
 * @example
 * sessionExpired().then(() => router.push('/login'));
 */
export const sessionExpired = async (): Promise<void> => {
  await Swal.fire({
    icon: 'warning',
    title: 'Session Expired',
    text: 'Your session has expired. Please log in again.',
    ...purpleTheme,
    confirmButtonText: 'Go to Login',
  });
};

/**
 * Show logout success alert
 *
 * Displays after successful logout.
 * Auto-closes after 1.5 seconds.
 *
 * @example
 * await logoutSuccess();
 * router.push('/login');
 */
export const logoutSuccess = async (): Promise<void> => {
  await Swal.fire({
    icon: 'success',
    title: 'Logged Out',
    text: 'You have been logged out successfully',
    ...purpleTheme,
    timer: 1500,
    showConfirmButton: false,
  });
};

/**
 * Show generic auth error alert
 *
 * Fallback for unexpected errors during authentication.
 *
 * @param message - Custom error message (default: generic message)
 *
 * @example
 * authError('Network error. Please try again.');
 */
export const authError = (message: string = 'An error occurred. Please try again.'): void => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    ...purpleTheme,
    confirmButtonText: 'OK',
  });
};
