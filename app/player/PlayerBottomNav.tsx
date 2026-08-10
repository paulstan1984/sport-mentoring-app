"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import {
  Home,
  ClipboardCheck,
  BookText,
  BookOpen,
  User,
  LogOut,
  MoreHorizontal,
  TrendingUp,
  Target,
} from "lucide-react";

const mainLinks = [
  { href: "/player/dashboard", label: "Acasă",     icon: Home },
  { href: "/player/checkin",   label: "Checkin",   icon: ClipboardCheck },
  { href: "/player/journal",   label: "Jurnal",     icon: BookText },
  { href: "/player/library",   label: "Bibliotecă", icon: BookOpen },
];

const moreLinks = [
  { href: "/player/improvement", label: "Îmbunătățiri", icon: TrendingUp },
  { href: "/player/scope",       label: "Obiectiv",     icon: Target },
  { href: "/player/profile",     label: "Profil",       icon: User },
];

export function PlayerBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function closeMore() {
    setMoreOpen(false);
  }

  function handleOverlayKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      closeMore();
    }
  }

  const moreActive = moreLinks.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/")
  );

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
            id="player-more-menu"
            className="fixed bottom-16 left-0 right-0 sport-bottom-nav px-4 py-3 space-y-1 z-30 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {moreLinks.map((l) => (
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
        className="sport-bottom-nav fixed bottom-0 left-0 right-0 flex md:hidden z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {mainLinks.map((l) => {
          const isActive =
            pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex-1 flex flex-col items-center justify-end pb-3 pt-2 gap-0.5 relative transition-colors"
              style={{ color: isActive ? "var(--kit-accent-light)" : "var(--kit-text-3)" }}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                  style={{
                    width: "2rem",
                    background: "var(--kit-accent)",
                    boxShadow: "0 0 8px var(--kit-accent)",
                  }}
                />
              )}
              <l.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold tracking-wide leading-none mt-0.5">
                {l.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          aria-expanded={moreOpen}
          aria-controls="player-more-menu"
          className="flex-1 flex flex-col items-center justify-end pb-3 pt-2 gap-0.5 relative transition-colors"
          style={{ color: moreActive ? "var(--kit-accent-light)" : "var(--kit-text-3)" }}
        >
          {moreActive && (
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
              style={{
                width: "2rem",
                background: "var(--kit-accent)",
                boxShadow: "0 0 8px var(--kit-accent)",
              }}
            />
          )}
          <MoreHorizontal size={22} strokeWidth={moreActive ? 2.5 : 1.5} />
          <span className="text-[10px] font-semibold tracking-wide leading-none mt-0.5">
            Mai mult
          </span>
        </button>
        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="w-full h-full flex flex-col items-center justify-end pb-3 pt-2 gap-0.5 transition-colors"
            style={{ color: "var(--kit-text-3)" }}
          >
            <LogOut size={22} strokeWidth={1.5} />
            <span className="text-[10px] font-semibold tracking-wide leading-none mt-0.5">
              Ieșire
            </span>
          </button>
        </form>
      </nav>
    </>
  );
}
