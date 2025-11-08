// Reads Truffle artifacts in build/contracts and writes scripts/addresses.local.json
// Matches the shape the frontend expects.

const fs = require("fs");
const path = require("path");

const OUT_FILE = path.resolve(__dirname, "addresses.local.json");
const ARTIFACTS_DIR = path.resolve(process.cwd(), "build", "contracts");

const CONTRACTS = [
  "RENT",
  "RentalAgreementNFT",
  "DepositStaking",
  "RentChannel",
  "Vendor",
  "MVE",
];

function pickNetwork(networks) {
  if (!networks) return null;
  if (networks["1337"]) return networks["1337"]; // Hardhat/Ganache common
  if (networks["5777"]) return networks["5777"]; // Ganache GUI default
  const keys = Object.keys(networks);
  if (keys.length === 0) return null;
  return networks[keys[0]];
}

function main() {
  const result = {};
  for (const name of CONTRACTS) {
    const file = path.join(ARTIFACTS_DIR, `${name}.json`);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing artifact for ${name} at ${file}`);
    }
    const artifact = JSON.parse(fs.readFileSync(file, "utf8"));
    const nw = pickNetwork(artifact.networks);
    if (!nw || !nw.address) {
      throw new Error(`No deployed address found for ${name}. Did you run truffle migrate?`);
    }
    result[name] = nw.address;
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Wrote addresses to ${OUT_FILE}`);
  console.log(result);
}

main();

