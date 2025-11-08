"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  const nodes = Array.isArray(children) ? children : [children];
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={className}>
      {nodes.map((c, i) => (
        <motion.div key={i} variants={item}>
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

