"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brand } from "./Brand";
import { Connect } from "./Connect";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "../lib/format";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/create", label: "Create" },
  { href: "/agreements", label: "Agreements" },
  { href: "/settings", label: "Settings" }
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-background/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Brand />
        <nav className="hidden gap-2 rounded-full border border-slate-800/50 bg-slate-900/60 px-1 py-1 shadow-soft md:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-xs font-medium text-slate-300 transition-colors",
                  active ? "text-slate-900" : "hover:text-slate-100"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Connect simple />
          <ThemeToggle />
        </div>
      </div>
      <nav className="md:hidden">
        <div className="fixed bottom-4 left-1/2 z-50 flex w-[90%] -translate-x-1/2 items-center justify-between gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/80 px-4 py-3 shadow-soft">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] font-medium text-slate-400",
                  active && "text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
