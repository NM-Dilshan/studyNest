"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
          <section className="w-full rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-200">
              An unexpected error occurred. You can retry without losing your current session.
            </p>
            {error?.message ? (
              <p className="mt-3 rounded-lg bg-black/25 p-3 text-xs text-slate-300">
                {error.message}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/30"
              >
                Try again
              </button>
              <a
                href="/home"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Go to Home
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
