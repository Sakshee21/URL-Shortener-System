export function LoadingState({ message = "Loading...", dark = false }) {
  const shimmer = dark ? "bg-slate-800/70" : "bg-slate-200/80";

  return (
    <div className="space-y-4 animate-pulse">
      <div className={`h-4 w-40 rounded-full ${shimmer}`} />
      <div className={`h-3 w-64 rounded-full ${shimmer}`} />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`h-28 rounded-2xl border ${shimmer}`} />
        ))}
      </div>
      <div className={`h-56 rounded-2xl border ${shimmer}`} />
      <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>{message}</p>
    </div>
  );
}