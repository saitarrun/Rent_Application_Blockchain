# Minimal Rental Portal DApp

Plain, non-crypto UI that hides blockchain details behind a simple lease wizard. Supports Local (Ganache, 1337) and Sepolia (11155111) with one-click network switching.

## Quick Start

Prereqs: Node 20+, npm, MetaMask, Ganache (Desktop or CLI).

```bash
cd lease-portal
npm install
npm run dev
# open http://localhost:5173
```

## Environments

- Local (Ganache)
  - RPC: http://127.0.0.1:8545
  - Chain ID: 1337
  - Block Gas Limit: 12000000
  - Start Ganache Desktop with these settings, or via CLI:
    ```bash
    npx ganache --port 8545 --wallet.deterministic --chain.chainId 1337 --miner.blockGasLimit 12000000
    ```
- Sepolia
  - Provide an RPC endpoint, e.g., Infura/Alchemy.
  - Set `VITE_SEPOLIA_RPC` in a `.env.local` if desired; otherwise defaults to `https://rpc.sepolia.org`.

## Contracts and Addresses

Put deployed addresses in `contracts.json`. Example (placeholders):

```json
{
  "1337": { "RENT": "0xYourRentOnGanache", "RentalAgreementNFT": "0xYourNFTOnGanache" },
  "11155111": { "RENT": "0xYourRentOnSepolia", "RentalAgreementNFT": "0xYourNFTOnSepolia" }
}
```

ABIs live under `src/abi/`. Leave them empty to start (the app will show friendly errors when a call can’t execute), or drop in your compiled ABIs.

## Truffle (deploy helpers)

`truffle-config.js` is included with two networks:

- development: host 127.0.0.1, port 8545, network_id "1337", gas 10,000,000, gasPrice 1 gwei
- sepolia: HDWalletProvider using `PRIVATE_KEY` and `SEPOLIA_RPC` from `.env`

Compile and deploy:

```bash
truffle compile --all
truffle migrate --network development

# or sepolia
export PRIVATE_KEY=0xYOUR_KEY
export SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
truffle migrate --network sepolia
```

## Using the App

1) Click “Switch to Local” or “Switch to Sepolia” in the header. The app will add/switch the network in MetaMask if needed.

2) Connect your wallet (MetaMask prompt).

3) Create Lease Wizard steps:
- Property: address, unit, optional photos (not uploaded).
- Lease terms: start/end date pickers, monthly rent (₹/$), deposit (₹/$), due day.
- ETH price (for conversion): enter a demo rate like 2000 (₹/$ per 1 ETH). The app converts rent/deposit to Ganache test ETH using this rate; no real money moves.
- Parties: landlord and tenant names + contact.
- Review & Create: plain English summary and “Create Lease” button.

Notes:
- The UI keeps amounts in fiat fields; on submit it converts to test ETH using the ETH price you input, then to wei (ethers.parseUnits), and hashes the terms (ethers.id). If ABI/address is missing, you’ll see a friendly toast instead of a stack trace.

## Environment Variables (optional)

Create `lease-portal/.env.local` if you want to override defaults:

```
VITE_LOCAL_RPC=http://127.0.0.1:8545
VITE_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```
