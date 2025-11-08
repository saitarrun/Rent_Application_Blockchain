import { cn } from "../../lib/format";

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-slate-800/70", className)} />;
}
