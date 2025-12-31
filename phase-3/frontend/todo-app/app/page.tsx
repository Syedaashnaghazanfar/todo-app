/**
 * Home Page Route
 *
 * Main landing page - shows public hero for guests, dashboard for logged in users.
 */

import DashboardHome from "@/components/HomePage/DashboardHome";
import type { Metadata } from "next";

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

export default function Home() {
  return <DashboardHome />;
}
