// Build a single frontend/config/contracts.json with addresses + ABIs
// Sources:
//  - Addresses: scripts/addresses.local.json, scripts/addresses.sepolia.json (if present)
//    Fallback to Truffle artifacts networks (1337/5777/11155111)
//  - ABIs: build/contracts/<Contract>.json

const fs = require("fs");
const path = require("path");

const FRONTEND_CONFIG = path.resolve(__dirname, "..", "frontend", "config", "contracts.json");
const ARTIFACTS_DIR = path.resolve(process.cwd(), "build", "contracts");
const ADDR_LOCAL = path.resolve(__dirname, "addresses.local.json");
const ADDR_SEPOLIA = path.resolve(__dirname, "addresses.sepolia.json");

const CONTRACTS = [
  "RENT",
  "RentalAgreementNFT",
  "DepositStaking",
  "RentChannel",
  "Vendor",
  "MVE",
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function optional(p) {
  try { return readJson(p); } catch { return null; }
}

function artifact(name) {
  const file = path.join(ARTIFACTS_DIR, `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing artifact: ${file}`);
  return readJson(file);
}

function addressFromArtifacts(name, networkChoices) {
  const a = artifact(name);
  const nets = a.networks || {};
  for (const id of networkChoices) {
    if (nets[id] && nets[id].address) return nets[id].address;
  }
  return undefined;
}

function collect(network) {
  const addresses = {};
  const abis = {};
  const addrHint = network === "sepolia" ? optional(ADDR_SEPOLIA) : optional(ADDR_LOCAL);

  for (const name of CONTRACTS) {
    // ABI
    abis[name] = artifact(name).abi;
    // Address
    let addr = addrHint && addrHint[name];
    if (!addr) {
      const choices = network === "sepolia" ? ["11155111"] : ["1337", "5777"];
      addr = addressFromArtifacts(name, choices);
    }
    if (!addr) {
      throw new Error(`No address found for ${name} on ${network}. Deploy or provide scripts/addresses.${network}.json`);
    }
    addresses[name] = addr;
  }

  return { addresses, abis };
}

function main() {
  // Ensure target dir
  const dir = path.dirname(FRONTEND_CONFIG);
  fs.mkdirSync(dir, { recursive: true });

  const out = {
    local: collect("local"),
    sepolia: collect("sepolia"),
  };

  fs.writeFileSync(FRONTEND_CONFIG, JSON.stringify(out, null, 2));
  console.log(`Wrote ${FRONTEND_CONFIG}`);
}

main();

