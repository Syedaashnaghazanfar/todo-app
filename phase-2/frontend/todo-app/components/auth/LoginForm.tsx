"use client";

/**
 * LoginForm Component
 *
 * User login form with email/password validation and purple theme.
 * Handles form state, validation, submission, and error display.
 *
 * Features:
 * - Real-time email validation (EmailStr regex)
 * - Password field with secure input
 * - Disabled submit button when form invalid
 * - Loading state during API call
 * - Lucide icons for visual enhancement
 * - Purple gradient styling matching homepage
 *
 * @see /specs/006-auth-integration/spec.md - FR-002, FR-004, FR-013, FR-014
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { login } from '@/services/authApi';
import { loginSuccess, loginError } from '@/utils/authAlerts';
import type { LoginFormData } from '@/types/auth';

/**
 * Email validation regex (EmailStr format)
 *
 * Validates: user@example.com
 * Rejects: invalid-email, @example.com, user@
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * LoginForm Component
 *
 * Renders email/password form with validation and submission handling.
 *
 * @example
 * <LoginForm />
 */
export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validate email field
   *
   * @param email - Email address to validate
   * @returns Error message or empty string if valid
   */
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  /**
   * Validate password field
   *
   * @param password - Password to validate
   * @returns Error message or empty string if valid
   */
  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    return '';
  };

  /**
   * Check if form is valid
   *
   * @returns True if all fields valid, false otherwise
   */
  const isFormValid = (): boolean => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    return !emailError && !passwordError;
  };

  /**
   * Handle input change
   *
   * Updates form data and validates field in real-time.
   *
   * @param e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate field if already touched
    if (touched[name as keyof LoginFormData]) {
      const error = name === 'email' ? validateEmail(value) : validatePassword(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Handle input blur
   *
   * Marks field as touched and validates.
   *
   * @param e - Input blur event
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = name === 'email' ? validateEmail(value) : validatePassword(value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Handle form submission
   *
   * Validates form, calls login API, shows success/error alerts.
   *
   * @param e - Form submit event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Final validation
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      await login(formData.email, formData.password);

      // Show success alert
      await loginSuccess();

      // Redirect to intended page or tasks page as fallback
      const redirectTo = searchParams.get('redirect') || '/tasks';
      router.push(redirectTo);
    } catch (error) {
      // Show error alert with API message
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      loginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md" noValidate>
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-[var(--primary-400)]" aria-hidden="true" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`
              block w-full pl-10 pr-3 py-3 rounded-lg
              bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
              disabled:bg-[var(--muted)] disabled:cursor-not-allowed
              transition-all duration-300
              shadow-[0_0_10px_rgba(139,92,246,0.1)] focus:shadow-[0_0_20px_rgba(139,92,246,0.2)]
              ${touched.email && errors.email ? 'border-[var(--destructive)] focus:ring-[var(--destructive)] focus:shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
            `}
            placeholder="you@example.com"
            required
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
          />
        </div>
        {touched.email && errors.email && (
          <p id="email-error" className="text-sm text-[var(--destructive)]" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-[var(--primary-400)]" aria-hidden="true" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`
              block w-full pl-10 pr-10 py-3 rounded-lg
              bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
              disabled:bg-[var(--muted)] disabled:cursor-not-allowed
              transition-all duration-300
              shadow-[0_0_10px_rgba(139,92,246,0.1)] focus:shadow-[0_0_20px_rgba(139,92,246,0.2)]
              ${touched.password && errors.password ? 'border-[var(--destructive)] focus:ring-[var(--destructive)] focus:shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}
            `}
            placeholder="Enter your password"
            required
            aria-invalid={touched.password && !!errors.password}
            aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--primary-400)]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {touched.password && errors.password && (
          <p id="password-error" className="text-sm text-[var(--destructive)]" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid()}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
          font-semibold text-[var(--primary-foreground)]
          bg-[var(--primary-500)]
          hover:bg-[var(--primary-400)]
          focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--muted)]
          transition-all duration-200
          transform hover:scale-105 active:scale-95
          border border-[var(--primary-500)]
          shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]
        `}
        aria-label="Log in to account"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-foreground)] border-t-transparent" />
            Logging In...
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Log In
          </>
        )}
      </button>
    </form>
  );
};

LoginForm.displayName = 'LoginForm';
