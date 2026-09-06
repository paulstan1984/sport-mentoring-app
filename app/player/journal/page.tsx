import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDayUTC } from "@/lib/streak";
import { JournalForm } from "./JournalForm";
import { JournalHistory } from "./JournalHistory";
import { JournalDayPicker } from "./JournalDayPicker";

interface JournalPageProps {
  searchParams?: Promise<{ day?: string }>;
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const params = await searchParams;
  const today = startOfDayUTC(new Date());
  const selectedDay = params?.day
    ? startOfDayUTC(new Date(params.day))
    : today;

  const [existing, history] = await Promise.all([
    db.dailyJournal.findUnique({
      where: { playerId_day: { playerId, day: selectedDay } },
    }),
    db.dailyJournal.findMany({
      where: { playerId },
      orderBy: { day: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold leading-tight mb-1" style={{ color: "var(--kit-text)" }}>
          Reflecție zilnică
        </h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          {selectedDay.toLocaleDateString("ro-RO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <JournalDayPicker selectedDay={selectedDay} />
      <JournalForm existing={existing} selectedDay={selectedDay} />
      <JournalHistory history={history} selectedDay={selectedDay} />
    </div>
  );
}
