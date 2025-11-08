"use client";

import { AdminForms } from "../../../components/forms/AdminForms";
import { AnimatedCard } from "../../../components/AnimatedCard";

export default function AdminPage() {
  return (
    <AnimatedCard>
      <h2 className="text-xl font-semibold text-slate-100">Protocol Admin</h2>
      <p className="text-sm text-slate-400">Tune vendor pricing, seed on-chain liquidity, and mint RENT for bootstrap flows. Only contract owners can execute these actions on-chain.</p>
      <div className="mt-6">
        <AdminForms />
      </div>
    </AnimatedCard>
  );
}
