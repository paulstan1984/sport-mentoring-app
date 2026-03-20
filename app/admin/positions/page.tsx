import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PositionManager } from "./PositionManager";

export default async function PositionsPage() {
  await requireSuperAdmin();

  const positions = await db.playfieldPosition.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Poziții pe teren</h1>
      <PositionManager positions={positions} />
    </div>
  );
}
