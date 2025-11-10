"use client";

import { ReactNode } from "react";

export function DevGuard({ children }: { children: ReactNode }) {
  const enabled = process.env.NEXT_PUBLIC_SHOW_DEV === "1" || process.env.NODE_ENV !== "production";
  if (!enabled) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 text-sm text-slate-300">
        This section is only available to administrators during testing.
      </div>
    );
  }
  return <>{children}</>;
}

