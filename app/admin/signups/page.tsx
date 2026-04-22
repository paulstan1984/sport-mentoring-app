import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SignupRequestStatus, RequestType } from "@/app/generated/prisma/client";
import { ApproveForm } from "./ApproveForm";
import { RejectButton } from "./RejectButton";
import { ApproveLevelUpgradeButton } from "./ApproveLevelUpgradeButton";

const LEVEL_LABELS: Record<string, string> = {
  FREE: "Gratuit",
  MINIMUM: "Minimum",
  MEDIUM: "Medium",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export default async function SignupsPage() {
  await requireSuperAdmin();

  const requests = await db.adminRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { mentor: { select: { name: true } } },
  });

  const pendingSignups = requests.filter(
    (r) => r.status === SignupRequestStatus.PENDING && r.requestType === RequestType.SIGNUP
  );
  const pendingUpgrades = requests.filter(
    (r) => r.status === SignupRequestStatus.PENDING && r.requestType === RequestType.LEVEL_UPGRADE
  );
  const processed = requests.filter((r) => r.status !== SignupRequestStatus.PENDING);

  function statusLabel(status: SignupRequestStatus) {
    if (status === SignupRequestStatus.APPROVED)
      return <span className="text-xs font-medium text-green-600 dark:text-green-400">Aprobat</span>;
    if (status === SignupRequestStatus.REJECTED)
      return <span className="text-xs font-medium text-red-600 dark:text-red-400">Respins</span>;
    return <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">În așteptare</span>;
  }

  function buildDefaultUsername(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9.]/g, "");
  }

  const totalPending = pendingSignups.length + pendingUpgrades.length;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Cereri administrative
          {totalPending > 0 && (
            <span className="ml-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500 text-white text-xs font-bold">
              {totalPending}
            </span>
          )}
        </h1>
      </div>

      {/* Pending signup requests */}
      <h2 className="text-lg font-semibold mb-3">
        Cereri de înregistrare antrenori
        {pendingSignups.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold">
            {pendingSignups.length}
          </span>
        )}
      </h2>

      {pendingSignups.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 text-center text-gray-400 mb-8">
          Nu există cereri de înregistrare în așteptare.
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {pendingSignups.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{r.name}</span>
                    {statusLabel(r.status)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📧 {r.email}</p>
                  {r.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📞 {r.phone}</p>
                  )}
                  {r.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line mt-2">
                      {r.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:min-w-64">
                  <ApproveForm
                    requestId={r.id}
                    defaultUsername={buildDefaultUsername(r.name ?? "")}
                  />
                  <RejectButton requestId={r.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending level upgrade requests */}
      <h2 className="text-lg font-semibold mb-3">
        Cereri de upgrade nivel
        {pendingUpgrades.length > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
            {pendingUpgrades.length}
          </span>
        )}
      </h2>

      {pendingUpgrades.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 text-center text-gray-400 mb-8">
          Nu există cereri de upgrade în așteptare.
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {pendingUpgrades.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {r.mentor?.name ?? r.name}
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                      Upgrade nivel
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nivel solicitat:{" "}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {LEVEL_LABELS[r.requestedLevel ?? ""] ?? r.requestedLevel}
                    </strong>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ApproveLevelUpgradeButton requestId={r.id} />
                  <RejectButton requestId={r.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-3">Procesate</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <tr>
                    <th className="text-left px-4 py-3">Nume</th>
                    <th className="text-left px-4 py-3">Tip</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Procesat la</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {processed.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium">
                        {r.mentor?.name ?? r.name}
                        {r.email && (
                          <span className="block text-xs text-gray-400">{r.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {r.requestType === RequestType.SIGNUP
                          ? "Înregistrare"
                          : `Upgrade → ${LEVEL_LABELS[r.requestedLevel ?? ""] ?? r.requestedLevel}`}
                      </td>
                      <td className="px-4 py-3">{statusLabel(r.status)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {r.processedAt
                          ? new Date(r.processedAt).toLocaleDateString("ro-RO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
