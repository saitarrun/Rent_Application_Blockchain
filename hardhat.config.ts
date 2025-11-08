import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const SEPOLIA_RPC = process.env.SEPOLIA_RPC || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // dummy
const GANACHE_RPC = process.env.GANACHE_RPC || "http://127.0.0.1:8545";

// Define networks that are always available
const networks: HardhatUserConfig["networks"] = {
  hardhat: {},
  ganache: {
    url: GANACHE_RPC,
    chainId: 1337,
  },
};

// Conditionally add the sepolia network if the RPC URL is provided
if (SEPOLIA_RPC) {
  networks.sepolia = {
    url: SEPOLIA_RPC,
    accounts: [PRIVATE_KEY],
    chainId: 11155111,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks, // Use the dynamically constructed networks object
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
