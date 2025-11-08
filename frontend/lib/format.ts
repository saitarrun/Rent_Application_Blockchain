import { formatEther, type Address } from "viem";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatToken(amount: bigint, decimals = 18, precision = 4) {
  const formatted = Number(amount) / 10 ** decimals;
  // Use a fixed locale to avoid SSR/CSR mismatches
  return formatted.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  });
}

export function formatEth(amount: bigint, precision = 4) {
  const parsed = Number(formatEther(amount));
  // Use a fixed locale to avoid SSR/CSR mismatches
  return parsed.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  });
}

export function ensureAddress(address: string): Address {
  return address as Address;
}
