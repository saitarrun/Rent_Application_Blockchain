"use client";

import { VendorForm } from "../../../components/forms/VendorForm";
import { AnimatedCard } from "../../../components/AnimatedCard";

export default function VendorPage() {
  return (
    <AnimatedCard>
      <h2 className="text-xl font-semibold text-slate-100">Token Vendor</h2>
      <p className="text-sm text-slate-400">Swap ETH for RENT and vice versa at owner-defined linear pricing. Preview expected fills before confirming.</p>
      <div className="mt-6">
        <VendorForm />
      </div>
    </AnimatedCard>
  );
}
