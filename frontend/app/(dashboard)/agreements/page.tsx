"use client";

import { AgreementForm } from "../../../components/forms/AgreementForm";
import { AnimatedCard } from "../../../components/AnimatedCard";
import { useAgreements } from "../../../lib/hooks";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useChainId, useWriteContract } from "wagmi";
import { contracts, RENTAL_AGREEMENT_ABI } from "../../../lib/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { formatToken, shortenAddress } from "../../../lib/format";
import { Skeleton } from "../../../components/ui/skeleton";
import { useEffect, useState } from "react";

export default function AgreementsPage() {
  const { data: agreements, isLoading } = useAgreements();
  const chainIdHook = useChainId();
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
      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <AnimatedCard>
          <h2 className="text-xl font-semibold text-slate-100">Mint Agreement</h2>
          <p className="text-sm text-slate-400">Register tenant/landlord terms and issue a soulbound agreement NFT.</p>
          <div className="mt-6">
            <AgreementForm />
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <h2 className="text-xl font-semibold text-slate-100">Guidelines</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Agreements are non-transferable and can be burned by the landlord after expiry.</li>
            <li>• Use unix timestamps for start and end windows.</li>
            <li>• Rent per period is referenced when generating vouchers.</li>
          </ul>
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
                  <div>Start: {agreement.start.toString()}</div>
                  <div>End: {agreement.end.toString()}</div>
                  <div>Rent/period: {formatToken(agreement.rentPerPeriod)} RENT</div>
                </div>
                <Button
                  variant="ghost"
                  className="mt-4 w-full"
                  onClick={() => burn(agreement.tokenId)}
                >
                  Burn (post expiry)
                </Button>
              </AnimatedCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
