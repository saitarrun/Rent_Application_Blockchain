"use client";

import { Button } from "./ui/button";
import { useAccount, useChainId, useSignTypedData, useWriteContract } from "wagmi";
import { useChannel, useNonce } from "../lib/hooks";
import { contracts, RENT_CHANNEL_ABI } from "../lib/contracts";
import { getVoucherTypedData, type VoucherPayload, encodeVoucher } from "../lib/eip712";
import { toast } from "./ToastBoundary";
import { useEffect, useMemo } from "react";

export function PayNow({ tokenId, amountWei }: { tokenId: bigint; amountWei: bigint }) {
  const { address } = useAccount();
  const chainIdHook = useChainId();
  const chainId = chainIdHook || 1337;
  const { data: channel } = useChannel(tokenId);
  const { data: nonce } = useNonce(tokenId, address as `0x${string}` | undefined);
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();

  const needDeposit = useMemo(() => {
    if (!channel) return amountWei;
    const available = channel.deposited - channel.claimed;
    return available >= amountWei ? 0n : (amountWei - available);
  }, [channel, amountWei]);

  const openOrFund = async () => {
    if (!address) throw new Error("Connect your account");
    if (!channel || channel.closed) {
      await writeContractAsync({
        address: contracts.channel(chainId).address,
        abi: RENT_CHANNEL_ABI,
        functionName: "open",
        args: [tokenId, 3600n],
        value: amountWei
      });
      return;
    }
    if (needDeposit > 0n) {
      await writeContractAsync({
        address: contracts.channel(chainId).address,
        abi: RENT_CHANNEL_ABI,
        functionName: "depositMore",
        args: [tokenId],
        value: needDeposit
      });
    }
  };

  const closeWithVoucher = async () => {
    if (!channel || !address) throw new Error("Missing channel or account");
    const n = nonce ? nonce + 1n : 1n;
    const payload: VoucherPayload = {
      payer: channel.payer,
      payee: channel.payee,
      agreementId: tokenId,
      amount: amountWei,
      nonce: n,
      expiry: BigInt(Math.floor(Date.now() / 1000) + 3600)
    };
    const typed = getVoucherTypedData(chainId, payload);
    const signature = await signTypedDataAsync(typed as any);
    await writeContractAsync({
      address: contracts.channel(chainId).address,
      abi: RENT_CHANNEL_ABI,
      functionName: "close",
      args: [payload, signature as `0x${string}`]
    });
  };

  const pay = async () => {
    try {
      await openOrFund();
      await closeWithVoucher();
      toast.success("Rent paid");
    } catch (err: any) {
      console.error(err);
      toast.error("Payment failed. Ensure you are the tenant and have test ETH.");
    }
  };

  return (
    <Button onClick={pay} className="w-full" variant="secondary">Pay Rent</Button>
  );
}

