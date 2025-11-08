"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { sepolia } from "viem/chains";
import { defineChain } from "viem";
import { injected } from "@wagmi/connectors";

export const ganache = defineChain({
  id: 1337,
  name: "Ganache",
  network: "ganache",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545"]
    }
  }
});

export const supportedChains = [ganache, sepolia] as const;

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [injected()],
  transports: {
    [ganache.id]: http(process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545"),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.sepolia.org")
  }
});

export const queryClient = new QueryClient();
