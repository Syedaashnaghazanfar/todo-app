"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  BarChart3,
  Settings,
  LogOut,
  Calendar,
  Tag,
  ListTodo,
  Bell,
  Sparkles,
} from "lucide-react";

// Simple date formatter
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TAG_COLORS: Record<string, string> = {
  Work: "bg-blue-500",
  Personal: "bg-green-500",
  Shopping: "bg-yellow-500",
  Health: "bg-orange-500",
  Finance: "bg-purple-500",
  Learning: "bg-teal-500",
  Urgent: "bg-red-500",
};

const TAG_COLORS_LIGHT: Record<string, string> = {
  Work: "bg-blue-100 text-blue-700",
  Personal: "bg-green-100 text-green-700",
  Shopping: "bg-yellow-100 text-yellow-700",
  Health: "bg-orange-100 text-orange-700",
  Finance: "bg-purple-100 text-purple-700",
  Learning: "bg-teal-100 text-teal-700",
  Urgent: "bg-red-100 text-red-700",
};

export default function HomePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { tasks, loading: tasksLoading, refreshTasks } = useTasks();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PublicHomePage />;
  }

  // Calculate stats
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.length - completedTasks;
  const urgentTasks = tasks.filter((t) => t.priority === "VERY_IMPORTANT" && t.status !== "COMPLETED").length;

  // Get recent tasks (last 5)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calculate tag distribution for donut chart
  const tagCounts = tasks.reduce((acc, task) => {
    task.tags?.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalTags = Object.values(tagCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border)] p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)]">Todo App</span>
        </div>

        <nav className="space-y-2">
          <NavLink href="/tasks" icon={<ListTodo />} label="My Tasks" active />
          <NavLink href="/history" icon={<Clock />} label="History" />
          <NavLink href="/analytics" icon={<BarChart3 />} label="Analytics" />
          <NavLink href="/notifications" icon={<Bell />} label="Notifications" />
          <NavLink href="/settings" icon={<Settings />} label="Settings" />
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome back, {user?.email?.split("@")[0] || "there"}! 👋
          </h1>
          <p className="text-[var(--text-secondary)]">Here's what's happening with your tasks today.</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Tasks"
            value={pendingTasks}
            color="orange"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Completed"
            value={completedTasks}
            color="green"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Urgent"
            value={urgentTasks}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Tasks</h2>
              <Link
                href="/tasks"
                className="text-[var(--primary)] hover:text-[var(--primary-400)] text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-t-transparent" />
              </div>
            ) : recentTasks.length === 0 ? (
              <EmptyState message="No tasks yet. Create your first task!" />
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          {/* Donut Chart - Tasks by Tag */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Tasks by Tag</h2>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-t-transparent" />
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState message="No tasks to analyze yet." />
            ) : (
              <div>
                {/* Donut Chart SVG */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {Object.entries(tagCounts).map(([tag, count], index) => {
                      const percentage = (count / totalTags) * 100;
                      const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#6366F1"];
                      const color = colors[index % colors.length];
                      const circumference = 2 * Math.PI * 35;
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -circumference * (index / Object.entries(tagCounts).length);

                      return (
                        <circle
                          key={tag}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke={color}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--text-primary)]">{tasks.length}</div>
                      <div className="text-xs text-[var(--text-muted)]">Total</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {Object.entries(tagCounts).map(([tag, count], index) => {
                    const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#6366F1"];
                    const color = colors[index % colors.length];
                    const percentage = Math.round((count / totalTags) * 100);

                    return (
                      <div key={tag} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-sm text-[var(--text-secondary)]">{tag}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{count}</span>
                          <span className="text-xs text-[var(--text-muted)]">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              href="/tasks"
              icon={<Plus className="w-6 h-6" />}
              label="Add Task"
              color="purple"
            />
            <QuickActionCard
              href="/history"
              icon={<Clock className="w-6 h-6" />}
              label="History"
              color="blue"
            />
            <QuickActionCard
              href="/analytics"
              icon={<BarChart3 className="w-6 h-6" />}
              label="Analytics"
              color="green"
            />
            <QuickActionCard
              href="/settings"
              icon={<Settings className="w-6 h-6" />}
              label="Settings"
              color="orange"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "orange" | "green" | "red";
}) {
  const colors = {
    orange: "bg-orange-500",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{value}</div>
          <div className="text-sm text-[var(--text-secondary)]">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  const priorityColors = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-blue-100 text-blue-600",
    HIGH: "bg-orange-100 text-orange-600",
    VERY_IMPORTANT: "bg-red-100 text-red-600",
  };

  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)] ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
          isCompleted
            ? "bg-[var(--primary)] border-[var(--primary)]"
            : "border-[var(--text-muted)] hover:border-[var(--primary)]"
        }`}
      >
        {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-[var(--text-primary)] truncate ${isCompleted ? "line-through opacity-60" : ""}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.tags && task.tags.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Tag className="w-3 h-3" />
              <span className={`px-2 py-0.5 rounded-full text-xs ${TAG_COLORS_LIGHT[task.tags[0]] || "bg-gray-100 text-gray-600"}`}>
                {task.tags[0]}
              </span>
            </span>
          )}
        </div>
      </div>
      {task.priority && task.priority !== "LOW" && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
          {task.priority.replace("_", " ")}
        </span>
      )}
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: "purple" | "blue" | "orange" | "green" | "red";
}) {
  const colors = {
    purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
    orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
    green: "bg-green-100 text-green-600 group-hover:bg-green-200",
    red: "bg-red-100 text-red-600 group-hover:bg-red-200",
  };

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)] group hover:border-[var(--primary)] transition-all"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="font-medium text-[var(--text-primary)]">{label}</span>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--bg-dark)] flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <p className="text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}

function PublicHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-dark)] via-[var(--bg-card)] to-[var(--bg-dark)] flex items-center justify-center overflow-hidden py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* LEFT SIDE - Animated Notepad */}
          <div className="flex items-center justify-center lg:justify-end order-2 lg:order-1 px-4 sm:px-0">
            <div className="relative w-full max-w-md mx-auto">
              {/* Notepad Container */}
              <div
                className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-100/10 dark:to-yellow-100/5 rounded-lg shadow-2xl p-6 sm:p-8 pb-10 sm:pb-12 relative overflow-hidden"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    transparent,
                    transparent 31px,
                    rgba(59, 130, 246, 0.15) 31px,
                    rgba(59, 130, 246, 0.15) 32px
                  )`,
                  backgroundSize: '100% 32px',
                  animation: 'float 6s ease-in-out infinite'
                }}
              >
                {/* Red margin line */}
                <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-[2px] bg-red-400/30" />

                {/* Paper texture overlay */}
                <div className="absolute inset-0 opacity-5 mix-blend-multiply pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4' /%3E%3C/svg%3E")`
                  }}
                />

                {/* Animated Tasks */}
                <div className="relative space-y-6 sm:space-y-8 pl-6 sm:pl-8">
                  {[
                    { text: '☐ Buy groceries', delay: '0s' },
                    { text: '☐ Finish project report', delay: '2s' },
                    { text: '☐ Plan tomorrow', delay: '4s' },
                    { text: '☐ Review emails', delay: '6s' }
                  ].map((task, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span
                        className="font-handwriting text-lg sm:text-xl text-gray-800 dark:text-gray-300"
                        style={{
                          animation: `typewriter 1.5s steps(${task.text.length}) ${task.delay} 1 normal both, fadeIn 0.5s ${task.delay} ease-out both`,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          borderRight: '2px solid transparent',
                          display: 'inline-block',
                        }}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}

                  {/* Blinking cursor at the end */}
                  <div
                    className="w-0.5 h-4 sm:h-5 bg-gray-800 dark:bg-gray-300"
                    style={{
                      animation: 'blink 1s step-end 8s infinite'
                    }}
                  />
                </div>

                {/* Notepad spiral binding effect */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-400/20 to-transparent" />
              </div>

              {/* Shadow beneath notepad */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/10 blur-xl rounded-full" />
            </div>
          </div>

          {/* RIGHT SIDE - Welcome Content */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2 px-4 sm:px-0">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                <span className="block text-[var(--text-primary)] mb-2">Welcome to</span>
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Todo App
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-lg leading-relaxed">
                Your mindful companion for focused productivity.
                <span className="block mt-2 text-[var(--text-muted)]">
                  Organize. Prioritize. Achieve.
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/signup"
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-[var(--primary)] text-white font-semibold rounded-xl hover:bg-[var(--primary-400)] transition-all duration-300 shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/40 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/login"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-elevated)] transition-all duration-300"
              >
                Log In
              </Link>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-6 sm:pt-8">
              {[
                { icon: '✓', text: 'Simple & Intuitive' },
                { icon: '⚡', text: 'Lightning Fast' },
                { icon: '🎯', text: 'Stay Focused' },
                { icon: '📱', text: 'Works Everywhere' }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[var(--text-secondary)]"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${0.8 + i * 0.1}s both`
                  }}
                >
                  <span className="text-xl sm:text-2xl">{feature.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');

        .font-handwriting {
          font-family: 'Indie Flower', cursive;
        }

        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
