import { writeFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with ${deployer.address}`);

  const Rent = await ethers.getContractFactory("RENT");
  const rent = await Rent.deploy(deployer.address);
  await rent.waitForDeployment();

  const Agreements = await ethers.getContractFactory("RentalAgreementNFT");
  const agreements = await Agreements.deploy();
  await agreements.waitForDeployment();

  const Staking = await ethers.getContractFactory("DepositStaking");
  const staking = await Staking.deploy(await rent.getAddress(), await agreements.getAddress());
  await staking.waitForDeployment();

  const Channel = await ethers.getContractFactory("RentChannel");
  const channel = await Channel.deploy(await agreements.getAddress());
  await channel.waitForDeployment();

  const Vendor = await ethers.getContractFactory("Vendor");
  const vendor = await Vendor.deploy(await rent.getAddress(), deployer.address);
  await vendor.waitForDeployment();

  const Amm = await ethers.getContractFactory("MVE");
  const amm = await Amm.deploy(await rent.getAddress(), deployer.address);
  await amm.waitForDeployment();

  await rent.setMinter(await vendor.getAddress(), true);
  await rent.setMinter(await amm.getAddress(), true);

  // Seed vendor and AMM
  const initialRent = ethers.parseUnits("10000", 18);
  await (await rent.mint(deployer.address, initialRent)).wait();
  await (await rent.transfer(await vendor.getAddress(), ethers.parseUnits("2000", 18))).wait();
  await (await vendor.setPrices(ethers.parseUnits("100", 18), ethers.parseUnits("1", 16))).wait();

  const liquidityRent = ethers.parseUnits("5000", 18);
  const liquidityEth = ethers.parseEther("50");
  await (await rent.approve(await amm.getAddress(), liquidityRent)).wait();
  await (await amm.addLiquidity(liquidityRent, { value: liquidityEth })).wait();

  const addresses = {
    RENT: await rent.getAddress(),
    RentalAgreementNFT: await agreements.getAddress(),
    DepositStaking: await staking.getAddress(),
    RentChannel: await channel.getAddress(),
    Vendor: await vendor.getAddress(),
    MVE: await amm.getAddress()
  };

  const outPath = path.resolve(__dirname, "addresses.local.json");
  await writeFile(outPath, JSON.stringify(addresses, null, 2));
  console.log(`Deployed addresses saved to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
