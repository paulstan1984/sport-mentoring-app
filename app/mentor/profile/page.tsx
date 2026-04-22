import { requireMentor, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SignupRequestStatus, RequestType } from "@/app/generated/prisma/client";
import { ProfileForm, PasswordForm } from "./ProfileForm";
import { MentorLabelsForm } from "./MentorLabelsForm";
import { LevelUpgradeForm } from "./LevelUpgradeForm";

export default async function MentorProfilePage() {
  await requireMentor();
  const session = await getSession();

  const mentor = await db.mentor.findUnique({
    where: { id: session.mentorId },
    include: {
      user: { select: { username: true } },
      labels: { select: { key: true, value: true } },
    },
  });

  if (!mentor) return null;

  const pendingLevelRequest = await db.adminRequest.findFirst({
    where: {
      mentorId: mentor.id,
      requestType: RequestType.LEVEL_UPGRADE,
      status: SignupRequestStatus.PENDING,
    },
  });

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Profilul meu</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Informații profil</h2>
        <ProfileForm mentor={mentor} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Etichete personalizate</h2>
        <MentorLabelsForm labels={mentor.labels} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-1">Nivelul contului</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Solicită un upgrade pentru a gestiona mai mulți clienți.
        </p>
        <LevelUpgradeForm
          currentLevel={mentor.level}
          hasPendingRequest={!!pendingLevelRequest}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Schimbă parola</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
