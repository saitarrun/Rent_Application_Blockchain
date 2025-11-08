"use client";

import Link from "next/link";
import { AnimatedCard } from "../../../components/AnimatedCard";
import { Button } from "../../../components/ui/button";
import { ExternalLink } from "lucide-react";

const faucets = [
  { name: "Alchemy Sepolia Faucet", href: "https://www.alchemy.com/faucets/ethereum-sepolia" },
  { name: "Infura Sepolia Faucet", href: "https://www.infura.io/faucet/sepolia" },
  { name: "QuickNode Faucet", href: "https://faucet.quicknode.com/ethereum/sepolia" }
];

export default function FaucetPage() {
  return (
    <div className="grid gap-6">
      <AnimatedCard>
        <h2 className="text-xl font-semibold text-slate-100">Get Sepolia ETH</h2>
        <p className="text-sm text-slate-400">Use a public faucet to fund your demo account with test ETH. After funding, switch MetaMask to Sepolia and refresh balances.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {faucets.map((f) => (
            <Button asChild key={f.href} className="justify-between" variant="secondary">
              <Link href={f.href} target="_blank" rel="noreferrer noopener">
                {f.name}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );
}

