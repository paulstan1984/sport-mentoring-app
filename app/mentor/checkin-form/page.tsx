import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckinFormBuilder } from "./CheckinFormBuilder";

export default async function CheckinFormPage() {
  await requireMentor();
  const session = await getSession();
  const mentorId = session.mentorId!;

  const form = await db.checkinForm.findUnique({
    where: { mentorId },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Formular de pontaj</h1>
      <CheckinFormBuilder items={form?.items ?? []} />
    </div>
  );
}
