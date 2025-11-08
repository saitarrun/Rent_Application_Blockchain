import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployCore, CoreDeployments } from "./helpers";

async function deployVendorFixture(): Promise<CoreDeployments> {
  const base = await deployCore();
  await base.vendor.connect(base.deployer).setPrices(ethers.parseUnits("100", 18), ethers.parseUnits("1", 16));
  return base;
}

describe("Vendor", () => {
  it("mints RENT on buy", async () => {
    const { vendor, rent, tenant } = await loadFixture(deployVendorFixture);
    await expect(vendor.connect(tenant).buy({ value: ethers.parseEther("1") }))
      .to.emit(vendor, "Purchased")
      .withArgs(tenant.address, ethers.parseEther("1"), ethers.parseUnits("100", 18));
    expect(await rent.balanceOf(tenant.address)).to.equal(ethers.parseUnits("100", 18));
  });

  it("burns RENT and pays ETH on sell", async () => {
    const { vendor, rent, tenant, deployer } = await loadFixture(deployVendorFixture);
    await vendor.connect(tenant).buy({ value: ethers.parseEther("1") });
    await rent.connect(tenant).approve(await vendor.getAddress(), ethers.MaxUint256);

    await deployer.sendTransaction({ to: await vendor.getAddress(), value: ethers.parseEther("10") });

    await expect(vendor.connect(tenant).sell(ethers.parseUnits("100", 18)))
      .to.emit(vendor, "Sold")
      .withArgs(tenant.address, ethers.parseUnits("100", 18), ethers.parseEther("0.01"));
  });
});
