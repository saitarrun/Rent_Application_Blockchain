"use client";

import { LeaseWizard } from "../../components/wizard/LeaseWizard";
import { AnimatedCard } from "../../components/AnimatedCard";

export default function CreatePage() {
  return (
    <div className="grid gap-6">
      <AnimatedCard>
        <h1 className="text-xl font-semibold text-slate-100">Create Agreement</h1>
        <p className="text-sm text-slate-300">Follow the steps. We’ll convert dates and amounts behind the scenes.</p>
      </AnimatedCard>
      <LeaseWizard />
    </div>
  );
}

