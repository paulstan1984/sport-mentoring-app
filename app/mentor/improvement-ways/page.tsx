import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ImprovementWayBuilder } from "./ImprovementWayBuilder";

export default async function ImprovementWaysPage() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const ways = await db.improvementWay.findMany({
    where: { mentorId, deletedAt: null },
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Modalități de îmbunătățire</h1>
      <p className="text-sm text-gray-400 mb-6">
        Definește modalitățile de îmbunătățire pe care jucătorii tăi le vor evalua zilnic (scor 1–5).
      </p>
      <ImprovementWayBuilder ways={ways} />
    </div>
  );
}
