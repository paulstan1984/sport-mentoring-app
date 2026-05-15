export const dynamic = 'force-dynamic';

import Link from "next/link";
import { logout } from "@/actions/auth";
import { requireMentor } from "@/lib/auth";
import { db } from "@/lib/db";
import { MentorMobileNav } from "./MentorMobileNav";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { OfflineStatus } from "@/components/OfflineStatus";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  Settings,
  TrendingUp,
  FileText,
  LogOut,
} from "lucide-react";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireMentor();
  const mentor = await db.mentor.findUnique({
    where: { id: session.mentorId },
    select: { name: true, level: true, theme: true, labels: { select: { key: true, value: true } } },
  });

  const LEVEL_LABEL: Record<string, string> = {
    FREE: "Free",
    MINIMUM: "Minimum",
    MEDIUM: "Medium",
    PRO: "Pro",
    ENTERPRISE: "Enterprise",
  };
  const levelLabel = mentor?.level ? (LEVEL_LABEL[mentor.level] ?? mentor.level) : null;
  const isMindMentor = mentor?.theme === "MIND_MENTOR";

  const playersLabel =
    mentor?.labels.find((l) => l.key === "players")?.value ?? "Clienți";

  // Update last_active_at on every request to a mentor route
  await db.mentor.update({
    where: { id: session.mentorId },
    data: { lastActiveAt: new Date() },
  });

  const navLinks = [
    { href: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mentor/players", label: playersLabel, icon: Users },
    { href: "/mentor/reports", label: "Rapoarte", icon: FileText },
    { href: "/mentor/checkin-form", label: "Formular Checkin", icon: ClipboardCheck },
    { href: "/mentor/improvement-ways", label: "Îmbunătățiri", icon: TrendingUp },
    { href: "/mentor/library", label: "Bibliotecă", icon: BookOpen },
    { href: "/mentor/message", label: "Mesajul Zilei", icon: MessageSquare },
    { href: "/mentor/profile", label: "Profil", icon: Settings },
  ];

  const sidebarTop = session.impersonating ? "top-10" : "top-0";

  if (isMindMentor) {
    return (
      <div className="min-h-screen flex flex-col mind-bg">
        <div className="sticky top-0 z-20">
          <ImpersonationBanner />
          <OfflineStatus />
          {/* Top header (mobile) — MindMentor */}
          <header className="mind-header px-4 py-3 flex items-center justify-between md:hidden">
            <Link href="/mentor/dashboard" className="font-bold text-sm hover:opacity-80 mind-accent">
              🧠 MindMentor
            </Link>
            <Link href="/mentor/profile" className="text-sm flex items-center gap-2 hover:opacity-80 mind-muted">
              {mentor?.name ?? "Mentor"}
              {levelLabel && (
                <span className="text-xs px-1.5 py-0.5 rounded font-medium mind-level-badge">
                  {levelLabel}
                </span>
              )}
            </Link>
          </header>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-2 pb-20 md:p-4 md:pb-8 md:px-8 md:pt-8">{children}</main>

        {/* Bottom navigation (mobile-first) */}
        <MentorMobileNav playersLabel={playersLabel} isMindMentor={true} />

        {/* Side nav (desktop) — MindMentor */}
        <aside
          className={`hidden md:flex fixed left-0 ${sidebarTop} bottom-0 w-56 flex-col shadow-xl mind-sidebar`}
        >
          <div className="px-6 py-5 mind-border-bottom">
            <Link href="/mentor/dashboard" className="text-lg font-bold hover:opacity-80 mind-accent">
              🧠 MindMentor
            </Link>
            <Link href="/mentor/profile" className="flex items-center gap-2 mt-0.5 hover:opacity-80 mind-muted">
              <span className="text-xs truncate">{mentor?.name ?? "Mentor"}</span>
              {levelLabel && (
                <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0 mind-level-badge">
                  {levelLabel}
                </span>
              )}
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="mind-nav-link flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
              >
                <l.icon size={20} />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="px-3 py-4 mind-border-top">
            <form action={logout}>
              <button
                type="submit"
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mind-logout"
              >
                <LogOut size={20} />
                Deconectare
              </button>
            </form>
          </div>
        </aside>

        {/* Offset for desktop sidebar */}
        <style>{`@media (min-width: 768px) { main { margin-left: 14rem; } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sport-bg">
      <div className="sticky top-0 z-20">
        <ImpersonationBanner />
        <OfflineStatus />
        {/* Top header (mobile) */}
        <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between md:hidden">
        <Link href="/mentor/dashboard" className="font-bold text-sm text-white hover:text-blue-100">
          ⚽ Sport Mentor
        </Link>
        <Link href="/mentor/profile" className="text-sm text-blue-200 hover:text-white flex items-center gap-2">
          {mentor?.name ?? "Mentor"}
          {levelLabel && (
            <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">
              {levelLabel}
            </span>
          )}
        </Link>
        </header>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-2 pb-20 md:p-4 md:pb-8 md:px-8 md:pt-8">{children}</main>

      {/* Bottom navigation (mobile-first) */}
      <MentorMobileNav playersLabel={playersLabel} />

      {/* Side nav (desktop) */}
      <aside className={`hidden md:flex fixed left-0 ${sidebarTop} bottom-0 w-56 flex-col shadow-md sport-sidebar`}>
        <div className="px-6 py-5 border-b border-blue-200/40">
          <Link href="/mentor/dashboard" className="text-lg font-bold text-blue-700 hover:text-blue-800">
            ⚽ Sport Mentor
          </Link>
          <Link href="/mentor/profile" className="flex items-center gap-2 mt-0.5 hover:text-blue-700">
            <span className="text-xs text-blue-600/70 truncate">{mentor?.name ?? "Mentor"}</span>
            {levelLabel && (
              <span className="text-xs bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded font-medium shrink-0">
                {levelLabel}
              </span>
            )}
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="sport-nav-link flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
            >
              <l.icon size={20} />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-blue-200/40">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-700/70 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              Deconectare
            </button>
          </form>
        </div>
      </aside>

      {/* Offset for desktop sidebar */}
      <style>{`@media (min-width: 768px) { main { margin-left: 14rem; } }`}</style>
    </div>
  );
}
