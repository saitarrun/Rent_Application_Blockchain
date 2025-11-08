# Smart Rental Agreement DApp

This project provides a decentralized rental agreement system using a soulbound NFT for the lease, a staking contract for the security deposit, and a payment channel for rent.

This guide explains how to run the application manually on your local machine.

---

## 0. Prerequisites

Before you begin, you will need the following installed:

-   **Node.js**: [v20.x or later](https://nodejs.org/)
-   **pnpm**: A performant package manager for Node.js. You can install it with `npm install -g pnpm`.
-   **MetaMask**: A browser extension wallet.
-   **Ganache**: A personal blockchain for development. You can use the [GUI](https://trufflesuite.com/ganache/) or the command-line version.

*(Note: The Docker files (`Dockerfile`, `docker-compose.yml`) in this project are no longer used and can be safely deleted.)*

---

## 1. Start Your Local Blockchain

You need a local blockchain running on port `8545` with a Chain ID of `1337`.

**Using Ganache GUI:**
1.  Open Ganache.
2.  Click **"Quickstart"** (Ethereum).
3.  Go to Settings (the gear icon in the top right).
4.  Under the **Server** tab, set the **Port Number** to `8545`.
5.  Under the **Chain** tab, set the **Chain ID** to `1337`.
6.  Save and restart the workspace.

**Using Ganache CLI:**
Open your terminal and run the following command:
```bash
npx ganache --port 8545 --chainId 1337 --wallet.deterministic
```
Keep this terminal window open.

---

## 2. Install Project Dependencies

Open a new terminal window in the project's root directory and run:

```bash
pnpm install
```
This will install all the necessary packages for both the smart contracts and the frontend application.

---

## 3. Deploy Smart Contracts

In the same terminal, run the deployment script:

```bash
pnpm run deploy:local
```
This command will:
1.  Compile all the smart contracts.
2.  Deploy them to your running Ganache instance.
3.  Save the deployed contract addresses into `scripts/addresses.local.json`, which the frontend needs to connect to them.

---

## 4. Run the Frontend Application

Once the contracts are deployed, start the frontend development server:

```bash
pnpm run frontend:dev
```
The application will now be running. You can access it at:

**[http://localhost:3000](http://localhost:3000)**

---

## 5. Configure MetaMask

To interact with the application, you need to connect MetaMask to your local Ganache blockchain.

1.  **Add the Ganache Network:**
    *   Open MetaMask and click on the network dropdown at the top.
    *   Select **"Add network"** -> **"Add a network manually"**.
    *   Fill in the details:
        *   **Network name:** `Ganache Local`
        *   **New RPC URL:** `http://127.0.0.1:8545`
        *   **Chain ID:** `1337`
        *   **Currency symbol:** `ETH`
    *   Click **"Save"**.

2.  **Import an Account:**
    *   In your Ganache window, copy one of the private keys.
    *   In MetaMask, click the circle icon -> **"Import account"**.
    *   Paste the private key and click **"Import"**.

Your MetaMask is now connected to Ganache and has test ETH to use in the application. Refresh the application page in your browser, and MetaMask should prompt you to connect.

---

## Quick Troubleshooting

-   **`ECONNREFUSED 127.0.0.1:8545`**: This means Hardhat can't connect to your local blockchain. Make sure Ganache is running on port `8545`.
-   **MetaMask Errors**: Ensure MetaMask is connected to the "Ganache Local" network (Chain ID 1337).
-   **Application is stuck loading**: Make sure you have run the `pnpm run deploy:local` command successfully. If the `scripts/addresses.local.json` file is empty, the frontend won't work.