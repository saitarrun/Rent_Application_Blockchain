"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Banknote, FileSignature, Waves, Wallet } from "lucide-react";
import { Stat } from "../../components/Stat";
import { AnimatedCard } from "../../components/AnimatedCard";
import { Button } from "../../components/ui/button";
import { useAgreements, useRentBalance, useVendorPrices, useAmmState } from "../../lib/hooks";
import { formatEth, formatToken } from "../../lib/format";
import { Page } from "../../components/Page";
import { StaggerList } from "../../components/StaggerList";
import { NetworkGuard } from "../../components/NetworkGuard";

const quickLinks = [
  { href: "/agreements", label: "Agreements", description: "Mint and manage soulbound rental agreements", icon: <FileSignature className="h-5 w-5" /> },
  { href: "/deposit", label: "Deposits", description: "Stake, slash, and release security deposits", icon: <Banknote className="h-5 w-5" /> },
  { href: "/channel", label: "Rent Channel", description: "Stream rent via signed vouchers", icon: <Waves className="h-5 w-5" /> },
  { href: "/vendor", label: "Vendor", description: "Buy and sell RENT using ETH", icon: <Wallet className="h-5 w-5" /> }
];

export default function DashboardPage() {
  const { data: agreements } = useAgreements();
  const { data: rentBalance } = useRentBalance();
  const { data: prices } = useVendorPrices();
  const { data: amm } = useAmmState();

  return (
    <Page className="flex flex-col gap-10">
      <NetworkGuard />
      <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 p-10 shadow-soft">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-semibold text-slate-100 md:text-4xl"
            >
              Orchestrate trustless rentals with DeFi-native rails.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm text-slate-300"
            >
              Rental Suite combines soulbound agreements, escrow staking, and a unidirectional payment channel to keep rent flows transparent across chains.
            </motion.p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/agreements" className="flex items-center gap-2">
                Launch agreements
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Agreements" value={agreements?.length ?? 0} icon={<FileSignature className="h-5 w-5" />} />
        <Stat label="Your RENT" value={`${formatToken(rentBalance ?? 0n)} RENT`} icon={<Wallet className="h-5 w-5" />} />
        <Stat
          label="Vendor Buy"
          value={prices ? `${formatToken(prices.buyPrice, 18, 2)} RENT/ETH` : "-"}
          icon={<Banknote className="h-5 w-5" />}
        />
        <Stat
          label="Pool Liquidity"
          value={amm ? `${formatEth(amm.reserveETH)} ETH` : "-"}
          icon={<Waves className="h-5 w-5" />}
        />
      </section>

      <section>
        <StaggerList className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((card) => (
            <AnimatedCard key={card.href} className="flex h-full flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  {card.icon}
                  <span className="text-sm font-semibold">{card.label}</span>
                </div>
                <p className="text-sm text-slate-300">{card.description}</p>
              </div>
              <Button asChild variant="ghost" className="mt-6 w-full justify-between">
                <Link href={card.href}>
                  Manage {card.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </AnimatedCard>
          ))}
        </StaggerList>
      </section>
    </Page>
  );
}
