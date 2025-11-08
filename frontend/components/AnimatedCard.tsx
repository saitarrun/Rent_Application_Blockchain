"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/format";

export function AnimatedCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 120, damping: 20 }}
      className={cn("rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-soft", className)}
    >
      {children}
    </motion.div>
  );
}
