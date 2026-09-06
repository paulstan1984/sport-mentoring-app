import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotesForm } from "./NotesForm";

export default async function NotesPage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const notes = await db.playerPersonalNote.findMany({
    where: { playerId },
    orderBy: { date: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold leading-tight mb-1" style={{ color: "var(--kit-text)" }}>
          Notițele mele
        </h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          Adaugă sau editează notițe personale.
        </p>
      </div>
      <NotesForm notes={notes} />
    </div>
  );
}
