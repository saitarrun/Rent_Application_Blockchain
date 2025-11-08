"use client";

import { ChannelForms } from "../../../components/forms/ChannelForms";
import { AnimatedCard } from "../../../components/AnimatedCard";

export default function ChannelPage() {
  return (
    <div className="grid gap-10">
      <AnimatedCard>
        <h2 className="text-xl font-semibold text-slate-100">Tenant → Landlord Rent Channel</h2>
        <p className="text-sm text-slate-300">Open, fund, and reconcile unidirectional rent streams. Sign EIP-712 vouchers and share via QR to execute payouts securely.</p>
        <div className="mt-6">
          <ChannelForms />
        </div>
      </AnimatedCard>
    </div>
  );
}
