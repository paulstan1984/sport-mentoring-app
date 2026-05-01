export const dynamic = 'force-dynamic';

import Link from "next/link";
import { logout } from "@/actions/auth";
import { db } from "@/lib/db";
import { SignupRequestStatus } from "@/app/generated/prisma/client";
import {
  Users,
  LayoutGrid,
  Database,
  LogOut,
  UserCircle,
  Wrench,
  ClipboardList,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pendingCount = await db.adminRequest.count({
    where: { status: SignupRequestStatus.PENDING },
  });

  const navLinks = [
    { href: "/admin/mentors", label: "Mentori", icon: Users },
    {
      href: "/admin/signups",
      label: "Cereri",
      icon: ClipboardList,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { href: "/admin/positions", label: "Poziții", icon: LayoutGrid },
    { href: "/admin/tools", label: "Unelte", icon: Wrench },
    { href: "/admin/profile", label: "Profil", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header (mobile) */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 md:hidden">
        <span className="font-bold text-sm">⚽ Sport Mentor</span>
        <span className="text-sm text-blue-200">Super Admin</span>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-2 pb-20 md:p-4 md:pb-8 md:px-8 md:pt-8">
        {children}
      </main>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden z-10">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative"
          >
            <div className="relative">
              <l.icon size={22} className="mb-0.5" />
              {l.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {l.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5 truncate">{l.label}</span>
          </Link>
        ))}
        <a
          href="/api/admin/download-db"
          download="app.db"
          className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Database size={22} className="mb-0.5" />
          <span className="mt-0.5 truncate">DB</span>
        </a>
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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-blue-600">⚽ Sport Mentor</span>
          <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <div className="relative">
                <l.icon size={20} />
                {l.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {l.badge}
                  </span>
                )}
              </div>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <a
            href="/api/admin/download-db"
            download="app.db"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Database size={20} />
            Descarcă baza de date
          </a>
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
      <style>{`@media (min-width: 768px) { main { margin-left: 14rem; } }`}</style>
    </div>
  );
}
