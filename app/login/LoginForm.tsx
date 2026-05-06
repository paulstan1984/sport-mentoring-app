"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";

interface LoginFormProps {
  isMindMentor: boolean;
}

export function LoginForm({ isMindMentor }: LoginFormProps) {
  const wrappedAction = async (
    prev: Awaited<ReturnType<typeof login>> | null,
    formData: FormData
  ) => {
    try { return await login(prev, formData); }
    catch { return { error: "Eroare de rețea. Verifică conexiunea și încearcă din nou." }; }
  };
  const [state, formAction, isPending] = useActionState(wrappedAction, null);

  if (isMindMentor) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0f172a" }}>
        <div className="w-full max-w-sm">
          {/* Logo / Brand — MindMentor */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#a78bfa" }}>
              🧠 MindMentor
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
              Platforma digitală pentru psihologi și terapeuți
            </p>
          </div>

          <div className="shadow-lg rounded-2xl p-8" style={{ background: "#1e293b" }}>
            <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: "#f1f5f9" }}>
              Autentificare
            </h2>

            <form action={formAction} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#cbd5e1" }}
                >
                  Utilizator
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "#0f172a",
                    border: "1px solid rgba(167,139,250,0.3)",
                    color: "#f1f5f9",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#cbd5e1" }}
                >
                  Parolă
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: "#0f172a",
                    border: "1px solid rgba(167,139,250,0.3)",
                    color: "#f1f5f9",
                  }}
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-400 bg-red-950/60 px-3 py-2 rounded-lg">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full font-semibold rounded-lg py-2 text-sm transition-colors disabled:opacity-60"
                style={{ background: "#7c3aed", color: "#fff" }}
              >
                {isPending ? "Se procesează..." : "Intră în cont"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "#94a3b8" }}>
            <Link
              href="/how-it-works?theme=mind"
              className="hover:underline"
              style={{ color: "#a78bfa" }}
            >
              Cum funcționează?
            </Link>
            {" · "}
            <Link
              href="/signup?theme=mind"
              className="hover:underline"
              style={{ color: "#a78bfa" }}
            >
              Înregistrare antrenor
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // SportMentor (default)
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            ⚽ Sport Mentor
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Platformă de mentorat sportiv
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Autentificare
          </h2>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Utilizator
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Parolă
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
            >
              {isPending ? "Se procesează..." : "Intră în cont"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/how-it-works"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Cum funcționează?
          </Link>
          {" · "}
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Înregistrare antrenor
          </Link>
        </p>
      </div>
    </main>
  );
}
