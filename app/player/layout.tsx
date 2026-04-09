import Link from "next/link";
import { logout } from "@/actions/auth";
import { requirePlayer } from "@/lib/auth";
import { db } from "@/lib/db";
import { touchPlayerActivity } from "@/actions/player";
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
        select: { name: true, photo: true },
      })
    : null;

  const navLinks = [
    { href: "/player/dashboard", label: "Acasă", icon: Home },
    { href: "/player/checkin", label: "Checkin", icon: ClipboardCheck },
    { href: "/player/improvement", label: "Îmbunătățiri", icon: TrendingUp },
    { href: "/player/journal", label: "Jurnal", icon: BookText },
    { href: "/player/scope", label: "Obiectiv", icon: Target },
    { href: "/player/library", label: "Bibliotecă", icon: BookOpen },
    { href: "/player/profile", label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header (mobile) */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/player/dashboard" className="flex items-center gap-2 hover:opacity-90">
          {mentor?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.photo}
              alt={mentor.name ?? "Antrenor"}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover border border-white/30 shrink-0"
            />
          ) : (
            <span className="text-base">⚽</span>
          )}
          <span className="font-bold text-sm text-white">{mentor?.name ?? "Antrenor"}</span>
        </Link>
        <Link href="/player/profile" className="text-sm text-blue-200 hover:text-white">
          {player?.name ?? "Jucător"}
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pb-20 md:pb-4 md:px-8 md:pt-8">
        {children}
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden z-10">
        {navLinks.slice(0, 3).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <l.icon size={22} className="mb-0.5" />
            <span className="mt-0.5 truncate">{l.label}</span>
          </Link>
        ))}
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

      {/* Side nav (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-52 bg-white border-r border-gray-200 flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/player/dashboard" className="flex items-center gap-2 hover:opacity-90">
            {mentor?.photo ? (
              <img
                src={mentor.photo}
                alt={mentor.name ?? "Antrenor"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <span className="text-lg">⚽</span>
            )}
            <span className="text-base font-bold text-blue-600 hover:text-blue-700 truncate">
              {mentor?.name ?? "Antrenor"}
            </span>
          </Link>
          <Link href="/player/profile" className="block text-xs text-gray-400 mt-0.5 truncate hover:text-gray-600">
            {player?.name ?? "Jucător"}
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <l.icon size={20} />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
