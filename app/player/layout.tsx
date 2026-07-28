export const dynamic = 'force-dynamic';

import Link from "next/link";
import { logout } from "@/actions/auth";
import { requirePlayer } from "@/lib/auth";
import { db } from "@/lib/db";
import { touchPlayerActivity } from "@/actions/player";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { OfflineStatus } from "@/components/OfflineStatus";
import { PlayerBottomNav } from "./PlayerBottomNav";
import {
  LayoutDashboard,
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
  const theme = isMindMentor ? "mind" : "sport";

  const sidebarLinks = [
    { href: "/player/dashboard",    label: "Acasă",           icon: LayoutDashboard },
    { href: "/player/checkin",      label: "Checkin zilnic",  icon: ClipboardCheck },
    { href: "/player/improvement",  label: "Îmbunătățiri",   icon: TrendingUp },
    { href: "/player/journal",      label: "Jurnal",          icon: BookText },
    { href: "/player/scope",        label: "Obiectiv",        icon: Target },
    { href: "/player/library",      label: "Bibliotecă",      icon: BookOpen },
    { href: "/player/profile",      label: "Profil",          icon: User },
  ];

  const sidebarTop = session.impersonating ? "top-10" : "top-0";

  return (
    <div
      className="min-h-screen flex flex-col"
      data-theme={theme}
      style={{ background: "var(--kit-bg)", color: "var(--kit-text)" }}
    >
      {/* Sticky top strip */}
      <div className="sticky top-0 z-30">
        <ImpersonationBanner />
        <OfflineStatus />

        {/* Top header */}
        <header
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: "var(--kit-surface)",
            borderBottom: "1px solid var(--kit-border)",
          }}
        >
          <Link href="/player/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            {mentor?.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.photo}
                alt={mentor.name ?? "Antrenor"}
                width={32}
                height={32}
                className={`object-cover shrink-0 ${
                  mentor.wideImage ? "h-7 w-auto" : "w-8 h-8 rounded-full"
                }`}
                style={mentor.wideImage ? {} : { border: "1px solid var(--kit-border-mid)" }}
              />
            ) : (
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: "var(--kit-accent-dim)",
                  color: "var(--kit-accent-light)",
                  border: "1px solid var(--kit-border-mid)",
                }}
              >
                {(mentor?.name ?? "A").charAt(0).toUpperCase()}
              </span>
            )}
            {!mentor?.wideImage && (
              <span
                className="text-sm font-semibold hidden xs:inline"
                style={{ color: "var(--kit-text)" }}
              >
                {mentor?.name ?? "Antrenor"}
              </span>
            )}
          </Link>

          <Link
            href="/player/profile"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: "var(--kit-text-2)" }}
          >
            {player?.name ?? "Jucător"}
          </Link>
        </header>
      </div>

      {/* Page content */}
      <main className="flex-1 overflow-auto px-4 pt-5 pb-24 md:pb-8 md:px-8 md:pt-8">
        {children}
      </main>

      {/* Bottom navigation (mobile only) */}
      <PlayerBottomNav />

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 ${sidebarTop} bottom-0 w-56 flex-col z-10`}
        style={{
          background: "var(--kit-surface)",
          borderRight: "1px solid var(--kit-border)",
        }}
      >
        {/* Mentor brand */}
        <div
          className="px-4 py-5"
          style={{ borderBottom: "1px solid var(--kit-border)" }}
        >
          <div className="flex items-center gap-3">
            {mentor?.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.photo}
                alt={mentor.name ?? "Antrenor"}
                width={36}
                height={36}
                className={`object-cover shrink-0 ${
                  mentor.wideImage ? "h-8 w-auto" : "w-9 h-9 rounded-full"
                }`}
                style={mentor.wideImage ? {} : { border: "1px solid var(--kit-border-mid)" }}
              />
            ) : (
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: "var(--kit-accent-dim)",
                  color: "var(--kit-accent-light)",
                }}
              >
                {(mentor?.name ?? "A").charAt(0).toUpperCase()}
              </span>
            )}
            {!mentor?.wideImage && (
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--kit-text)" }}>
                  {mentor?.name ?? "Antrenor"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--kit-text-3)" }}>
                  Mentorul tău
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: "var(--kit-text-2)" }}
            >
              <l.icon size={18} strokeWidth={1.5} />
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Player name + logout */}
        <div
          className="px-3 py-4 space-y-1"
          style={{ borderTop: "1px solid var(--kit-border)" }}
        >
          <p className="px-3 text-xs font-semibold uppercase tracking-wider truncate" style={{ color: "var(--kit-text-3)" }}>
            {player?.name ?? "Jucător"}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="kit-logout-btn w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
            >
              <LogOut size={18} strokeWidth={1.5} />
              Deconectare
            </button>
          </form>
        </div>
      </aside>

      <style>{`@media (min-width: 768px) { main { margin-left: 14rem; } }`}</style>
    </div>
  );
}


