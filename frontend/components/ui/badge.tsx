import { cn } from "../../lib/format";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200", className)}>
      {children}
    </span>
  );
}
