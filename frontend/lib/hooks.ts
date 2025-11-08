"use client";

import { useAccount, useChainId, usePublicClient } from "wagmi";
import { readContract, watchContractEvent } from "wagmi/actions";
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Hex } from "viem";
import { contracts, RENT_CHANNEL_ABI, RENTAL_AGREEMENT_ABI, STAKING_ABI, VENDOR_ABI, MVE_ABI, RENT_ABI } from "./contracts";
import { getAddressBook } from "./addresses";
import { wagmiConfig } from "./viem";

export type Agreement = {
  tokenId: bigint;
  landlord: `0x${string}`;
  tenant: `0x${string}`;
  start: bigint;
  end: bigint;
  rentPerPeriod: bigint;
  termsHash: Hex;
};

export function useAddressBook() {
  const chainId = useChainId();
  return useMemo(() => getAddressBook(chainId), [chainId]);
}

export function useAgreements() {
  const chainIdHook = useChainId();
  const client = usePublicClient();
  const queryClient = useQueryClient();
  const chainId = chainIdHook || 1337;

  const query = useQuery<Agreement[]>({
    queryKey: ["agreements", chainId],
    queryFn: async () => {
      if (!client) return [];
      const contract = contracts.agreements(chainId);
      const latest = await client.getBlockNumber();
      const fromBlock = latest > 100000n ? latest - 100000n : 0n;
      const logs = await client.getLogs({
        address: contract.address,
        event: RENTAL_AGREEMENT_ABI[0], // AgreementMinted
        fromBlock,
        toBlock: "latest"
      });
      const items: Agreement[] = [];
      for (const log of logs) {
        const tokenId = (log.args?.id ?? log.args?.tokenId) as bigint;
        const terms = (await readContract(wagmiConfig, {
          address: contract.address,
          abi: RENTAL_AGREEMENT_ABI,
          functionName: "getTerms",
          args: [tokenId]
        })) as any;
        items.push({
          tokenId,
          landlord: terms.landlord,
          tenant: terms.tenant,
          start: terms.start,
          end: terms.end,
          rentPerPeriod: terms.rentPerPeriod,
          termsHash: terms.termsHash
        });
      }
      return items;
    },
    staleTime: 30_000
  });

  useEffect(() => {
    if (!chainId) return;
    const unwatch = watchContractEvent(wagmiConfig, {
      address: contracts.agreements(chainId).address,
      abi: RENTAL_AGREEMENT_ABI,
      eventName: "AgreementMinted"
    }, () => {
      queryClient.invalidateQueries({ queryKey: ["agreements", chainId] }).catch(() => undefined);
    });
    return () => {
      unwatch?.();
    };
  }, [chainId, queryClient]);

  return query;
}

export function useStakedAmount(tokenId?: bigint) {
  const chainId = useChainId() || 1337;
  return useQuery<bigint>({
    enabled: Boolean(tokenId),
    queryKey: ["staked", chainId, tokenId?.toString()],
    queryFn: async () => {
      const { address, abi } = contracts.staking(chainId);
      return (await readContract(wagmiConfig, {
        address,
        abi,
        functionName: "escrow",
        args: [tokenId!]
      })) as bigint;
    }
  });
}

export function useVendorPrices() {
  const chainId = useChainId() || 1337;
  return useQuery({
    queryKey: ["vendor-prices", chainId],
    queryFn: async () => {
      const { address } = contracts.vendor(chainId);
      const [buyPrice, sellPrice] = await Promise.all([
        readContract(wagmiConfig, { address, abi: VENDOR_ABI, functionName: "buyPrice" }) as Promise<bigint>,
        readContract(wagmiConfig, { address, abi: VENDOR_ABI, functionName: "sellPrice" }) as Promise<bigint>
      ]);
      return { buyPrice, sellPrice };
    },
    staleTime: 20_000
  });
}

export function useRentBalance() {
  const { address } = useAccount();
  const chainId = useChainId() || 1337;
  return useQuery<bigint>({
    enabled: Boolean(address),
    queryKey: ["rent-balance", chainId, address],
    queryFn: async () => {
      const { address: token } = contracts.rent(chainId);
      return (await readContract(wagmiConfig, {
        address: token,
        abi: RENT_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`]
      })) as bigint;
    }
  });
}

export function useChannel(tokenId?: bigint) {
  const chainId = useChainId() || 1337;
  return useQuery({
    enabled: Boolean(tokenId),
    queryKey: ["channel", chainId, tokenId?.toString()],
    queryFn: async () => {
      const { address, abi } = contracts.channel(chainId);
      const raw = await readContract(wagmiConfig, {
        address,
        abi,
        functionName: "channels",
        args: [tokenId!]
      }) as any;
      return {
        payer: raw.payer as `0x${string}`,
        payee: raw.payee as `0x${string}`,
        deposited: raw.deposit as bigint,
        claimed: raw.claimed as bigint,
        timeoutAt: raw.timeoutAt as bigint,
        closed: !(raw.open as boolean)
      };
    },
    staleTime: 5_000
  });
}

export function useAmmState() {
  const chainId = useChainId() || 1337;
  const { address, abi } = contracts.amm(chainId);
  return useQuery({
    queryKey: ["amm-state", chainId],
    queryFn: async () => {
      const [reserveETH, reserveRent] = await Promise.all([
        readContract(wagmiConfig, { address, abi: MVE_ABI, functionName: "reserveETH" }) as Promise<bigint>,
        readContract(wagmiConfig, { address, abi: MVE_ABI, functionName: "reserveRent" }) as Promise<bigint>
      ]);
      return { reserveETH, reserveRent };
    },
    staleTime: 10_000
  });
}

export function useNonce(tokenId?: bigint, payer?: `0x${string}`) {
  const chainId = useChainId() || 1337;
  return useQuery({
    enabled: Boolean(tokenId && payer),
    queryKey: ["channel-nonce", chainId, tokenId?.toString(), payer],
    queryFn: async () => {
      const { address, abi } = contracts.channel(chainId);
      return readContract(wagmiConfig, {
        address,
        abi,
        functionName: "nonces",
        args: [payer!, tokenId!]
      }) as Promise<bigint>;
    },
    staleTime: 5_000
  });
}
