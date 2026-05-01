import Link from "next/link";

export const metadata = {
  title: "Offline – Sport Mentor",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Ești offline
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nu există conexiune la internet. Datele introduse offline vor fi
          salvate local și sincronizate automat când te reconectezi.
        </p>
        <Link
          href="/"
          className="inline-block btn-primary"
        >
          Încearcă din nou
        </Link>
      </div>
    </div>
  );
}
