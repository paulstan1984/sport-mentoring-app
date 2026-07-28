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
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold leading-tight mb-1" style={{ color: "var(--kit-text)" }}>
          Reflecție zilnică
        </h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          {today.toLocaleDateString("ro-RO", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>
      <JournalForm existing={existing} />
    </div>
  );
}
