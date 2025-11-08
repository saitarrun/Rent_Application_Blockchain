import { writeFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying to Sepolia with ${deployer.address}`);

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

  const minted = ethers.parseUnits("100000", 18);
  await (await rent.mint(deployer.address, minted)).wait();

  const vendorSeed = ethers.parseUnits("20000", 18);
  await (await rent.transfer(await vendor.getAddress(), vendorSeed)).wait();
  await (await vendor.setPrices(ethers.parseUnits("100", 18), ethers.parseUnits("1", 16))).wait();

  const rentLiquidity = ethers.parseUnits("50000", 18);
  const ethLiquidity = ethers.parseEther("100");
  await (await rent.approve(await amm.getAddress(), rentLiquidity)).wait();
  await (await amm.addLiquidity(rentLiquidity, { value: ethLiquidity })).wait();

  const addresses = {
    RENT: await rent.getAddress(),
    RentalAgreementNFT: await agreements.getAddress(),
    DepositStaking: await staking.getAddress(),
    RentChannel: await channel.getAddress(),
    Vendor: await vendor.getAddress(),
    MVE: await amm.getAddress()
  };

  const outPath = path.resolve(__dirname, "addresses.sepolia.json");
  await writeFile(outPath, JSON.stringify(addresses, null, 2));
  console.log(`Sepolia addresses saved to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
