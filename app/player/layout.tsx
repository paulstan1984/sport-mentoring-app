export const dynamic = 'force-dynamic';

import Link from "next/link";
import { logout } from "@/actions/auth";
import { requirePlayer } from "@/lib/auth";
import { db } from "@/lib/db";
import { touchPlayerActivity } from "@/actions/player";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { OfflineStatus } from "@/components/OfflineStatus";
import {
  Home,
  ClipboardCheck,
  BookText,
  Target,
  BookOpen,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePlayer();

  // Update activity timestamp
  await touchPlayerActivity();

  const player = await db.player.findUnique({
    where: { id: session.playerId },
    select: { name: true, mentorId: true },
  });

  const mentor = player
    ? await db.mentor.findUnique({
        where: { id: player.mentorId },
        select: { name: true, photo: true, theme: true, wideImage: true },
      })
    : null;

  const isMindMentor = mentor?.theme === "MIND_MENTOR";

  const navLinks = [
    { href: "/player/dashboard", label: "Acasă", icon: Home },
    { href: "/player/checkin", label: "Checkin", icon: ClipboardCheck },
    { href: "/player/improvement", label: "Îmbunătățiri", icon: TrendingUp },
    { href: "/player/journal", label: "Jurnal", icon: BookText },
    { href: "/player/scope", label: "Obiectiv", icon: Target },
    { href: "/player/library", label: "Bibliotecă", icon: BookOpen },
    { href: "/player/profile", label: "Profil", icon: User },
  ];

  const sidebarTop = session.impersonating ? "top-10" : "top-0";

  if (isMindMentor) {
    return (
      <div className="min-h-screen flex flex-col mind-bg">
        <div className="sticky top-0 z-20">
          <ImpersonationBanner />
          <OfflineStatus />
          {/* Top header — MindMentor */}
          <header className="mind-header px-4 py-3 flex items-center justify-between">
            <Link href="/player/dashboard" className="flex items-center gap-2 hover:opacity-80">
              {mentor?.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mentor.photo}
                  alt={mentor.name ?? "Psiholog"}
                  width={28}
                  height={28}
                  className={`object-cover shrink-0 ${mentor.wideImage ? "h-7 w-auto" : "w-7 h-7 rounded-full"}`}
                />
              ) : (
                <span className="text-base">🧠</span>
              )}
              {!mentor?.wideImage && (
                <span className="font-bold text-sm mind-accent">{mentor?.name ?? "Psiholog"}</span>
              )}
            </Link>
            <Link href="/player/profile" className="text-sm hover:opacity-80 mind-muted">
              {player?.name ?? "Client"}
            </Link>
          </header>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-2 pb-20 md:p-4 md:pb-4 md:px-8 md:pt-8">
          {children}
        </main>

        {/* Bottom navigation (mobile-first) — MindMentor */}
        <nav className="mind-card mind-border-top fixed bottom-0 left-0 right-0 flex md:hidden z-10">
          {navLinks.slice(0, 3).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex-1 flex flex-col items-center py-2 text-xs transition-colors mind-muted"
            >
              <l.icon size={22} className="mb-0.5" />
              <span className="mt-0.5 truncate">{l.label}</span>
            </Link>
          ))}
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

        {/* Side nav (desktop) — MindMentor */}
        <aside
          className={`hidden md:flex fixed left-0 ${sidebarTop} bottom-0 w-52 flex-col shadow-xl mind-sidebar`}
        >
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
        <style>{`@media (min-width: 768px) { main { margin-left: 13rem; } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sport-bg">
      <div className="sticky top-0 z-20">
        <ImpersonationBanner />
        <OfflineStatus />
        {/* Top header (mobile) */}
        <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/player/dashboard" className="flex items-center gap-2 hover:opacity-90">
          {mentor?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.photo}
              alt={mentor.name ?? "Antrenor"}
              width={28}
              height={28}
              className={`object-cover shrink-0 ${mentor.wideImage ? "h-7 w-auto" : "w-7 h-7 rounded-full"}`}
            />
          ) : (
            <span className="text-base">⚽</span>
          )}
          {!mentor?.wideImage && (
            <span className="font-bold text-sm text-white">{mentor?.name ?? "Antrenor"}</span>
          )}
        </Link>
        <Link href="/player/profile" className="text-sm text-blue-200 hover:text-white">
          {player?.name ?? "Jucător"}
        </Link>
        </header>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-2 pb-20 md:p-4 md:pb-4 md:px-8 md:pt-8">
        {children}
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="sport-bottom-nav fixed bottom-0 left-0 right-0 flex md:hidden z-10">
        {navLinks.slice(0, 3).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-2 text-xs text-blue-700 hover:text-blue-900 transition-colors"
          >
            <l.icon size={22} className="mb-0.5" />
            <span className="mt-0.5 truncate">{l.label}</span>
          </Link>
        ))}
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

      {/* Side nav (desktop) */}
      <aside className={`hidden md:flex fixed left-0 ${sidebarTop} bottom-0 w-52 flex-col shadow-md sport-sidebar`}>
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
      <style>{`@media (min-width: 768px) { main { margin-left: 13rem; } }`}</style>
    </div>
  );
}
