import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { MessageEditor } from "./MessageEditor";
import { RichTextViewer } from "@/components/RichTextViewer";

export default async function MessagePage() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const today = startOfDayUTC(new Date());

  const [todayMsg, pastMessages] = await Promise.all([
    db.dailyMessage.findUnique({
      where: { mentorId_day: { mentorId, day: today } },
    }),
    db.dailyMessage.findMany({
      where: {
        mentorId,
        day: { lt: today },
      },
      orderBy: { day: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Mesajul zilei</h1>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">
          Mesajul de astăzi —{" "}
          {today.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        <MessageEditor currentMessage={todayMsg?.message ?? ""} />
      </div>

      {/* Past messages */}
      {pastMessages.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">Mesaje anterioare</h2>
          <div className="space-y-4">
            {pastMessages.map((m) => (
              <div key={m.id} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(m.day).toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <RichTextViewer html={m.message} className="text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
