import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MentorForm } from "./MentorForm";
import { MentorRow } from "./MentorRow";
import { MentorCard } from "./MentorCard";

export default async function MentorsPage() {
  await requireSuperAdmin();

  const mentors = await db.mentor.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mentori</h1>
      </div>

      {/* Add mentor form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Adaugă Mentor</h2>
        <MentorForm />
      </div>

      {/* Mentors list */}
      <div className="md:hidden space-y-3">
        {mentors.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 text-center text-gray-400">
            Nu există mentori.
          </div>
        )}
        {mentors.map((m) => (
          <MentorCard key={m.id} mentor={m} />
        ))}
      </div>

      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Utilizator</th>
                <th className="text-left px-4 py-3">Nume</th>
                <th className="text-left px-4 py-3">Descriere</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {mentors.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    Nu există mentori.
                  </td>
                </tr>
              )}
              {mentors.map((m) => (
                <MentorRow key={m.id} mentor={m} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
