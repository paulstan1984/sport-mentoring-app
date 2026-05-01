import { requirePlayer, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileClient } from "./ProfileClient";

export default async function PlayerProfilePage() {
  await requirePlayer();
  const session = await getSession();
  const playerId = session.playerId!;

  const player = await db.player.findUnique({
    where: { id: playerId },
    include: {
      user: { select: { username: true } },
      playfieldPosition: true,
    },
  });

  if (!player) return null;

  return (
    <div className="max-w-lg space-y-4 md:space-y-8">
      <h1 className="text-2xl font-bold">Profilul meu</h1>
      <ProfileClient player={player} />
    </div>
  );
}
