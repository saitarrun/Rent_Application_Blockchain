import { ethers } from "hardhat";

/**
 * Send local ETH from a Ganache account to any address.
 * Usage:
 *   GANACHE_RPC=http://127.0.0.1:7545 PRIVATE_KEY=0x... TO=0xAbc... AMOUNT=1.5 pnpm hardhat run scripts/fund_local.ts --network ganache
 */
async function main() {
  const to = process.env.TO as `0x${string}` | undefined;
  const amount = process.env.AMOUNT || "1.0"; // ETH
  const pk = process.env.PRIVATE_KEY || process.env.FUND_PK;

  if (!to) throw new Error("Missing TO=0x... recipient address");
  if (!pk) throw new Error("Missing PRIVATE_KEY=<ganache account private key>");

  const signer = new ethers.Wallet(pk, ethers.provider);
  const value = ethers.parseEther(amount);
  const bal = await ethers.provider.getBalance(signer.address);
  if (bal < value) {
    console.warn(`Warning: sender balance ${ethers.formatEther(bal)} ETH is less than requested ${amount} ETH`);
  }

  console.log(`Funding ${to} with ${amount} ETH from ${signer.address}`);
  const tx = await signer.sendTransaction({ to, value });
  console.log(`Tx: ${tx.hash}`);
  await tx.wait();
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

