export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-slate-700/60" />
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-700/50" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-700/50" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-700/50" />
        </div>
      </div>
    </main>
  );
}
