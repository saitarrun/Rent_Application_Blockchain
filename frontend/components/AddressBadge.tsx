import { Copy } from "./Copy";
import { shortenAddress } from "../lib/format";

export function AddressBadge({ label, address }: { label?: string; address?: string }) {
  if (!address) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
      {label && <span className="text-slate-500">{label}</span>}
      <span className="font-mono">{shortenAddress(address)}</span>
      <Copy value={address} variant="ghost" size="icon" />
    </div>
  );
}
