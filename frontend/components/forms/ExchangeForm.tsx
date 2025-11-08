"use client";

import { useState } from "react";
import { useChainId, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TxButton } from "../TxButton";
import { contracts, MVE_ABI } from "../../lib/contracts";
import { useAmmState } from "../../lib/hooks";
import { formatEth, formatToken } from "../../lib/format";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/format";

export function ExchangeForm() {
  const { data: amm } = useAmmState();
  const chainIdHook = useChainId();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const chainId = chainIdHook || 1337;

  const [addRent, setAddRent] = useState("0");
  const [addEth, setAddEth] = useState("0");
  const [swapEth, setSwapEth] = useState("0");
  const [swapRent, setSwapRent] = useState("0");
  const [approve, setApprove] = useState(true);
  const [lpRemove, setLpRemove] = useState("0");

  const addLiquidity = async () => {
    if (approve) {
      await writeContractAsync({
        address: contracts.rent(chainId).address,
        abi: contracts.rent(chainId).abi,
        functionName: "approve",
        args: [contracts.amm(chainId).address, BigInt(addRent)]
      });
    }
    await writeContractAsync({
      address: contracts.amm(chainId).address,
      abi: MVE_ABI,
      functionName: "addLiquidity",
      args: [BigInt(addRent)],
      value: BigInt(addEth)
    });
    await queryClient.invalidateQueries({ queryKey: ["amm-state", chainId] });
  };

  const removeLiquidity = async () => {
    await writeContractAsync({
      address: contracts.amm(chainId).address,
      abi: MVE_ABI,
      functionName: "removeLiquidity",
      args: [BigInt(lpRemove)]
    });
    await queryClient.invalidateQueries({ queryKey: ["amm-state", chainId] });
  };

  const swapEthForRent = async () => {
    await writeContractAsync({
      address: contracts.amm(chainId).address,
      abi: MVE_ABI,
      functionName: "swapExactETHForRENT",
      args: [0n],
      value: BigInt(swapEth)
    });
    await queryClient.invalidateQueries({ queryKey: ["amm-state", chainId] });
  };

  const swapRentForEth = async () => {
    if (approve) {
      await writeContractAsync({
        address: contracts.rent(chainId).address,
        abi: contracts.rent(chainId).abi,
        functionName: "approve",
        args: [contracts.amm(chainId).address, BigInt(swapRent)]
      });
    }
    await writeContractAsync({
      address: contracts.amm(chainId).address,
      abi: MVE_ABI,
      functionName: "swapExactRENTForETH",
      args: [BigInt(swapRent), 0n]
    });
    await queryClient.invalidateQueries({ queryKey: ["amm-state", chainId] });
  };

  return (
    <div className="grid gap-10">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
        <div className="text-xs uppercase text-slate-500">Pool Reserves</div>
        <div className="mt-2 text-sm text-slate-200">ETH: {amm ? formatEth(amm.reserveETH) : "-"}</div>
        <div className="text-sm text-slate-200">RENT: {amm ? formatToken(amm.reserveRent, 18, 2) : "-"}</div>
      </div>

      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Add Liquidity</h3>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="add-eth">ETH (wei)</Label>
          <Input id="add-eth" type="number" value={addEth} onChange={(event) => setAddEth(event.target.value)} />
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="add-rent">RENT (wei)</Label>
          <Input id="add-rent" type="number" value={addRent} onChange={(event) => setAddRent(event.target.value)} />
        </div>
        <div className={cn("flex items-center gap-2 text-xs text-slate-400")}> 
          <Switch checked={approve} onCheckedChange={setApprove} /> Auto-approve RENT spending
        </div>
        <TxButton type="button" txAction={addLiquidity} pendingLabel="Providing">
          Provide Liquidity
        </TxButton>
      </form>

      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Remove Liquidity</h3>
        <div className="grid gap-2 sm:max-w-xs">
          <Label htmlFor="remove-lp">LP amount</Label>
          <Input id="remove-lp" type="number" value={lpRemove} onChange={(event) => setLpRemove(event.target.value)} />
        </div>
        <TxButton type="button" variant="secondary" txAction={removeLiquidity} pendingLabel="Removing">
          Remove Liquidity
        </TxButton>
      </form>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
          <h3 className="text-sm font-semibold text-slate-200">Swap ETH → RENT</h3>
          <Label htmlFor="swap-eth">ETH in (wei)</Label>
          <Input id="swap-eth" type="number" value={swapEth} onChange={(event) => setSwapEth(event.target.value)} />
          <TxButton type="button" variant="ghost" txAction={swapEthForRent} pendingLabel="Swapping">
            Swap to RENT
          </TxButton>
        </form>

        <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
          <h3 className="text-sm font-semibold text-slate-200">Swap RENT → ETH</h3>
          <Label htmlFor="swap-rent">RENT in (wei)</Label>
          <Input id="swap-rent" type="number" value={swapRent} onChange={(event) => setSwapRent(event.target.value)} />
          <TxButton type="button" variant="ghost" txAction={swapRentForEth} pendingLabel="Swapping">
            Swap to ETH
          </TxButton>
        </form>
      </div>
    </div>
  );
}
