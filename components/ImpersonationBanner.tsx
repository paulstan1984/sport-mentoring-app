import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { stopImpersonation } from "@/actions/auth";

export async function ImpersonationBanner() {
  const session = await getSession();
  if (!session.impersonating) return null;

  let name = "";
  let roleLabel = "";

  if (session.role === "MENTOR" && session.mentorId) {
    const mentor = await db.mentor.findUnique({
      where: { id: session.mentorId },
      select: { name: true },
    });
    name = mentor?.name ?? "Antrenor";
    roleLabel = "antrenor";
  } else if (session.role === "PLAYER" && session.playerId) {
    const player = await db.player.findUnique({
      where: { id: session.playerId },
      select: { name: true },
    });
    name = player?.name ?? "Jucător";
    roleLabel = "jucător";
  }

  return (
    <div className="bg-amber-400 text-amber-900 px-4 py-2 flex items-center justify-between text-sm font-medium">
      <span>
        👁 Vizualizezi ca {roleLabel}:{" "}
        <strong>{name}</strong>
      </span>
      <form action={stopImpersonation}>
        <button
          type="submit"
          className="ml-4 underline hover:no-underline font-semibold"
        >
          ← Înapoi la Admin
        </button>
      </form>
    </div>
  );
}
