"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/actions/auth";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  TrendingUp,
  FileText,
  MoreHorizontal,
  LogOut,
} from "lucide-react";

const mainLinks = [
  { href: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mentor/players", label: "Jucători", icon: Users },
];

const moreLinks = [
  { href: "/mentor/reports", label: "Rapoarte", icon: FileText },
  { href: "/mentor/checkin-form", label: "Formular Checkin", icon: ClipboardCheck },
  { href: "/mentor/improvement-ways", label: "Îmbunătățiri", icon: TrendingUp },
  { href: "/mentor/library", label: "Bibliotecă", icon: BookOpen },
  { href: "/mentor/message", label: "Mesajul Zilei", icon: MessageSquare },
];

export function MentorMobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  function closeMore() {
    setMoreOpen(false);
  }

  function handleOverlayKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      closeMore();
    }
  }

  return (
    <>
      {moreOpen && (
        <div
          role="button"
          aria-label="Închide meniul"
          tabIndex={0}
          className="fixed inset-0 z-20"
          onClick={closeMore}
          onKeyDown={handleOverlayKeyDown}
        >
          <div
            id="mentor-more-menu"
            className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-1 z-30 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {moreLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={closeMore}
              >
                <l.icon size={20} />
                <span>{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden z-10">
        {mainLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <l.icon size={22} className="mb-0.5" />
            <span className="mt-0.5 truncate">{l.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          aria-controls="mentor-more-menu"
          className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <MoreHorizontal size={22} className="mb-0.5" />
          <span className="mt-0.5 truncate">Mai mult</span>
        </button>
        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="w-full h-full flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={22} className="mb-0.5" />
            <span className="mt-0.5 truncate">Ieșire</span>
          </button>
        </form>
      </nav>
    </>
  );
}
