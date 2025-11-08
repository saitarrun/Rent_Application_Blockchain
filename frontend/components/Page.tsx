"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {children}
    </motion.main>
  );
}

