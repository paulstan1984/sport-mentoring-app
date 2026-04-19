import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function RootPage() {
  const session = await getSession();

  if (session.userId) {
    if (session.role === "SUPER_ADMIN") redirect("/admin/mentors");
    if (session.role === "MENTOR") redirect("/mentor/dashboard");
    if (session.role === "PLAYER") redirect("/player/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero */}
      <header className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">⚽ Sport Mentor</span>
        <div className="flex items-center gap-3">
          <Link
            href="/how-it-works"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Cum funcționează
          </Link>
          <Link
            href="/login"
            className="text-sm btn-secondary"
          >
            Autentificare
          </Link>
          <Link
            href="/signup"
            className="text-sm btn-primary"
          >
            Înregistrare antrenor
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          Platforma de mentorat sportiv<br className="hidden md:block" /> pentru antrenori și jucători
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Gestionează jucătorii tăi, urmărește progresul zilnic, oferă feedback personalizat
          și construiește o echipă câștigătoare — totul dintr-un singur loc.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-base px-8 py-3">
            Înregistrează-te ca antrenor
          </Link>
          <Link href="/how-it-works" className="btn-secondary text-base px-8 py-3">
            Cum funcționează?
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          Tot ce ai nevoie pentru a fi un antrenor mai bun
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📋",
              title: "Checkin zilnic",
              description:
                "Creează formulare personalizate de checkin pentru jucători. Urmărește prezența, obiectivele zilnice și progresul fiecărui sportiv.",
            },
            {
              icon: "📔",
              title: "Jurnal și obiective săptămânale",
              description:
                "Jucătorii pot ține un jurnal zilnic și seta obiective săptămânale. Tu poți urmări evoluția lor și oferi îndrumare.",
            },
            {
              icon: "📚",
              title: "Bibliotecă de resurse",
              description:
                "Încarcă și distribuie materiale (PDF, imagini, documente) direct jucătorilor tăi într-o bibliotecă organizată.",
            },
            {
              icon: "💬",
              title: "Mesaje zilnice",
              description:
                "Trimite un mesaj zilnic de motivație sau instrucțiuni tuturor jucătorilor tăi cu un singur click.",
            },
            {
              icon: "📊",
              title: "Nivelul de încredere",
              description:
                "Jucătorii raportează zilnic nivelul de încredere. Identifică tendințele și intervine la momentul potrivit.",
            },
            {
              icon: "🏋️",
              title: "Căi de îmbunătățire",
              description:
                "Definește axe de dezvoltare personalizate și cere jucătorilor să se autoevalueze pentru fiecare aspect.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 flex flex-col gap-3"
            >
              <span className="text-4xl">{f.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works teaser */}
      <section className="bg-blue-600 dark:bg-blue-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Începe în 3 pași simpli</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 text-sm">
            {[
              { step: "1", title: "Înregistrare", desc: "Completează formularul de înregistrare ca antrenor." },
              { step: "2", title: "Aprobare", desc: "Contul tău este aprobat de administrator în scurt timp." },
              { step: "3", title: "Acces complet", desc: "Intri în platformă și începi să îți gestionezi jucătorii." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white text-blue-600 font-bold text-lg flex items-center justify-center">
                  {s.step}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-blue-100">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block bg-white text-blue-600 font-semibold rounded-lg px-8 py-3 text-sm hover:bg-blue-50 transition-colors"
            >
              Înregistrează-te acum — gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Sport Mentor · Platformă de mentorat sportiv</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">Cum funcționează</Link>
          <Link href="/login" className="hover:text-blue-600 transition-colors">Autentificare</Link>
          <Link href="/signup" className="hover:text-blue-600 transition-colors">Înregistrare</Link>
        </div>
      </footer>
    </main>
  );
}
