import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ⚽ Sport Mentor
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm btn-secondary">
              Autentificare
            </Link>
            <Link href="/signup" className="text-sm btn-primary">
              Înregistrare
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Cum funcționează Sport Mentor?
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base mb-12 max-w-2xl">
          Sport Mentor este o platformă dedicată antrenorilor și jucătorilor sportivi, care
          facilitează comunicarea, urmărirea progresului și dezvoltarea personală a fiecărui
          atlet.
        </p>

        {/* Steps */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Pașii pentru a începe
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Înregistrare antrenor",
                desc: "Completezi formularul de înregistrare cu numele tău, adresa de email și o scurtă descriere a activității tale sportive.",
              },
              {
                step: "2",
                title: "Aprobare cont",
                desc: "Administratorul platformei analizează cererea și aprobă contul tău. Vei primi datele de autentificare (utilizator și parolă).",
              },
              {
                step: "3",
                title: "Configurare profil și jucători",
                desc: "Te autentifici în platformă, îți completezi profilul și adaugi jucătorii din echipa ta.",
              },
              {
                step: "4",
                title: "Gestionare zilnică",
                desc: "Utilizezi toate funcționalitățile platformei: checkin zilnic, jurnal, mesaje, bibliotecă și altele.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow p-5"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Întrebări frecvente (FAQ)
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Cât costă platforma?",
                a: "În prezent platforma este gratuită. În viitor vor fi disponibile pachete cu funcționalități extinse la prețuri accesibile.",
              },
              {
                q: "Câți jucători pot adăuga?",
                a: "Nu există o limită impusă în prezent. Poți adăuga oricâți jucători dorești.",
              },
              {
                q: "Jucătorii pot vedea activitatea altor jucători?",
                a: "Nu. Fiecare jucător vede doar propriile date — journal, checkin, obiective și bibliotecă.",
              },
              {
                q: "Cum se autentifică jucătorii?",
                a: "Tu, ca antrenor, creezi conturile jucătorilor (utilizator și parolă). Ei se autentifică la /login și accesează secțiunea destinată jucătorilor.",
              },
              {
                q: "Ce tipuri de fișiere pot încărca în bibliotecă?",
                a: "Poți încărca PDF-uri, documente Word (DOC/DOCX), imagini (JPG, PNG, GIF). Dimensiunea maximă per fișier este de 20 MB.",
              },
              {
                q: "Cum îmi schimb parola?",
                a: "Accesează secțiunea Profil din meniu și folosești opțiunea de schimbare a parolei.",
              },
              {
                q: "Pot dezactiva temporar un jucător?",
                a: "Da. Din lista de jucători poți dezactiva oricând un jucător. Contul rămâne în baza de date, dar jucătorul nu mai poate accesa platforma.",
              },
              {
                q: "Datele sunt în siguranță?",
                a: "Da. Toată comunicarea este criptată, parolele sunt stocate în format hash securizat și sesiunile sunt gestionate cu cookie-uri HTTP-only.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Functionalities */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Funcționalități pentru antrenori
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "👥", title: "Gestionare jucători", desc: "Adaugă, editează și dezactivează jucători. Vizualizează activitatea lor recentă." },
              { icon: "📋", title: "Formular checkin", desc: "Creează un formular personalizat de checkin zilnic pe care jucătorii îl completează." },
              { icon: "💬", title: "Mesaj zilnic", desc: "Trimite zilnic un mesaj de motivație sau instrucțiuni tuturor jucătorilor." },
              { icon: "📚", title: "Bibliotecă", desc: "Încarcă materiale de studiu și antrenament pe care jucătorii le pot accesa." },
              { icon: "🏋️", title: "Căi de îmbunătățire", desc: "Definește dimensiuni de evaluare și urmărește progresul jucătorilor." },
              { icon: "📝", title: "Note despre jucători", desc: "Adaugă note private despre fiecare jucător, vizibile doar de tine." },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 flex gap-4">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Funcționalități pentru jucători
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "✅", title: "Checkin zilnic", desc: "Completează zilnic formularul de checkin stabilit de antrenor." },
              { icon: "📔", title: "Jurnal", desc: "Ține un jurnal zilnic: ce a mers bine, ce a mers rău, ce poți face mai bine." },
              { icon: "🎯", title: "Scop săptămânal", desc: "Stabilește un obiectiv pentru fiecare săptămână și marchează dacă l-ai realizat." },
              { icon: "💪", title: "Nivel de încredere", desc: "Raportează zilnic cât de încrezător te simți: Bine, OK sau Greu." },
              { icon: "📚", title: "Bibliotecă", desc: "Accesează materialele încărcate de antrenor." },
              { icon: "🏋️", title: "Autoevaluare", desc: "Evaluează-te pe fiecare cale de îmbunătățire definită de antrenor." },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 flex gap-4">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-3">Gata să începi?</h2>
          <p className="text-blue-100 text-sm mb-6">
            Înregistrează-te ca antrenor și începe să îți gestionezi jucătorii mai eficient.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 font-semibold rounded-lg px-8 py-3 text-sm hover:bg-blue-50 transition-colors"
          >
            Înregistrare gratuită
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Sport Mentor · Platformă de mentorat sportiv</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/" className="hover:text-blue-600 transition-colors">Acasă</Link>
          <Link href="/login" className="hover:text-blue-600 transition-colors">Autentificare</Link>
          <Link href="/signup" className="hover:text-blue-600 transition-colors">Înregistrare</Link>
        </div>
      </footer>
    </main>
  );
}
