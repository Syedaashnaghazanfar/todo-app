/**
 * Home Page Route
 *
 * Main landing page for the application.
 * Renders the HomePage container component with hero section, navigation, sidebar, and footer.
 *
 * @see /specs/001-phase2-homepage-ui/spec.md - Phase 3: T024
 */

import { HomePage } from "@/components/HomePage";
import type { Metadata } from "next";

/**
 * Page metadata for SEO
 */
export const metadata: Metadata = {
  title: "Todo App - Your Productivity Dashboard",
  description:
    "Streamline your workflow with our powerful, intuitive platform. Manage tasks, track progress, and collaborate seamlessly—all in one place.",
  keywords: ["todo", "task management", "productivity", "workflow", "collaboration"],
  authors: [{ name: "Todo App Team" }],
  openGraph: {
    title: "Todo App - Your Productivity Dashboard",
    description: "Streamline your workflow with our powerful, intuitive platform.",
    type: "website",
    locale: "en_US",
  },
};

/**
 * Home Page Component
 *
 * Entry point for the root route ("/").
 * Server component that renders the client-side HomePage container.
 */
export default function Home() {
  return <HomePage />;
}
