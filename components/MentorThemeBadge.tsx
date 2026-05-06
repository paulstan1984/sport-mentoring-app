import type { MentorTheme } from "@/app/generated/prisma/client";

export function MentorThemeBadge({ theme }: { theme: MentorTheme }) {
  if (theme === "MIND_MENTOR") {
    return (
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
        🧠 MindMentor
      </span>
    );
  }
  return (
    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
      ⚽ SportMentor
    </span>
  );
}
