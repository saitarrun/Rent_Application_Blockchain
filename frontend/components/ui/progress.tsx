import { cn } from "../../lib/format";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-800/60 bg-slate-900/60 p-3">
      <div className="mb-2 text-xs text-slate-400">{label ?? `${value}%`}</div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800/70">
        <div
          className={cn("h-full rounded-full bg-primary transition-all")}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
