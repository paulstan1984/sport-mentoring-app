"use client";

import { useActionState } from "react";
import { submitMentorSignup } from "@/actions/public";
import Link from "next/link";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(submitMentorSignup, null);

  if (state?.success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Cerere trimisă cu succes!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Cererea ta de înregistrare a fost primită. Administratorul o va analiza și
              vei putea accesa platforma după aprobare.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
            ⚽ Sport Mentor
          </Link>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Platformă de mentorat sportiv
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Înregistrare antrenor
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Completează formularul de mai jos. Cererea ta va fi analizată de administrator.
          </p>

          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="name" className="label">
                Nume complet *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="ex: Ion Popescu"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Adresă de email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="ex: ion.popescu@exemplu.ro"
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Scurtă descriere (opțional)
              </label>
              <textarea
                id="description"
                name="description"
                className="input resize-none"
                rows={3}
                placeholder="Câteva cuvinte despre tine, sportul și experiența ta ca antrenor..."
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full"
            >
              {isPending ? "Se trimite cererea..." : "Trimite cererea de înregistrare"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Ai deja cont?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Autentifică-te
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          <Link href="/how-it-works" className="text-blue-600 dark:text-blue-400 hover:underline">
            Cum funcționează platforma?
          </Link>
        </p>
      </div>
    </main>
  );
}
