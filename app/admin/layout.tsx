import Link from "next/link";
import { logout } from "@/actions/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-blue-800">
          <span className="text-lg font-bold">⚽ SportMentor</span>
          <p className="text-xs text-blue-300 mt-0.5">Super Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/admin/mentors"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
          >
            👥 Mentori
          </Link>
          <Link
            href="/admin/positions"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors"
          >
            🏟️ Poziții pe teren
          </Link>
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

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
