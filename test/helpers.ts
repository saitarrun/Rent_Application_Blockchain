import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export interface CoreDeployments {
  deployer: SignerWithAddress;
  landlord: SignerWithAddress;
  tenant: SignerWithAddress;
  other: SignerWithAddress;
  rent: any;
  agreements: any;
  staking: any;
  channel: any;
  vendor: any;
  amm: any;
}

export async function deployCore(): Promise<CoreDeployments> {
  const [deployer, landlord, tenant, other] = await ethers.getSigners();

  const Rent = await ethers.getContractFactory("RENT");
  const rent = await Rent.deploy(deployer.address);
  await rent.waitForDeployment();

  const Agreements = await ethers.getContractFactory("RentalAgreementNFT");
  const agreements = await Agreements.deploy(deployer.address);
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

  await rent.connect(deployer).setMinter(await vendor.getAddress(), true);
  await rent.connect(deployer).setMinter(await amm.getAddress(), true);

  return {
    deployer,
    landlord,
    tenant,
    other,
    rent,
    agreements,
    staking,
    channel,
    vendor,
    amm
  };
}

export async function currentTime(): Promise<number> {
  const { timestamp } = await ethers.provider.getBlock("latest");
  return Number(timestamp);
}
