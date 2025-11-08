"use client";

import { ExchangeForm } from "../../../components/forms/ExchangeForm";
import { AnimatedCard } from "../../../components/AnimatedCard";

export default function ExchangePage() {
  return (
    <AnimatedCard>
      <h2 className="text-xl font-semibold text-slate-100">AMM Exchange</h2>
      <p className="text-sm text-slate-400">Provide or remove ETH/RENT liquidity and swap across the constant-product pool with fees auto-collected.</p>
      <div className="mt-6">
        <ExchangeForm />
      </div>
    </AnimatedCard>
  );
}
