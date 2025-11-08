"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChainId, useWriteContract } from "wagmi";
import { contracts } from "../../lib/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { TxButton } from "../TxButton";
import { Button } from "../ui/button";
import { toast } from "../ToastBoundary";
import { parseEther, isHex, padHex, keccak256, toHex } from "viem";

const schema = z.object({
  tenant: z.string().min(1, "Tenant required"),
  landlord: z.string().min(1, "Landlord required"),
  start: z.string().min(1),
  end: z.string().min(1),
  rentPerPeriod: z.string().min(1),
  termsHash: z.string().optional()
});

const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export function AgreementForm() {
  const [ethRent, setEthRent] = useState<string>("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tenant: "",
      landlord: "",
      start: "",
      end: "",
      rentPerPeriod: "",
      termsHash: ZERO_BYTES32
    }
  });
  const chainIdHook = useChainId();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const fillExampleTimes = () => {
    const s = Math.floor(Date.now() / 1000);
    const e = s + 30 * 24 * 60 * 60; // +30 days
    form.setValue("start", String(s));
    form.setValue("end", String(e));
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const chainId = chainIdHook || 1337;
    const start = BigInt(values.start);
    const end = BigInt(values.end);
    if (end <= start) {
      toast.error("End time must be greater than start time");
      return;
    }
    // Normalize termsHash to valid bytes32
    let termsHex = (values.termsHash || "").trim();
    if (!termsHex || termsHex === "0x") {
      termsHex = ZERO_BYTES32;
    } else if (isHex(termsHex, { strict: true })) {
      // Pad to 32 bytes if needed
      termsHex = padHex(termsHex as `0x${string}`, { size: 32 });
    } else {
      // Treat arbitrary text as bytes, store as keccak256(text)
      try {
        termsHex = keccak256(toHex(termsHex));
      } catch {
        termsHex = ZERO_BYTES32;
      }
    }
    await writeContractAsync({
      address: contracts.agreements(chainId).address,
      abi: contracts.agreements(chainId).abi,
      functionName: "mint",
      args: [
        values.tenant as `0x${string}`,
        values.landlord as `0x${string}`,
        start,
        end,
        BigInt(values.rentPerPeriod),
        termsHex as `0x${string}`
      ]
    });
    await queryClient.invalidateQueries({ queryKey: ["agreements", chainId] });
    form.reset();
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="tenant">Tenant address</Label>
        <Input id="tenant" placeholder="0x..." {...form.register("tenant")}></Input>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="landlord">Landlord address</Label>
        <Input id="landlord" placeholder="0x..." {...form.register("landlord")} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="start">Start (unix)</Label>
          <Input id="start" type="number" {...form.register("start")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end">End (unix)</Label>
          <Input id="end" type="number" {...form.register("end")} />
        </div>
      </div>
      <div className="-mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span>Need example timestamps?</span>
        <Button type="button" variant="outline" size="xs" onClick={fillExampleTimes}>
          Use now / +30 days
        </Button>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rentPerPeriod">Rent per period (wei)</Label>
        <Input id="rentPerPeriod" type="number" {...form.register("rentPerPeriod")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rentPerPeriodEth">Rent per period (ETH helper)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="rentPerPeriodEth"
            type="number"
            step="0.0001"
            placeholder="e.g. 0.10"
            value={ethRent}
            onChange={(e) => setEthRent(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              try {
                const wei = parseEther(ethRent || "0");
                form.setValue("rentPerPeriod", wei.toString());
              } catch {
                toast.error("Invalid ETH amount");
              }
            }}
          >
            Set as wei
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="termsHash">Terms hash (bytes32)</Label>
        <Textarea id="termsHash" rows={2} {...form.register("termsHash")} placeholder="0x... or free text (will hash)" />
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => form.setValue("termsHash", ZERO_BYTES32)}
          >
            Set empty (zero bytes32)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              const v = form.getValues("termsHash") || "";
              const hashed = keccak256(toHex(v));
              form.setValue("termsHash", hashed);
            }}
          >
            Hash text to bytes32
          </Button>
        </div>
      </div>
      <TxButton type="button" txAction={() => form.handleSubmit(onSubmit)()} pendingLabel="Minting">
        Mint Agreement
      </TxButton>
    </form>
  );
}
