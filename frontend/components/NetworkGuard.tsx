"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { preferredChainId } from "../lib/net";
import { supportedChains } from "../lib/viem";
import { useEffect, useState } from "react";

const DEFAULT_TARGET = preferredChainId();

export function NetworkGuard({ target = DEFAULT_TARGET }: { target?: number }) {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const show = isConnected && chainId !== target;
  const targetName = supportedChains.find((c) => c.id === target)?.name ?? `Chain ${target}`;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-40 bg-amber-400 text-black py-3 px-4 flex items-center justify-center gap-3"
        >
          <span>Wrong network. Switch to {targetName}.</span>
          <button
            onClick={() => switchChain?.({ chainId: target })}
            className="rounded-lg bg-black text-white px-3 py-1 hover:opacity-90"
          >
            Switch
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
