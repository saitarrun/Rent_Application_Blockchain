"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { preferredChainId } from "../lib/net";
import { Button } from "./ui/button";
import { toast } from "./ToastBoundary";
import { ganache, supportedChains } from "../lib/viem";
import { shortenAddress } from "../lib/format";

export function Connect({ simple = false }: { simple?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { connector, connect, connectors, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, chains } = useSwitchChain();
  const target = preferredChainId();

  useEffect(() => {
    setMounted(true);
    if (chainId && !supportedChains.some((c) => c.id === chainId)) {
      toast.error("Unsupported network detected. Switch to Ganache or Sepolia.");
    }
  }, [chainId]);

  // Avoid SSR/CSR mismatch by deferring UI until mounted
  if (!mounted) {
    return <div className="h-8 w-28 rounded-xl bg-slate-800/60" aria-hidden="true" />;
  }

  if (address) {
    const wrongNetwork = !chainId || !supportedChains.some((c) => c.id === chainId);
    const chainName = supportedChains.find((c) => c.id === chainId)?.name;
    return (
      <div className="flex items-center gap-3">
        {!simple && (
          <>
            <Button
              variant={wrongNetwork ? "destructive" : "secondary"}
              size="sm"
              onClick={() => switchChainAsync?.({ chainId: target })}
            >
              {chainName ?? "Select network"}
            </Button>
            {!wrongNetwork && chains && chains.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchChainAsync?.({ chainId: chains.find((c) => c.id !== chainId)?.id || target })}
              >
                {(() => {
                  const other = chains.find((c) => c.id !== chainId);
                  return `Switch to ${other?.name ?? "other"}`;
                })()}
              </Button>
            )}
          </>
        )}
        <div className="rounded-xl bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
          {shortenAddress(address)}
        </div>
        <Button variant="ghost" size="sm" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  const metamask = connectors.find((c) => c.name === "MetaMask") ?? connectors[0];

  return (
    <Button
      size="sm"
      onClick={() => connect({ connector: metamask })}
      disabled={isLoading && pendingConnector?.id === metamask?.id}
    >
      {isLoading && pendingConnector?.id === metamask?.id ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
