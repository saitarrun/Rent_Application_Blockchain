import local from "../../scripts/addresses.local.json";
import sepolia from "../../scripts/addresses.sepolia.json";
import type { Address } from "viem";

export type AddressBook = {
  RENT: Address;
  RentalAgreementNFT: Address;
  DepositStaking: Address;
  RentChannel: Address;
  Vendor: Address;
  MVE: Address;
};

const byEnv: Record<string, AddressBook> = {
  local: local as AddressBook,
  sepolia: sepolia as AddressBook
};

export function getAddressBook(chainId?: number): AddressBook {
  if (chainId === 11155111) return byEnv.sepolia;
  if (chainId === 1337 || chainId === 31337) return byEnv.local;
  const fallback = process.env.NEXT_PUBLIC_NETWORK ?? "local";
  return byEnv[fallback] || byEnv.local;
}

export function getAddress(name: keyof AddressBook, chainId?: number): Address {
  const book = getAddressBook(chainId);
  return book[name];
}
