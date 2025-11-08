import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/format";

export function Stat({ label, value, icon, accent, className }: { label: string; value: ReactNode; icon?: ReactNode; accent?: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn("rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-soft", className)}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className={cn("mt-3 text-2xl font-semibold", accent)}>{value}</div>
    </motion.div>
  );
}
