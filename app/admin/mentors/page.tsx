import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MentorLevel } from "@/app/generated/prisma/client";
import { AddMentorToggle } from "./AddMentorToggle";
import { MentorRow } from "./MentorRow";
import { MentorCard } from "./MentorCard";
import Link from "next/link";

const LEVEL_LABELS: Record<MentorLevel, string> = {
  FREE: "Gratuit",
  MINIMUM: "Minimum",
  MEDIUM: "Medium",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const ALL_LEVELS: MentorLevel[] = ["FREE", "MINIMUM", "MEDIUM", "PRO", "ENTERPRISE"];

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  await requireSuperAdmin();

  const { level } = await searchParams;
  const levelFilter = ALL_LEVELS.includes(level as MentorLevel) ? (level as MentorLevel) : undefined;

  const mentors = await db.mentor.findMany({
    where: levelFilter ? { level: levelFilter } : undefined,
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mentori</h1>
      </div>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/admin/mentors"
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !levelFilter
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400"
          }`}
        >
          Toți
        </Link>
        {ALL_LEVELS.map((lvl) => (
          <Link
            key={lvl}
            href={`/admin/mentors?level=${lvl}`}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              levelFilter === lvl
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400"
            }`}
          >
            {LEVEL_LABELS[lvl]}
          </Link>
        ))}
      </div>

      {/* Add mentor form — hidden by default, revealed on demand */}
      <AddMentorToggle />

      {/* Mentors list */}
      <div className="md:hidden space-y-3">
        {mentors.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 text-center text-gray-400">
            Nu există mentori{levelFilter ? ` la nivelul ${LEVEL_LABELS[levelFilter]}` : ""}.
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
                <th className="text-left px-4 py-3">Nivel</th>
                <th className="text-left px-4 py-3">Descriere</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {mentors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    Nu există mentori{levelFilter ? ` la nivelul ${LEVEL_LABELS[levelFilter]}` : ""}.
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
