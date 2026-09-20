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

const mobileMoreLinks = [
  { href: "/mentor/reports", label: "Rapoarte", icon: FileText },
  { href: "/mentor/checkin-form", label: "Formular Checkin", icon: ClipboardCheck },
  { href: "/mentor/improvement-ways", label: "Îmbunătățiri", icon: TrendingUp },
  { href: "/mentor/library", label: "Bibliotecă", icon: BookOpen },
  { href: "/mentor/message", label: "Mesajul Zilei", icon: MessageSquare },
];

export function MentorMobileNav({
  playersLabel,
  isMindMentor = false,
}: {
  playersLabel: string;
  isMindMentor?: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const mainLinks = [
    { href: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mentor/players", label: playersLabel, icon: Users },
  ];

  function closeMore() {
    setMoreOpen(false);
  }

  function handleOverlayKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      closeMore();
    }
  }

  if (isMindMentor) {
    return (
      <div className="sticky bottom-0 left-0 right-0 z-10 md:hidden">
        {moreOpen && (
          <div
            role="button"
            aria-label="Închide meniul"
            tabIndex={0}
            className="fixed inset-0 z-0"
            onClick={closeMore}
            onKeyDown={handleOverlayKeyDown}
          />
        )}
        <div className="relative z-10">
          {moreOpen && (
            <div className="absolute bottom-full left-0 right-0 px-4 pb-3">
              <div
                id="mentor-more-menu"
                className="mind-card mind-border-top space-y-1 px-4 py-3 shadow-lg"
              >
                {mobileMoreLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg mind-nav-link"
                    onClick={closeMore}
                  >
                    <l.icon size={20} />
                    <span>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <nav
            className="mind-card mind-border-top flex"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {mainLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex-1 flex flex-col items-center py-2 text-xs transition-colors mind-muted"
              >
                <l.icon size={22} className="mb-0.5" />
                <span className="mt-0.5 truncate">{l.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-controls="mentor-more-menu"
              className="flex-1 flex flex-col items-center py-2 text-xs transition-colors mind-muted"
            >
              <MoreHorizontal size={22} className="mb-0.5" />
              <span className="mt-0.5 truncate">Mai mult</span>
            </button>
            <form action={logout} className="flex-1">
              <button
                type="submit"
                className="w-full h-full flex flex-col items-center py-2 text-xs transition-colors mind-muted"
              >
                <LogOut size={22} className="mb-0.5" />
                <span className="mt-0.5 truncate">Ieșire</span>
              </button>
            </form>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 md:hidden">
      {moreOpen && (
        <div
          role="button"
          aria-label="Închide meniul"
          tabIndex={0}
          className="fixed inset-0 z-0"
          onClick={closeMore}
          onKeyDown={handleOverlayKeyDown}
        />
      )}
      <div className="relative z-10">
        {moreOpen && (
          <div className="absolute bottom-full left-0 right-0 px-4 pb-3">
            <div
              id="mentor-more-menu"
              className="sport-bottom-nav space-y-1 px-4 py-3 shadow-lg"
            >
              {mobileMoreLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="sport-nav-link flex items-center gap-3 px-3 py-2 text-sm"
                  onClick={closeMore}
                >
                  <l.icon size={20} />
                  <span>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <nav
          className="sport-bottom-nav flex"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex-1 flex flex-col items-center py-2 text-xs text-blue-700 hover:text-blue-900 transition-colors"
            >
              <l.icon size={22} className="mb-0.5" />
              <span className="mt-0.5 truncate">{l.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-controls="mentor-more-menu"
            className="flex-1 flex flex-col items-center py-2 text-xs text-blue-700 hover:text-blue-900 transition-colors"
          >
            <MoreHorizontal size={22} className="mb-0.5" />
            <span className="mt-0.5 truncate">Mai mult</span>
          </button>
          <form action={logout} className="flex-1">
            <button
              type="submit"
              className="w-full h-full flex flex-col items-center py-2 text-xs text-blue-700 hover:text-red-600 transition-colors"
            >
              <LogOut size={22} className="mb-0.5" />
              <span className="mt-0.5 truncate">Ieșire</span>
            </button>
          </form>
        </nav>
      </div>
    </div>
  );
}
