"use client";

import { useState } from "react";
import { StakeForms } from "../../../components/forms/StakeForms";
import { AnimatedCard } from "../../../components/AnimatedCard";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useStakedAmount } from "../../../lib/hooks";
import { formatToken } from "../../../lib/format";

export default function DepositPage() {
  const [tokenId, setTokenId] = useState<string>("");
  const tokenAsBig = tokenId ? BigInt(tokenId) : undefined;
  const { data: staked } = useStakedAmount(tokenAsBig);

  return (
    <div className="grid gap-10">
      <section className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <AnimatedCard>
          <h2 className="text-xl font-semibold text-slate-100">Deposit Overview</h2>
          <p className="text-sm text-slate-400">Stake RENT against agreement token IDs, slash during disputes, and release deposits after completion.</p>
          <div className="mt-6 space-y-3">
            <Label htmlFor="deposit-token">Track token ID</Label>
            <Input id="deposit-token" value={tokenId} onChange={(event) => setTokenId(event.target.value)} placeholder="1" />
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              Current staked: {staked ? `${formatToken(staked)} RENT` : "-"}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <h2 className="text-xl font-semibold text-slate-100">Stake / Slash / Unstake</h2>
          <StakeForms />
        </AnimatedCard>
      </section>
    </div>
  );
}
