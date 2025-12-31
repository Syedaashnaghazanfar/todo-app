/**
 * Quick Action Cards Data
 *
 * Defines the data structure and content for the quick-action cards
 * displayed on the homepage. Each card includes an icon, title,
 * description, and navigation link.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 4: T029
 */

import {
  FileText,
  Calendar,
  History,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  User
} from 'lucide-react';

// Define the quick action cards data
export const quickActionCards = [
  {
    id: 'manage-tasks',
    icon: FileText,
    title: 'Manage Tasks',
    description: 'Create, track, and manage your daily tasks with our intuitive interface.',
    link: '/tasks',
    target: '_self' as const
  },
  {
    id: 'schedule-meeting',
    icon: Calendar,
    title: 'Schedule Meeting',
    description: 'Book and manage meetings with your team members seamlessly.',
    link: '/calendar',
    target: '_self' as const
  },
  {
    id: 'history',
    icon: History,
    title: 'History',
    description: 'View your complete task history and activity log.',
    link: '/history',
    target: '_self' as const
  },
  {
    id: 'analytics-dashboard',
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Visualize your data and track performance with interactive charts.',
    link: '/analytics',
    target: '_self' as const
  },
  {
    id: 'account-settings',
    icon: Settings,
    title: 'Account Settings',
    description: 'Manage your profile, preferences, and security settings.',
    link: '/settings',
    target: '_self' as const
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Review and manage your notifications and alerts.',
    link: '/notifications',
    target: '_self' as const
  }
];