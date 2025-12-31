'use client';

/**
 * Chat Page - AI Chatbot Interface (T056)
 *
 * Protected route that renders the ChatKit widget for conversational AI interaction.
 * Users can create, list, complete, delete, and update tasks via natural language.
 *
 * Features:
 * - Protected route (requires authentication)
 * - Full-page ChatKit widget
 * - Purple cyberpunk theme
 * - JWT token injection for backend API
 * - Loading state during auth check
 *
 * @see specs/009-ai-chatbot/plan.md - Frontend Integration
 */

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import ChatWidget from '@/components/chat/ChatWidget';
import { PurpleSpinner } from '@/components/shared/PurpleSpinner';

export default function ChatPage() {
  const { isLoading } = useProtectedRoute();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <PurpleSpinner size="lg" label="Loading chat..." />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <ChatWidget />
    </div>
  );
}
