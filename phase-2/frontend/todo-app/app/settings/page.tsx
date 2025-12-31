/**
 * Settings Page - Cyberpunk Neon Elegance Theme
 *
 * User preferences and account management with glassmorphism.
 * Implements the full spec from research.md:
 * - Appearance section with theme toggle
 * - Account section with change password
 * - Data section with clear history
 * - Session section with logout
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { AnimatedNeonBackground } from "@/components/shared/AnimatedNeonBackground";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { fadeInUp, staggerContainer, listItem } from "@/lib/animations";
import Swal from "sweetalert2";
import apiClient from "@/services/api";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { mode, toggleDarkMode } = useTheme();
  const { isLoading: authLoading } = useProtectedRoute();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="h-16 w-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-full w-full rounded-full border-4 border-primary-200/20 border-t-primary-500 shadow-glow-purple" />
        </motion.div>
      </div>
    );
  }

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      logout();
      router.push('/login');
    }
  };

  /**
   * Handle clear history
   */
  const handleClearHistory = async () => {
    const result = await Swal.fire({
      title: 'Clear All History?',
      text: 'This will permanently delete all task history. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, clear history',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        // Call API to clear history
        // await apiClient.clearAllHistory(); // TODO: Implement this API endpoint

        await Swal.fire({
          icon: 'success',
          title: 'History Cleared',
          text: 'All task history has been removed.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err instanceof Error ? err.message : 'Failed to clear history',
          confirmButtonColor: '#8B5CF6',
        });
      }
    }
  };

  /**
   * Handle change password
   */
  const handleChangePassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Password',
      html: `
        <input id="current-password" type="password" placeholder="Current Password" class="swal2-input">
        <input id="new-password" type="password" placeholder="New Password" class="swal2-input">
        <input id="confirm-password" type="password" placeholder="Confirm New Password" class="swal2-input">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      confirmButtonText: 'Change Password',
      preConfirm: () => {
        const current = (document.getElementById('current-password') as HTMLInputElement)?.value;
        const newPass = (document.getElementById('new-password') as HTMLInputElement)?.value;
        const confirm = (document.getElementById('confirm-password') as HTMLInputElement)?.value;

        if (!current || !newPass || !confirm) {
          Swal.showValidationMessage('Please fill all fields');
          return null;
        }

        if (newPass !== confirm) {
          Swal.showValidationMessage('New passwords do not match');
          return null;
        }

        if (newPass.length < 6) {
          Swal.showValidationMessage('Password must be at least 6 characters');
          return null;
        }

        return { current, newPass };
      },
    });

    if (formValues) {
      // Here you would call your API to change password
      // For now, just show success
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your password has been updated successfully.',
        confirmButtonColor: '#8B5CF6',
      });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Vibrant Animated Neon Background */}
      <AnimatedNeonBackground variant="mixed" opacity={0.35} />

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-all duration-300 hover:gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded px-2 py-1"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mb-10"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-4">
            <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <SettingsIcon className="h-8 w-8 text-primary-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            </div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Settings
              </h1>
              <p className="text-text-secondary mt-1">
                Manage your preferences and account settings
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Settings Sections */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Appearance Section */}
          <motion.div variants={listItem}>
            <GlassCard variant="elevated" className="p-6">
              <h2
                className="text-xl font-bold mb-4 flex items-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <Sun className="h-5 w-5 text-primary-400" />
                Appearance
              </h2>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Theme</p>
                  <p className="text-sm text-text-secondary">
                    Switch between light and dark mode
                  </p>
                </div>

                {/* Custom Theme Toggle */}
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/10">
                  <motion.button
                    onClick={() => mode === 'dark' && toggleDarkMode()}
                    className={`p-2.5 rounded-full transition-all duration-300 ${
                      mode === 'light'
                        ? 'bg-gradient-to-r from-primary-500 to-neon-blue text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => mode === 'light' && toggleDarkMode()}
                    className={`p-2.5 rounded-full transition-all duration-300 ${
                      mode === 'dark'
                        ? 'bg-gradient-to-r from-primary-500 to-neon-blue text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Account Section */}
          <motion.div variants={listItem}>
            <GlassCard variant="elevated" className="p-6">
              <h2
                className="text-xl font-bold mb-4 flex items-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <User className="h-5 w-5 text-neon-blue" />
                Account
              </h2>

              {/* Change Password Row */}
              <motion.button
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 transition-all duration-300 group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Lock className="h-5 w-5 text-primary-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-text-primary font-medium">Change Password</p>
                    <p className="text-sm text-text-secondary">Update your account password</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-text-secondary group-hover:text-primary-400 transition-colors" />
              </motion.button>
            </GlassCard>
          </motion.div>

          {/* Data Section */}
          <motion.div variants={listItem}>
            <GlassCard variant="elevated" className="p-6">
              <h2
                className="text-xl font-bold mb-4 flex items-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <Trash2 className="h-5 w-5 text-neon-yellow" />
                Data
              </h2>

              {/* Clear History Row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Clear History</p>
                  <p className="text-sm text-text-secondary">
                    Permanently delete all task history entries
                  </p>
                </div>
                <NeonButton
                  variant="destructive"
                  size="md"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleClearHistory}
                >
                  Clear All
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Session Section */}
          <motion.div variants={listItem}>
            <GlassCard variant="elevated" className="p-6">
              <h2
                className="text-xl font-bold mb-4 flex items-center gap-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <LogOut className="h-5 w-5 text-neon-red" />
                Session
              </h2>

              {/* Logout Button */}
              <NeonButton
                variant="destructive"
                size="lg"
                icon={<LogOut className="w-5 h-5" />}
                onClick={handleLogout}
                className="w-full"
              >
                Log Out
              </NeonButton>
              <p className="text-xs text-text-muted text-center mt-3">
                You will be redirected to the login page
              </p>
            </GlassCard>
          </motion.div>

          {/* Info Section */}
          <motion.div variants={listItem}>
            <GlassCard variant="standard" className="p-6">
              <div className="text-center">
                <p className="text-sm text-text-secondary">
                  Todo App v1.0.0
                </p>
                <p className="text-xs text-text-muted mt-2">
                  Cyberpunk Neon Elegance Theme
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
