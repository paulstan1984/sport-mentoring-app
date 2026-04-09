import { requireSuperAdmin, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm, PasswordForm } from "./ProfileForm";

export default async function AdminProfilePage() {
  await requireSuperAdmin();
  const session = await getSession();

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { username: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Profilul meu</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Informații profil</h2>
        <ProfileForm username={user.username} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Schimbă parola</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
