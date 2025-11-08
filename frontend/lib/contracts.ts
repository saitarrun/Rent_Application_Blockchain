import type { Address } from "viem";
import { getAddressBook } from "./addresses";

// Generated config is optional and not required at build time.
// The app defaults to ABIs below + addresses from scripts/addresses.*.json
const GENERATED_CONFIG: any | null = null;

function netKey(chainId?: number) {
  return chainId === 11155111 ? "sepolia" : "local";
}

const RENT_ABI_FALLBACK = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bool", name: "allowed", type: "bool" }
    ],
    name: "setMinter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const RENT_ABI = (GENERATED_CONFIG?.local?.abis?.RENT || GENERATED_CONFIG?.sepolia?.abis?.RENT || RENT_ABI_FALLBACK) as const;

const RENTAL_AGREEMENT_ABI_FALLBACK = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "landlord", type: "address" },
      { indexed: true, internalType: "address", name: "tenant", type: "address" }
    ],
    name: "AgreementMinted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "uint256", name: "id", type: "uint256" }],
    name: "AgreementEnded",
    type: "event"
  },
  // Functions
  {
    inputs: [
      { internalType: "address", name: "landlord", type: "address" },
      { internalType: "address", name: "tenant", type: "address" },
      { internalType: "uint64", name: "start", type: "uint64" },
      { internalType: "uint64", name: "end", type: "uint64" },
      { internalType: "uint256", name: "rentPerPeriod", type: "uint256" },
      { internalType: "bytes32", name: "termsHash", type: "bytes32" }
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "burnAfterEnd",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getTerms",
    outputs: [
      {
        components: [
          { internalType: "address", name: "landlord", type: "address" },
          { internalType: "address", name: "tenant", type: "address" },
          { internalType: "uint64", name: "start", type: "uint64" },
          { internalType: "uint64", name: "end", type: "uint64" },
          { internalType: "uint256", name: "rentPerPeriod", type: "uint256" },
          { internalType: "bytes32", name: "termsHash", type: "bytes32" }
        ],
        internalType: "struct RentalAgreementNFT.Terms",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export const RENTAL_AGREEMENT_ABI = (GENERATED_CONFIG?.local?.abis?.RentalAgreementNFT || GENERATED_CONFIG?.sepolia?.abis?.RentalAgreementNFT || RENTAL_AGREEMENT_ABI_FALLBACK) as const;

const STAKING_ABI_FALLBACK = [
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" }
    ],
    name: "landlordClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "tenantWithdrawAfterEnd",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "escrow",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

export const STAKING_ABI = (GENERATED_CONFIG?.local?.abis?.DepositStaking || GENERATED_CONFIG?.sepolia?.abis?.DepositStaking || STAKING_ABI_FALLBACK) as const;

const RENT_CHANNEL_ABI_FALLBACK = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: true, internalType: "address", name: "payee", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "Opened",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "Deposited",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: true, internalType: "address", name: "payee", type: "address" },
      { indexed: false, internalType: "uint256", name: "paid", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "refunded", type: "uint256" }
    ],
    name: "Closed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: false, internalType: "uint256", name: "refunded", type: "uint256" }
    ],
    name: "TimeoutClosed",
    type: "event"
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint64", name: "timeoutSeconds", type: "uint64" }
    ],
    name: "open",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "depositMore",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "payer", type: "address" },
          { internalType: "address", name: "payee", type: "address" },
          { internalType: "uint256", name: "agreementId", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "uint256", name: "expiry", type: "uint256" }
        ],
        internalType: "struct SignatureVerifier.Voucher",
        name: "voucher",
        type: "tuple"
      },
      { internalType: "bytes", name: "signature", type: "bytes" }
    ],
    name: "close",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "agreementId", type: "uint256" }],
    name: "timeout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "channels",
    outputs: [
      { internalType: "address", name: "payer", type: "address" },
      { internalType: "address", name: "payee", type: "address" },
      { internalType: "uint256", name: "deposit", type: "uint256" },
      { internalType: "uint256", name: "claimed", type: "uint256" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint64", name: "timeoutAt", type: "uint64" },
      { internalType: "bool", name: "open", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

export const RENT_CHANNEL_ABI = (GENERATED_CONFIG?.local?.abis?.RentChannel || GENERATED_CONFIG?.sepolia?.abis?.RentChannel || RENT_CHANNEL_ABI_FALLBACK) as const;

const VENDOR_ABI_FALLBACK = [
  {
    inputs: [],
    name: "buyPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "sellPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "sell",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "buyPrice_", type: "uint256" },
      { internalType: "uint256", name: "sellPrice_", type: "uint256" }
    ],
    name: "setPrices",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const VENDOR_ABI = (GENERATED_CONFIG?.local?.abis?.Vendor || GENERATED_CONFIG?.sepolia?.abis?.Vendor || VENDOR_ABI_FALLBACK) as const;

const MVE_ABI_FALLBACK = [
  {
    inputs: [],
    name: "reserveETH",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "reserveRent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "rentAmount", type: "uint256" }],
    name: "addLiquidity",
    outputs: [{ internalType: "uint256", name: "liquidity", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "lpAmount", type: "uint256" }],
    name: "removeLiquidity",
    outputs: [
      { internalType: "uint256", name: "ethOut", type: "uint256" },
      { internalType: "uint256", name: "rentOut", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "minRentOut", type: "uint256" }],
    name: "swapExactETHForRENT",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "minEthOut", type: "uint256" }
    ],
    name: "swapExactRENTForETH",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export const MVE_ABI = (GENERATED_CONFIG?.local?.abis?.MVE || GENERATED_CONFIG?.sepolia?.abis?.MVE || MVE_ABI_FALLBACK) as const;

export const contracts = {
  rent: (chainId?: number) => ({
    address: (GENERATED_CONFIG?.[netKey(chainId)]?.addresses?.RENT as Address) || getAddressBook(chainId).RENT,
    abi: RENT_ABI
  }),
  agreements: (chainId?: number) => ({
    address: (GENERATED_CONFIG?.[netKey(chainId)]?.addresses?.RentalAgreementNFT as Address) || getAddressBook(chainId).RentalAgreementNFT,
    abi: RENTAL_AGREEMENT_ABI
  }),
  staking: (chainId?: number) => ({
    address: (GENERATED_CONFIG?.[netKey(chainId)]?.addresses?.DepositStaking as Address) || getAddressBook(chainId).DepositStaking,
    abi: STAKING_ABI
  }),
  channel: (chainId?: number) => ({
    address: (GENERATED_CONFIG?.[netKey(chainId)]?.addresses?.RentChannel as Address) || getAddressBook(chainId).RentChannel,
    abi: RENT_CHANNEL_ABI
  }),
  vendor: (chainId?: number) => ({
    address: (GENERATED_CONFIG?.[netKey(chainId)]?.addresses?.Vendor as Address) || getAddressBook(chainId).Vendor,
    abi: VENDOR_ABI
  }),
  amm: (chainId?: number) => ({
    address: (GENERATED_CONFIG?.[netKey(chainId)]?.addresses?.MVE as Address) || getAddressBook(chainId).MVE,
    abi: MVE_ABI
  })
};

export type ContractName = keyof typeof contracts;

export function contractAddress(name: ContractName, chainId?: number): Address {
  return contracts[name](chainId).address as Address;
}
