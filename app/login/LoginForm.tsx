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
      <main className="min-h-screen flex items-center justify-center px-4 mind-bg">
        <div className="w-full max-w-sm">
          {/* Logo / Brand — MindMentor */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mind-accent">
              🧠 MindMentor
            </h1>
            <p className="mt-2 text-sm mind-muted">
              Platforma digitală pentru psihologi și terapeuți
            </p>
          </div>

          <div className="shadow-lg rounded-2xl p-8 mind-card">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Autentificare
            </h2>

            <form action={formAction} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-1 mind-label"
                >
                  Utilizator
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="mind-input"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1 mind-label"
                >
                  Parolă
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mind-input"
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
                className="w-full font-semibold rounded-lg py-2 text-sm transition-colors disabled:opacity-60 mind-btn"
              >
                {isPending ? "Se procesează..." : "Intră în cont"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm mind-muted">
            <Link
              href="/how-it-works?theme=mind"
              className="mind-accent hover:underline"
            >
              Cum funcționează?
            </Link>
            {" · "}
            <Link
              href="/signup?theme=mind"
              className="mind-accent hover:underline"
            >
              Înregistrare psiholog
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // SportMentor (default)
  return (
    <main className="min-h-screen flex items-center justify-center px-4 sport-bg">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            ⚽ Sport Mentor
          </h1>
          <p className="mt-2 text-sm text-blue-600/80">
            Platformă de mentorat sportiv
          </p>
        </div>

        <div className="sport-card rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-center text-blue-900">
            Autentificare
          </h2>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-blue-800 mb-1"
              >
                Utilizator
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="sport-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-800 mb-1"
              >
                Parolă
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="sport-input"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-700 bg-red-100/80 px-3 py-2 rounded-lg">
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

        <p className="mt-6 text-center text-sm text-blue-700/80">
          <Link
            href="/how-it-works"
            className="text-blue-700 hover:underline"
          >
            Cum funcționează?
          </Link>
          {" · "}
          <Link
            href="/signup"
            className="text-blue-700 hover:underline"
          >
            Înregistrare antrenor
          </Link>
        </p>
      </div>
    </main>
  );
}
