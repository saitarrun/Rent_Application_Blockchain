"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/format";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-2xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:pointer-events-none";
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-lg"
};
const variants: Record<Variant, string> = {
  primary: "bg-cyan-400 text-black hover:brightness-110 active:brightness-90",
  secondary: "bg-slate-800 text-white hover:bg-slate-700",
  ghost: "bg-transparent text-white hover:bg-white/10"
};

export function AnimatedButton({
  size = "md",
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: Size; variant?: Variant; children: ReactNode }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

