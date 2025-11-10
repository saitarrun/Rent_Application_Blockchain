"use client";

import Link from "next/link";
import { AnimatedCard } from "../../components/AnimatedCard";
import { Button } from "../../components/ui/button";
import { useAgreements } from "../../lib/hooks";
import dayjs from "dayjs";

export default function DashboardPage() {
  const { data: agreements } = useAgreements();
  const active = (agreements || []).filter(a => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now >= a.start && now <= a.end;
  });
  const next = active[0];
  const nextDue = next ? dayjs(Number(next.start) * 1000).add(1, 'month').format('MMM D') : '-';

  return (
    <div className="flex flex-col gap-6">
      <AnimatedCard>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Welcome to Rental Suite</h1>
            <p className="text-sm text-slate-300">Create leases with plain language. We’ll take care of the technical bits.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild><Link href="/create">Create Lease</Link></Button>
            <Button asChild variant="secondary"><Link href="/agreements">View Agreements</Link></Button>
          </div>
        </div>
      </AnimatedCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatedCard>
          <div className="text-xs uppercase tracking-wide text-slate-500">Leases</div>
          <div className="mt-2 text-2xl font-semibold">{active.length} active</div>
          <Button asChild variant="ghost" className="mt-3"><Link href="/agreements">View all →</Link></Button>
        </AnimatedCard>
        <AnimatedCard>
          <div className="text-xs uppercase tracking-wide text-slate-500">Next payment due</div>
          <div className="mt-2 text-2xl font-semibold">{next ? `on ${nextDue}` : '-'}</div>
          <Button asChild variant="ghost" className="mt-3"><Link href="/agreements">Pay now →</Link></Button>
        </AnimatedCard>
        <AnimatedCard>
          <div className="text-xs uppercase tracking-wide text-slate-500">Recent activity</div>
          <div className="mt-2 text-sm text-slate-300">New leases and payments will appear here.</div>
        </AnimatedCard>
      </div>
    </div>
  );
}
