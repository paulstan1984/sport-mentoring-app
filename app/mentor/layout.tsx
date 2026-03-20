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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
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

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
