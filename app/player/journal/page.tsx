import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { JournalForm } from "./JournalForm";

export default async function JournalPage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const today = startOfDayUTC(new Date());

  const existing = await db.dailyJournal.findUnique({
    where: { playerId_day: { playerId, day: today } },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Reflecție zilnică</h1>
      <p className="text-sm text-gray-400 mb-6">
        {today.toLocaleDateString("ro-RO", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
      <JournalForm existing={existing} />
    </div>
  );
}
