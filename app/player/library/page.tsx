import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LibraryList } from "./LibraryList";

export default async function PlayerLibraryPage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) return null;

  const items = await db.libraryItem.findMany({
    where: { mentorId: player.mentorId },
    include: {
      reads: { where: { playerId } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = items.map((item) => ({
    id: item.id,
    name: item.name,
    fileType: item.fileType,
    isRead: item.reads.length > 0,
  }));

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Bibliotecă</h1>
      <LibraryList items={serialized} />
    </div>
  );
}
