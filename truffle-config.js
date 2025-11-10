const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const GANACHE_MNEMONIC = process.env.GANACHE_MNEMONIC ||
  "expand alert soda junior poverty rude wheat document unveil club rabbit polar"; // local dev only

module.exports = {
  networks: {
    development: {
      provider: () => new HDWalletProvider({
        mnemonic: { phrase: GANACHE_MNEMONIC },
        providerOrUrl: "http://127.0.0.1:8545",
        numberOfAddresses: 10,
        shareNonce: true,
        derivationPath: "m/44'/60'/0'/0/",
      }),
      network_id: "1337",
      gas: 11_500_000,         // below Ganache block gas limit (12,000,000)
      gasPrice: 20_000_000_000 // 20 gwei to match Ganache display
    },
    sepolia: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.SEPOLIA_RPC),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.24",
      settings: {
        optimizer: { enabled: true, runs: 200 },
        // Target a pre-Shanghai EVM to avoid PUSH0 on Ganache MERGE hardfork
        evmVersion: "paris"
      }
    }
  },
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts"
};
