import type { Address, Hex } from "viem";
import { contracts } from "./contracts";

export type VoucherPayload = {
  payer: Address;
  payee: Address;
  agreementId: bigint;
  amount: bigint;
  nonce: bigint;
  expiry: bigint;
};

const VOUCHER_TYPES = {
  Voucher: [
    { name: "payer", type: "address" },
    { name: "payee", type: "address" },
    { name: "agreementId", type: "uint256" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" }
  ]
} as const;

export function getDomain(chainId: number, contractAddress?: Address) {
  return {
    name: "RentChannel",
    version: "1",
    chainId,
    verifyingContract: contractAddress ?? contracts.channel(chainId).address
  };
}

export function getVoucherTypedData(chainId: number, payload: VoucherPayload) {
  return {
    domain: getDomain(chainId),
    types: VOUCHER_TYPES,
    primaryType: "Voucher" as const,
    message: payload
  };
}

export function encodeVoucher(payload: VoucherPayload, signature: Hex) {
  return JSON.stringify({ ...payload, signature });
}
