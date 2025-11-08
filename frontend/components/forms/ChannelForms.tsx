"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId, useSignTypedData, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TxButton } from "../TxButton";
import { contracts, RENT_CHANNEL_ABI } from "../../lib/contracts";
import { useChannel, useNonce } from "../../lib/hooks";
import { getVoucherTypedData, type VoucherPayload, encodeVoucher } from "../../lib/eip712";
import { toast } from "../ToastBoundary";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn, formatEth } from "../../lib/format";
import { QRVoucher } from "../modals/QRVoucher";
import { ProgressBar } from "../ui/progress";
import { AddressBadge } from "../AddressBadge";

export function ChannelForms() {
  const [tokenId, setTokenId] = useState<string>("");
  const [voucher, setVoucher] = useState<VoucherPayload | null>(null);
  const [signature, setSignature] = useState<`0x${string}` | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const tokenIdBigInt = tokenId ? BigInt(tokenId) : undefined;
  const { data: channel } = useChannel(tokenIdBigInt);
  const { address } = useAccount();
  const chainIdHook = useChainId();
  const { data: nonce } = useNonce(tokenIdBigInt, address as `0x${string}` | undefined);
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const chainId = chainIdHook || 1337;

  const usage = useMemo(() => {
    if (!channel) return 0;
    if (channel.deposited === 0n) return 0;
    return Number((channel.claimed * 10000n) / channel.deposited) / 100;
  }, [channel]);

  const refreshQueries = async () => {
    if (!tokenIdBigInt) return;
    await queryClient.invalidateQueries({ queryKey: ["channel", chainId, tokenIdBigInt.toString()] });
  };

  const openChannel = async () => {
    if (!tokenIdBigInt) {
      toast.error("Enter token ID");
      return;
    }
    const form = document.getElementById("channel-open") as HTMLFormElement | null;
    const data = new FormData(form ?? undefined);
    const timeout = BigInt((data.get("timeout") as string) || "0");
    const deposit = BigInt((data.get("deposit") as string) || "0");
    if (deposit === 0n) {
      toast.error("Deposit must be greater than zero");
      return;
    }
    await writeContractAsync({
      address: contracts.channel(chainId).address,
      abi: RENT_CHANNEL_ABI,
      functionName: "open",
      args: [tokenIdBigInt, timeout],
      value: deposit
    });
    await refreshQueries();
  };

  const depositMore = async () => {
    if (!tokenIdBigInt) return;
    const form = document.getElementById("channel-deposit") as HTMLFormElement | null;
    const value = BigInt((new FormData(form ?? undefined).get("depositMore") as string) || "0");
    if (value === 0n) {
      toast.error("Deposit must be greater than zero");
      return;
    }
    await writeContractAsync({
      address: contracts.channel(chainId).address,
      abi: RENT_CHANNEL_ABI,
      functionName: "depositMore",
      args: [tokenIdBigInt],
      value
    });
    await refreshQueries();
  };

  const timeoutClose = async () => {
    if (!tokenIdBigInt) return;
    await writeContractAsync({
      address: contracts.channel(chainId).address,
      abi: RENT_CHANNEL_ABI,
      functionName: "timeout",
      args: [tokenIdBigInt]
    });
    await refreshQueries();
  };

  const signVoucher = async () => {
    if (!channel || !address || !tokenIdBigInt) return;
    const form = document.getElementById("voucher-form") as HTMLFormElement | null;
    const fd = new FormData(form ?? undefined);
    const amount = BigInt(fd.get("amount") as string);
    const expiry = BigInt(fd.get("expiry") as string);
    const nonceValue = nonce ? nonce + 1n : 1n;
    const payload: VoucherPayload = {
      payer: channel.payer,
      payee: channel.payee,
      agreementId: tokenIdBigInt,
      amount,
      nonce: nonceValue,
      expiry
    };
    const typedData = getVoucherTypedData(chainId, payload);
    const sig = await signTypedDataAsync(typedData as any);
    setVoucher(payload);
    setSignature(sig as `0x${string}`);
    toast.success("Voucher signed");
  };

  const closeChannel = async () => {
    if (!channel || !voucher || !signature) {
      toast.error("Sign voucher first");
      return;
    }
    await writeContractAsync({
      address: contracts.channel(chainId).address,
      abi: RENT_CHANNEL_ABI,
      functionName: "close",
      args: [voucher, signature]
    });
    await refreshQueries();
  };

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <Label htmlFor="channel-token">Agreement token ID</Label>
        <Input
          id="channel-token"
          placeholder="1"
          value={tokenId}
          onChange={(event) => setTokenId(event.target.value)}
          className="max-w-xs"
        />
        {channel && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <Badge>Deposited {formatEth(channel.deposited)} ETH</Badge>
              <Badge>Claimed {formatEth(channel.claimed)} ETH</Badge>
              <Badge>Status: {channel.closed ? "Closed" : "Open"}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <AddressBadge label="Payer" address={channel.payer} />
              <AddressBadge label="Payee" address={channel.payee} />
            </div>
          </div>
        )}
        {channel && !channel.closed && (
          <ProgressBar value={usage} label={`Paid ${usage}% of deposit`} />
        )}
      </div>

      <form id="channel-open" className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Open Channel</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="timeout">Timeout (seconds)</Label>
            <Input id="timeout" name="timeout" type="number" placeholder="3600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deposit">Deposit (wei)</Label>
            <Input id="deposit" name="deposit" type="number" placeholder="100000000000000000" />
          </div>
        </div>
        <TxButton type="button" txAction={openChannel} pendingLabel="Opening">
          Open Channel
        </TxButton>
      </form>

      <form id="channel-deposit" className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Deposit More</h3>
        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="depositMore">Additional ETH (wei)</Label>
          <Input id="depositMore" name="depositMore" type="number" />
        </div>
        <TxButton type="button" variant="secondary" txAction={depositMore} pendingLabel="Depositing">
          Add Funds
        </TxButton>
      </form>

      <form id="voucher-form" className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
        <h3 className="text-sm font-semibold text-slate-200">Sign Voucher</h3>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="amount">Amount (wei)</Label>
          <Input id="amount" name="amount" type="number" />
        </div>
        <div className="grid gap-2 sm:max-w-md">
          <Label htmlFor="expiry">Expiry (unix)</Label>
          <Input id="expiry" name="expiry" type="number" />
        </div>
        <div className="text-xs text-slate-400">Next nonce: {(nonce ? nonce + 1n : 1n).toString()}</div>
        <div className="flex flex-wrap gap-3">
          <TxButton type="button" variant="secondary" txAction={signVoucher} pendingLabel="Signing">
            Sign Voucher
          </TxButton>
          {voucher && signature && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(encodeVoucher(voucher, signature));
                  toast.success("Voucher copied");
                }}
              >
                Copy JSON
              </Button>
              <Button type="button" variant="ghost" onClick={() => setQrOpen(true)}>
                Show QR
              </Button>
            </>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        <TxButton type="button" variant="default" txAction={closeChannel} pendingLabel="Closing">
          Close with Voucher
        </TxButton>
        <TxButton type="button" variant="destructive" txAction={timeoutClose} pendingLabel="Closing">
          Timeout Close
        </TxButton>
      </div>

      <QRVoucher
        open={qrOpen}
        onOpenChange={setQrOpen}
        voucher={voucher}
        signature={signature}
      />
    </div>
  );
}
