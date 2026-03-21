import Link from "next/link";
import { logout } from "@/actions/auth";
import { requireMentor } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireMentor();
  const mentor = await db.mentor.findUnique({
    where: { id: session.mentorId },
    select: { name: true },
  });

  // Update last_active_at on every request to a mentor route
  await db.mentor.update({
    where: { id: session.mentorId },
    data: { lastActiveAt: new Date() },
  });

  const navLinks = [
    { href: "/mentor/dashboard", label: "📊 Dashboard" },
    { href: "/mentor/players", label: "👥 Jucători" },
    { href: "/mentor/checkin-form", label: "✅ Formular Pontaj" },
    { href: "/mentor/library", label: "📚 Bibliotecă" },
    { href: "/mentor/message", label: "💬 Mesajul Zilei" },
    { href: "/mentor/profile", label: "⚙️ Profil" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header (mobile) */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 md:hidden">
        <span className="font-bold text-sm">⚽ SportMentor</span>
        <span className="text-sm text-blue-200">{mentor?.name ?? "Mentor"}</span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pb-20 md:pb-8 md:px-8 md:pt-8">{children}</main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden z-10">
        {navLinks.slice(0, 5).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="text-lg leading-none">{l.label.split(" ")[0]}</span>
            <span className="mt-0.5 truncate">{l.label.split(" ").slice(1).join(" ")}</span>
          </Link>
        ))}
      </nav>

      {/* Side nav (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-gray-900 text-white flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-lg font-bold text-blue-400">⚽ SportMentor</span>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {mentor?.name ?? "Mentor"}
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors text-gray-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-700">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors text-gray-400"
            >
              🚪 Deconectare
            </button>
          </form>
        </div>
      </aside>

      {/* Offset for desktop sidebar */}
      <style>{`@media (min-width: 768px) { main { margin-left: 14rem; } }`}</style>
    </div>
  );
}
