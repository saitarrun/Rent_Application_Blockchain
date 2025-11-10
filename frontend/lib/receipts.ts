import { useChainId, useAccount, usePublicClient } from "wagmi";
import { contracts, RENT_CHANNEL_ABI } from "./contracts";
import { useQuery } from "@tanstack/react-query";

export type Receipt = {
  tokenId: bigint;
  payer: `0x${string}`;
  payee: `0x${string}`;
  paid: bigint;
  refunded: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

export function useReceipts() {
  const chainIdHook = useChainId();
  const { address } = useAccount();
  const chainId = chainIdHook || 1337;

  const client = usePublicClient();

  return useQuery<Receipt[]>({
    queryKey: ["receipts", chainId, address],
    queryFn: async () => {
      if (!client) return [];
      const { address: channelAddr } = contracts.channel(chainId);
      const latest = await client.getBlockNumber();
      const fromBlock = latest > 100000n ? latest - 100000n : 0n;
      const logs = await client.getLogs({
        address: channelAddr,
        event: (RENT_CHANNEL_ABI as any).find((e: any) => e.name === "Closed"),
        fromBlock,
        toBlock: "latest"
      });
      const items: Receipt[] = [];
      for (const log of logs as any[]) {
        const { tokenId, payer, payee, paid, refunded } = log.args as any;
        if (address && payer !== address && payee !== address) continue;
        items.push({
          tokenId, payer, payee, paid, refunded,
          txHash: log.transactionHash as `0x${string}`,
          blockNumber: log.blockNumber as bigint
        });
      }
      return items.sort((a, b) => Number(b.blockNumber - a.blockNumber));
    },
    staleTime: 15000
  });
}
