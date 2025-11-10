Minimal Rental Suite — ETH-only, plain UI

Overview
- Frontend: React + Vite + TypeScript + Tailwind + Ethers v6 + Day.js
- Backend: Node + Express + Prisma + SQLite (switchable to Postgres)
- Wizard: Create Lease (Role → Property → Parties → Dates → Money [ETH] → Terms → Review)
- PDF: Generates a clean lease PDF (ETH amounts), uploads to backend
- Env toggle: Internal switch between Local (Ganache 1337) and Sepolia (11155111) — never shows chain IDs to users
- Contracts: Addresses loaded from contracts.json; calls a RENT contract method (stub‑friendly)

Quick Start
1) Backend
   cd rental-suite/backend
   cp .env.example .env
   npm install
   npx prisma migrate dev -n init
   npm run dev
   # Backend runs on http://localhost:3001

2) Frontend
   cd rental-suite/frontend
   npm install
   npm run dev
   # Frontend runs on http://localhost:3000

Ganache/Sepolia
- Ganache Desktop:
  - RPC: http://127.0.0.1:8545
  - Chain ID: 1337
  - Block Gas Limit: 12000000
  - CLI alternative:
    npx ganache --port 8545 --wallet.deterministic --chain.chainId 1337 --miner.blockGasLimit 12000000

Truffle networks (reference)
- development: host 127.0.0.1, port 8545, network_id "1337", gas 10,000,000, gasPrice 1 gwei
- sepolia: HDWalletProvider using .env (PRIVATE_KEY, SEPOLIA_RPC)
  - After deployment, update rental-suite/contracts.json with addresses

Combined dev (backend + frontend)
- From rental-suite (workspace root):
  npm install            # installs root dev deps (concurrently)
  npm run dev            # runs backend (3001) and frontend (3000) together

Note: If another app already uses port 3000 (e.g., the Next.js app in ./frontend), stop it or change its port to avoid a conflict.

contracts.json
{
  "1337": { "RENT": "0xYourRentOnGanache" },
  "11155111": { "RENT": "0xYourRentOnSepolia" }
}

Acceptance checkpoints
- Frontend navbar shows: Dashboard, Create, Agreements, Settings
- Wizard inputs are plain (ETH only). No wei/UNIX/hash shown
- Create Lease saves to DB (POST /api/leases), then attempts on‑chain call (parseEther); PATCHes { txHash, chainId, termsHash }
- Download Lease PDF both downloads locally and uploads to backend; DB stores pdfPath
- Internal env toggle (gear) switches wallet to Local or Sepolia; users never see chain IDs in the main UI
- GET /api/leases returns records with ETH strings, txHash, chainId, pdfPath
