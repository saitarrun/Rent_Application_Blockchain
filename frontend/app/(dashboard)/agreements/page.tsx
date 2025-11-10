"use client";

import Link from "next/link";
import { AnimatedCard } from "../../../components/AnimatedCard";
import { useAgreements } from "../../../lib/hooks";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useChainId, useWriteContract } from "wagmi";
import { contracts, RENTAL_AGREEMENT_ABI } from "../../../lib/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { shortenAddress } from "../../../lib/format";
import { Skeleton } from "../../../components/ui/skeleton";
import { useEffect, useState } from "react";
import { PayNow } from "../../../components/PayNow";
import { useAccount } from "wagmi";
import dayjs from "dayjs";

export default function AgreementsPage() {
  const { data: agreements, isLoading } = useAgreements();
  const chainIdHook = useChainId();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const chainId = chainIdHook || 1337;
  // Compute current time on client after hydration to avoid SSR/CSR mismatch
  const [now, setNow] = useState<bigint | null>(null);
  useEffect(() => {
    setNow(BigInt(Math.floor(Date.now() / 1000)));
  }, []);

  const burn = async (tokenId: bigint) => {
    await writeContractAsync({
      address: contracts.agreements(chainId).address,
      abi: RENTAL_AGREEMENT_ABI,
      functionName: "burnAfterEnd",
      args: [tokenId]
    });
    await queryClient.invalidateQueries({ queryKey: ["agreements", chainId] });
  };

  return (
    <div className="grid gap-10">
      <section className="grid gap-6">
        <AnimatedCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Agreements</h2>
              <p className="text-sm text-slate-400">Create leases with plain dates and amounts. We’ll handle the technical details.</p>
            </div>
            <Button asChild><Link href="/create">Create Lease</Link></Button>
          </div>
        </AnimatedCard>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Your Agreements</h2>
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-36 rounded-2xl" />
            ))}
          </div>
        )}
        {!isLoading && agreements && agreements.length === 0 && (
          <p className="text-sm text-slate-400">No agreements minted yet.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agreements?.map((agreement, idx) => {
            const active = now !== null && now >= agreement.start && now <= agreement.end;
            const isTenant = address && address.toLowerCase() === agreement.tenant.toLowerCase();
            const confirmKey = `confirm-${chainId}-${agreement.tokenId.toString()}-${agreement.tenant}`;
            const [confirmed, setConfirmed] = [typeof window !== 'undefined' ? localStorage.getItem(confirmKey) === '1' : true, (v: boolean) => localStorage.setItem(confirmKey, v ? '1' : '0')];
            return (
              <AnimatedCard key={`${agreement.tokenId.toString()}-${idx}`} delay={idx * 0.05}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">Agreement #{agreement.tokenId.toString()}</h3>
                  <Badge className={active ? "bg-success/30 text-success" : "bg-slate-800/70 text-slate-300"}>
                    {active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <div>Landlord: {shortenAddress(agreement.landlord)}</div>
                  <div>Tenant: {shortenAddress(agreement.tenant)}</div>
                  <div>Start: {dayjs(Number(agreement.start) * 1000).format('YYYY-MM-DD')}</div>
                  <div>End: {dayjs(Number(agreement.end) * 1000).format('YYYY-MM-DD')}</div>
                </div>
                <div className="mt-4 grid gap-2">
                  {active && isTenant && (
                    <PayNow tokenId={agreement.tokenId} amountWei={agreement.rentPerPeriod} />
                  )}
                  {isTenant && !confirmed && (
                    <Button variant="secondary" className="w-full" onClick={() => setConfirmed(true)}>Confirm Agreement</Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="mt-4 w-full"
                  onClick={() => burn(agreement.tokenId)}
                >
                  Close lease (post expiry)
                </Button>
              </AnimatedCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
