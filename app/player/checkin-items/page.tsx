import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlayerCheckinItemsEditor } from "./PlayerCheckinItemsEditor";

export default async function PlayerCheckinItemsPage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      mentor: {
        include: {
          checkinForm: {
            include: {
              items: {
                where: { deletedAt: null, playerId },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const items = player?.mentor?.checkinForm?.items ?? [];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold mb-1">Elementele mele de checkin</h1>
        <p className="text-sm" style={{ color: "var(--kit-text-3)" }}>
          Aceste elemente apar sub cele ale mentorului în checkin-ul zilnic.
        </p>
      </div>
      <PlayerCheckinItemsEditor items={items} />
    </div>
  );
}
