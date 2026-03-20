import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm, PasswordForm } from "./ProfileForm";

export default async function MentorProfilePage() {
  await requireMentor();
  const session = await getSession();

  const mentor = await db.mentor.findUnique({
    where: { id: session.mentorId },
    include: { user: { select: { username: true } } },
  });

  if (!mentor) return null;

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Profilul meu</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Informații profil</h2>
        <ProfileForm mentor={mentor} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Schimbă parola</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
