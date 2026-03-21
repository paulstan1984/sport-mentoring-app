import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const [items, players] = await Promise.all([
    db.libraryItem.findMany({
      where: { mentorId },
      include: {
        reads: { include: { player: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.player.findMany({
      where: { mentorId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Bibliotecă</h1>
      <LibraryClient items={items} players={players} mentorId={mentorId} />
    </div>
  );
}
