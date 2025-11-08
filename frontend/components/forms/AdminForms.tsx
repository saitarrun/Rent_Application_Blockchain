"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TxButton } from "../TxButton";
import { useChainId, useWriteContract } from "wagmi";
import { contracts, RENT_ABI, VENDOR_ABI, MVE_ABI } from "../../lib/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getAddressBook } from "../../lib/addresses";
import { Copy } from "../Copy";

export function AdminForms() {
  const chainIdHook = useChainId();
  const chainId = chainIdHook || 1337;
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const addresses = useMemo(() => getAddressBook(chainId), [chainId]);

  const updatePrices = async () => {
    const form = document.getElementById("price-form") as HTMLFormElement | null;
    const fd = new FormData(form ?? undefined);
    await writeContractAsync({
      address: contracts.vendor(chainId).address,
      abi: VENDOR_ABI,
      functionName: "setPrices",
      args: [BigInt(fd.get("buyPrice") as string), BigInt(fd.get("sellPrice") as string)]
    });
    await queryClient.invalidateQueries({ queryKey: ["vendor-prices", chainId] });
  };

  const mintRent = async () => {
    const form = document.getElementById("mint-form") as HTMLFormElement | null;
    const fd = new FormData(form ?? undefined);
    await writeContractAsync({
      address: contracts.rent(chainId).address,
      abi: RENT_ABI,
      functionName: "mint",
      args: [fd.get("recipient") as `0x${string}`, BigInt(fd.get("amount") as string)]
    });
    await queryClient.invalidateQueries({ queryKey: ["rent-balance"] });
  };

  const seedLiquidity = async () => {
    const form = document.getElementById("seed-form") as HTMLFormElement | null;
    const fd = new FormData(form ?? undefined);
    await writeContractAsync({
      address: contracts.rent(chainId).address,
      abi: RENT_ABI,
      functionName: "approve",
      args: [contracts.amm(chainId).address, BigInt(fd.get("rent") as string)]
    });
    await writeContractAsync({
      address: contracts.amm(chainId).address,
      abi: MVE_ABI,
      functionName: "addLiquidity",
      args: [BigInt(fd.get("rent") as string)],
      value: BigInt(fd.get("eth") as string)
    });
    await queryClient.invalidateQueries({ queryKey: ["amm-state", chainId] });
  };

  return (
    <div className="grid gap-10">
      <section className="grid gap-3">
        <h3 className="text-sm font-semibold text-slate-200">Contract Addresses</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(addresses).map(([label, addr]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
              <span>{label}</span>
              <Copy value={addr} variant="ghost" size="icon" />
            </div>
          ))}
        </div>
      </section>

      <form id="price-form" className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Update Vendor Prices</h3>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="buyPrice">Buy price (RENT per 1 ETH, wei)</Label>
          <Input id="buyPrice" name="buyPrice" type="number" placeholder="100000000000000000000" />
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="sellPrice">Sell price (ETH per RENT, wei)</Label>
          <Input id="sellPrice" name="sellPrice" type="number" placeholder="100000000000000" />
        </div>
        <TxButton type="button" txAction={updatePrices} pendingLabel="Updating">
          Set Prices
        </TxButton>
      </form>

      <form id="mint-form" className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Mint RENT</h3>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="recipient">Recipient</Label>
          <Input id="recipient" name="recipient" placeholder="0x..." />
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="amount">Amount (wei)</Label>
          <Input id="amount" name="amount" type="number" />
        </div>
        <TxButton type="button" variant="secondary" txAction={mintRent} pendingLabel="Minting">
          Mint
        </TxButton>
      </form>

      <form id="seed-form" className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Seed Liquidity</h3>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="seed-eth">ETH (wei)</Label>
          <Input id="seed-eth" name="eth" type="number" />
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="seed-rent">RENT (wei)</Label>
          <Input id="seed-rent" name="rent" type="number" />
        </div>
        <TxButton type="button" variant="ghost" txAction={seedLiquidity} pendingLabel="Seeding">
          Add Liquidity
        </TxButton>
      </form>
    </div>
  );
}
