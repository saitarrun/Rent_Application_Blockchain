"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { contracts } from "../../lib/contracts";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TxButton } from "../TxButton";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/format";

const stakeSchema = z.object({
  tokenId: z.string().min(1),
  amount: z.string().min(1),
  approve: z.boolean().default(true)
});

const slashSchema = z.object({
  tokenId: z.string().min(1),
  amount: z.string().min(1),
  reason: z.string().default("")
});

const unstakeSchema = z.object({
  tokenId: z.string().min(1),
  amount: z.string().min(1)
});

export function StakeForms() {
  const stakeForm = useForm({ resolver: zodResolver(stakeSchema), defaultValues: { approve: true } });
  const slashForm = useForm({ resolver: zodResolver(slashSchema) });
  const unstakeForm = useForm({ resolver: zodResolver(unstakeSchema) });
  const chainIdHook = useChainId();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const chainId = chainIdHook || 1337;

  const stakeAction = async () => {
    const values = stakeForm.getValues() as z.infer<typeof stakeSchema>;
    const tokenId = BigInt(values.tokenId);
    const amount = BigInt(values.amount);
    if (values.approve) {
      await writeContractAsync({
        address: contracts.rent(chainId).address,
        abi: contracts.rent(chainId).abi,
        functionName: "approve",
        args: [contracts.staking(chainId).address, amount]
      });
    }
    await writeContractAsync({
      address: contracts.staking(chainId).address,
      abi: contracts.staking(chainId).abi,
      functionName: "deposit",
      args: [tokenId, amount]
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["staked", chainId, tokenId.toString()] }),
      queryClient.invalidateQueries({ queryKey: ["rent-balance", chainId, address] })
    ]);
    stakeForm.reset({ approve: values.approve });
  };

  const slashAction = async () => {
    const values = slashForm.getValues() as z.infer<typeof slashSchema>;
    const tokenId = BigInt(values.tokenId);
    await writeContractAsync({
      address: contracts.staking(chainId).address,
      abi: contracts.staking(chainId).abi,
      functionName: "landlordClaim",
      args: [tokenId, BigInt(values.amount), (values.reason || "") as string]
    });
    await queryClient.invalidateQueries({ queryKey: ["staked", chainId, tokenId.toString()] });
    slashForm.reset();
  };

  const unstakeAction = async () => {
    const values = unstakeForm.getValues() as z.infer<typeof unstakeSchema>;
    const tokenId = BigInt(values.tokenId);
    await writeContractAsync({
      address: contracts.staking(chainId).address,
      abi: contracts.staking(chainId).abi,
      functionName: "tenantWithdrawAfterEnd",
      args: [tokenId, BigInt(values.amount)]
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["staked", chainId, tokenId.toString()] }),
      queryClient.invalidateQueries({ queryKey: ["rent-balance", chainId, address] })
    ]);
    unstakeForm.reset();
  };

  return (
    <div className="grid gap-8">
      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Stake Deposit</h3>
        <div className="grid gap-2">
          <Label htmlFor="stake-token">Agreement token ID</Label>
          <Input id="stake-token" type="number" {...stakeForm.register("tokenId")}></Input>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stake-amount">Amount (RENT wei)</Label>
          <Input id="stake-amount" type="number" {...stakeForm.register("amount")} />
        </div>
        <div className={cn("flex items-center gap-2 text-xs text-slate-400")}> 
          <Switch checked={stakeForm.watch("approve")} onCheckedChange={(value) => stakeForm.setValue("approve", value)} />
          Auto-approve RENT spending
        </div>
        <TxButton type="button" txAction={stakeAction} pendingLabel="Staking">
          Stake RENT
        </TxButton>
      </form>

      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Landlord Claim</h3>
        <div className="grid gap-2">
          <Label htmlFor="slash-token">Agreement token ID</Label>
          <Input id="slash-token" type="number" {...slashForm.register("tokenId")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slash-amount">Amount (RENT wei)</Label>
          <Input id="slash-amount" type="number" {...slashForm.register("amount")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slash-reason">Reason (optional)</Label>
          <Input id="slash-reason" type="text" placeholder="e.g., damage repair" {...slashForm.register("reason")} />
        </div>
        <TxButton type="button" txAction={slashAction} pendingLabel="Submitting">
          Claim Deposit
        </TxButton>
      </form>

      <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Tenant Withdraw After End</h3>
        <div className="grid gap-2">
          <Label htmlFor="unstake-token">Agreement token ID</Label>
          <Input id="unstake-token" type="number" {...unstakeForm.register("tokenId")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unstake-amount">Amount (RENT wei)</Label>
          <Input id="unstake-amount" type="number" {...unstakeForm.register("amount")} />
        </div>
        <TxButton type="button" txAction={unstakeAction} pendingLabel="Unstaking">
          Withdraw
        </TxButton>
      </form>
    </div>
  );
}
