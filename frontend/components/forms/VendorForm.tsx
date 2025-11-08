"use client";

import { useMemo, useState } from "react";
import { useChainId, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TxButton } from "../TxButton";
import { contracts, VENDOR_ABI } from "../../lib/contracts";
import { useVendorPrices } from "../../lib/hooks";
import { formatToken } from "../../lib/format";

export function VendorForm() {
  const { data: prices } = useVendorPrices();
  const chainIdHook = useChainId();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const chainId = chainIdHook || 1337;
  const [ethBuy, setEthBuy] = useState("0");
  const [rentSell, setRentSell] = useState("0");

  const rentOut = useMemo(() => {
    if (!prices) return 0n;
    try {
      return (BigInt(ethBuy || "0") * prices.buyPrice) / 10n ** 18n;
    } catch {
      return 0n;
    }
  }, [ethBuy, prices]);

  const ethOut = useMemo(() => {
    if (!prices) return 0n;
    try {
      return (BigInt(rentSell || "0") * prices.sellPrice) / 10n ** 18n;
    } catch {
      return 0n;
    }
  }, [rentSell, prices]);

  const buy = async () => {
    if (!prices) return;
    await writeContractAsync({
      address: contracts.vendor(chainId).address,
      abi: VENDOR_ABI,
      functionName: "buy",
      value: BigInt(ethBuy)
    });
    await queryClient.invalidateQueries({ queryKey: ["rent-balance"] });
  };

  const sell = async () => {
    await writeContractAsync({
      address: contracts.vendor(chainId).address,
      abi: VENDOR_ABI,
      functionName: "sell",
      args: [BigInt(rentSell)]
    });
    await queryClient.invalidateQueries({ queryKey: ["rent-balance"] });
  };

  return (
    <div className="grid gap-8">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
        <div className="text-xs uppercase text-slate-500">Vendor Rates</div>
        <div className="mt-2 text-sm text-slate-200">Buy: {prices ? formatToken(prices.buyPrice, 18, 2) : "-"} RENT/ETH</div>
        <div className="text-sm text-slate-200">Sell: {prices ? formatToken(prices.sellPrice, 18, 4) : "-"} ETH/RENT</div>
      </div>

      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Buy RENT</h3>
        <div className="grid gap-2">
          <Label htmlFor="buy-eth">ETH amount (wei)</Label>
          <Input id="buy-eth" type="number" value={ethBuy} onChange={(event) => setEthBuy(event.target.value)} />
        </div>
        <div className="text-xs text-slate-400">You will receive approximately {formatToken(rentOut, 18, 3)} RENT</div>
        <TxButton type="button" txAction={buy} pendingLabel="Buying">
          Buy RENT
        </TxButton>
      </form>

      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Sell RENT</h3>
        <div className="grid gap-2">
          <Label htmlFor="sell-rent">RENT amount (wei)</Label>
          <Input id="sell-rent" type="number" value={rentSell} onChange={(event) => setRentSell(event.target.value)} />
        </div>
        <div className="text-xs text-slate-400">Receive approximately {formatToken(ethOut, 18, 5)} ETH</div>
        <TxButton type="button" variant="secondary" txAction={sell} pendingLabel="Selling">
          Sell RENT
        </TxButton>
      </form>
    </div>
  );
}
