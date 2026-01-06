'use client';

/**
 * ChatWidget Component (T057-T060)
 *
 * OpenAI ChatKit widget integration with custom backend and purple theme.
 *
 * Features:
 * - T057: ChatKit widget with useChatKit hook
 * - T058: Custom api.url pointing to backend chat endpoint
 * - T059: JWT token injection via custom fetch
 * - T060: Purple cyberpunk theme styling
 * - Thread persistence across sessions using localStorage
 *
 * Technical Details:
 * - Uses @openai/chatkit-react package
 * - Integrates with Better Auth JWT tokens from AuthContext
 * - Applies project's purple color scheme and glass morphism
 * - Handles SSE streaming from backend
 * - Provides error handling and loading states
 *
 * @see specs/009-ai-chatbot/plan.md - Frontend Integration
 * @see specs/009-ai-chatbot/research.md - ChatKit Configuration
 */

import { useEffect, useState, useCallback } from 'react';
import { useChatKit, ChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';

/**
 * Get authentication token from localStorage
 *
 * Retrieves JWT token from localStorage for API authentication.
 * This matches the storage method used by authApi.ts (line 59, 104).
 * Falls back to empty string if token not found.
 *
 * BUGFIX: Changed from cookie retrieval to localStorage
 * Issue: 401 Unauthorized - Authorization header was "Bearer " (empty token)
 * Root Cause: Token stored in localStorage.getItem('auth_token'), not in cookies
 *
 * @returns JWT token string
 */
function getAuthToken(): string {
  if (typeof window === 'undefined') return '';

  // Get token from localStorage (same as api.ts line 127)
  const token = localStorage.getItem('auth_token');
  return token || '';
}

/**
 * Get the stored thread ID for the current user
 * Uses user-specific key to ensure thread isolation
 *
 * @param userId - The current user's ID
 * @returns The stored thread ID or null if not found
 */
function getStoredThreadId(userId: string): string | null {
  if (typeof window === 'undefined') return null;
  if (!userId) return null;
  return localStorage.getItem(`chatkit_thread_${userId}`);
}

/**
 * Store the thread ID for the current user
 *
 * @param userId - The current user's ID
 * @param threadId - The thread ID to store
 */
function storeThreadId(userId: string, threadId: string | null): void {
  if (typeof window === 'undefined') return;
  if (!userId) return;

  if (threadId) {
    localStorage.setItem(`chatkit_thread_${userId}`, threadId);
  } else {
    localStorage.removeItem(`chatkit_thread_${userId}`);
  }
}

/**
 * Custom hook to get the initial thread ID synchronously
 * This prevents the timing issue where useChatKit initializes before we have the thread ID
 */
function useInitialThread(userId: string | undefined): string | null {
  // Use useState with initializer to run synchronously on first render
  const [threadId] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !userId) {
      return null;
    }
    const stored = localStorage.getItem(`chatkit_thread_${userId}`);
    if (stored) {
      console.log('[ChatWidget] Sync loaded thread ID:', stored);
    }
    return stored;
  });
  return threadId;
}

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Get thread ID synchronously on first render
  const initialThread = useInitialThread(user?.id);

  // Get base API URL and construct ChatKit endpoint
  // Remove /api/v1 suffix if present, then add /api/chatkit
  const getChatkitUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const baseUrl = apiUrl.replace(/\/api\/v1$/, ''); // Remove /api/v1 if present
    return `${baseUrl}/api/chatkit`;
  };

  // T058: Configure api.url to backend endpoint
  // T059: Implement custom fetch with JWT token injection
  const chatkit = useChatKit({
    api: {
      // Point to backend chat endpoint
      url: getChatkitUrl(),

      // Domain key for ChatKit (required by CustomApiConfig)
      // In production, this should be set via NEXT_PUBLIC_CHATKIT_DOMAIN_KEY
      domainKey: process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'local-dev',

      // Custom fetch with JWT authentication
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const token = getAuthToken();

        // Debug logging
        console.log('[ChatKit] Making request:', {
          url: input,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
          headers: init?.headers
        });

        // Ensure token exists
        if (!token) {
          console.error('[ChatKit] No auth token found in localStorage!');
          // Redirect to login if no token
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
          console.log('[ChatKit] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });

          // If 401, token might be expired - redirect to login
          if (response.status === 401) {
            console.error('[ChatKit] 401 Unauthorized - Token might be expired');
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }

          return response;
        } catch (error) {
          console.error('[ChatKit] Fetch error:', error);
          throw error;
        }
      },
    },

    // Error handling
    onError: ({ error }) => {
      console.error('ChatKit error:', error);

      // Handle 401 Unauthorized - redirect to login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    },
  });

  // Handle thread change events to persist thread ID
  useEffect(() => {
    if (!mounted || !chatkit.control || !user?.id) return;

    const handleThreadChange = (event: CustomEvent<{ threadId: string | null }>) => {
      const threadId = event.detail.threadId;
      console.log('[ChatWidget] Thread changed:', threadId);
      storeThreadId(user.id, threadId);
    };

    const handleThreadLoadEnd = (event: CustomEvent<{ threadId: string }>) => {
      const threadId = event.detail.threadId;
      console.log('[ChatWidget] Thread loaded:', threadId);
      storeThreadId(user.id, threadId);
    };

    // Listen for thread change events - cast to HTMLElement for event methods
    const element = chatkit.control as unknown as HTMLElement;
    element.addEventListener('chatkit.thread.change', handleThreadChange as EventListener);
    element.addEventListener('chatkit.thread.load.end', handleThreadLoadEnd as EventListener);

    return () => {
      element.removeEventListener('chatkit.thread.change', handleThreadChange as EventListener);
      element.removeEventListener('chatkit.thread.load.end', handleThreadLoadEnd as EventListener);
    };
  }, [mounted, chatkit.control, user?.id]);

  // Client-side only rendering to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-purple-400">Loading chat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-purple-400">Please log in to use the chat.</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header with purple theme */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-8 py-6 border-b border-purple-500/20 backdrop-blur-xl bg-gray-900/50"
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {/* Bot icon with purple glow */}
          <div className="p-3 bg-purple-600 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Bot className="w-8 h-8 text-white" />
          </div>

          {/* Title and subtitle */}
          <div>
            <h1 className="text-3xl font-bold text-purple-100">AI Task Assistant</h1>
            <p className="text-purple-300/80 flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4" />
              Powered by OpenAI ChatKit - Chat with your tasks
            </p>
          </div>
        </div>
      </motion.div>

      {/* ChatKit widget container with purple theme */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-hidden"
      >
        <div className="h-full max-w-6xl mx-auto px-8 py-6">
          <div className="relative h-full">
            {/* Purple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-600/30 rounded-2xl blur-xl" />

            {/* Glass container with T060: Purple theme styling */}
            <div className="relative h-full backdrop-blur-xl bg-white/5 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
              <ChatKit
                control={chatkit.control}
                className="chatkit-purple-theme h-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips section with purple theme */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-8 py-4 border-t border-purple-500/20 backdrop-blur-md bg-purple-950/30"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-purple-400" />
            Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-purple-300/80">
            <div>• "Add task to buy groceries" - Create new tasks</div>
            <div>• "Show my pending tasks" - View task lists</div>
            <div>• "Mark task 3 as complete" - Complete tasks</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
