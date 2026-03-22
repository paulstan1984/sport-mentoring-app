import Link from "next/link";
import { logout } from "@/actions/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: "/admin/mentors", label: "👥 Mentori" },
    { href: "/admin/positions", label: "🏟️ Poziții" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header (mobile) */}
      <header className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 md:hidden">
        <span className="font-bold text-sm">⚽ SportMentor</span>
        <span className="text-sm text-blue-200">Super Admin</span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 pb-20 md:pb-8 md:px-8 md:pt-8">
        {children}
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden z-10">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="text-lg leading-none">{l.label.split(" ")[0]}</span>
            <span className="mt-0.5 truncate">{l.label.split(" ").slice(1).join(" ")}</span>
          </Link>
        ))}
        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="w-full h-full flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <span className="text-lg leading-none">🚪</span>
            <span className="mt-0.5 truncate">Ieșire</span>
          </button>
        </form>
      </nav>

      {/* Side nav (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-blue-900 text-white flex-col">
        <div className="px-6 py-5 border-b border-blue-800">
          <span className="text-lg font-bold">⚽ SportMentor</span>
          <p className="text-xs text-blue-300 mt-0.5">Super Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-blue-800">
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors text-blue-200"
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
