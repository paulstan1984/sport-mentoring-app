"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  BookText,
  BookOpen,
  User,
} from "lucide-react";

const navLinks = [
  { href: "/player/dashboard",  label: "Acasă",     icon: Home },
  { href: "/player/checkin",    label: "Checkin",    icon: ClipboardCheck },
  { href: "/player/journal",    label: "Jurnal",     icon: BookText },
  { href: "/player/library",    label: "Bibliotecă", icon: BookOpen },
  { href: "/player/profile",    label: "Profil",     icon: User },
];

export function PlayerBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sport-bottom-nav fixed bottom-0 left-0 right-0 flex md:hidden z-20"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navLinks.map((l) => {
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
            <l.icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span className="text-[10px] font-semibold tracking-wide leading-none mt-0.5">
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
