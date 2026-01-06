'use client';

/**
 * ChatPanel Component
 *
 * Slide-in chat panel for Tasks page integration.
 * Reuses ChatWidget logic with slide-in animation and purple theme.
 *
 * Features:
 * - Slides in from right side (30-40% viewport width)
 * - Purple cyberpunk theme with glass morphism
 * - Maintains chat history while panel is open
 * - Close button to slide panel back out
 * - Fixed positioning above tasks content
 *
 * @see specs/009-ai-chatbot/plan.md - Frontend Integration
 */

import { useEffect, useState } from 'react';
import { useChatKit, ChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Sparkles } from 'lucide-react';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  const token = localStorage.getItem('auth_token');
  return token || '';
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Get base API URL and construct ChatKit endpoint
  // Remove /api/v1 suffix if present, then add /api/chatkit
  const getChatkitUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const baseUrl = apiUrl.replace(/\/api\/v1$/, ''); // Remove /api/v1 if present
    return `${baseUrl}/api/chatkit`;
  };

  // Configure ChatKit with backend endpoint
  const chatkit = useChatKit({
    api: {
      url: getChatkitUrl(),
      domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const token = getAuthToken();

        // Debug logging
        console.log('[ChatPanel] Making request:', {
          url: input,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
        });

        // Ensure token exists
        if (!token) {
          console.error('[ChatPanel] No auth token found in localStorage!');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }

        try {
          const response = await fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          // Debug response
          console.log('[ChatPanel] Response:', response.status, response.statusText);

          // If 401, token might be expired
          if (response.status === 401) {
            console.error('[ChatPanel] 401 Unauthorized - Token might be expired');
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }

          return response;
        } catch (error) {
          console.error('[ChatPanel] Fetch error:', error);
          throw error;
        }
      },
    },
    onError: ({ error }) => {
      console.error('ChatKit error:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    },
  });

  // Client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dim overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Chat panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[90%] md:w-[60%] lg:w-[40%] z-50 flex flex-col"
          >
            {/* Glass container with purple theme */}
            <div className="h-full backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-purple-900/30 to-gray-900/95 border-l border-purple-500/30 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50">
                <div className="flex items-center gap-3">
                  {/* Bot icon with purple glow */}
                  <div className="p-2 bg-purple-600 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-purple-100">AI Task Assistant</h2>
                    <p className="text-xs text-purple-300/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Powered by OpenAI
                    </p>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                  aria-label="Close chat panel"
                >
                  <X className="w-5 h-5 text-purple-300 group-hover:text-purple-100 transition-colors" />
                </button>
              </div>

              {/* ChatKit widget container */}
              <div className="flex-1 overflow-hidden p-4">
                <div className="relative h-full">
                  {/* Purple gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-600/20 rounded-xl blur-lg" />

                  {/* Glass container */}
                  <div className="relative h-full backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-xl shadow-lg overflow-hidden">
                    <ChatKit
                      control={chatkit.control}
                      className="chatkit-purple-theme h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Tips footer */}
              <div className="px-6 py-3 border-t border-purple-500/20 backdrop-blur-md bg-purple-950/30">
                <p className="text-xs text-purple-300/80">
                  💡 Try: "Add task to buy groceries" or "Show my pending tasks"
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
