import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployCore, CoreDeployments } from "./helpers";

async function deployAmmFixture(): Promise<CoreDeployments> {
  const base = await deployCore();
  await base.rent.connect(base.deployer).mint(base.tenant.address, ethers.parseUnits("1000", 18));
  await base.rent.connect(base.tenant).approve(await base.amm.getAddress(), ethers.MaxUint256);
  await base.amm.connect(base.tenant).addLiquidity(ethers.parseUnits("500", 18), {
    value: ethers.parseEther("5")
  });
  return base;
}

describe("MVE AMM", () => {
  it("mints LP on first liquidity add", async () => {
    const { amm, tenant } = await loadFixture(deployAmmFixture);
    expect(await amm.balanceOf(tenant.address)).to.be.gt(0);
  });

  it("keeps invariant non-decreasing on ETH->RENT swap", async () => {
    const { amm, tenant } = await loadFixture(deployAmmFixture);
    const kBefore = (await amm.reserveETH()) * (await amm.reserveRent());
    await amm.connect(tenant).swapExactETHForRENT(0, { value: ethers.parseEther("1") });
    const kAfter = (await amm.reserveETH()) * (await amm.reserveRent());
    expect(kAfter).to.be.gte(kBefore);
  });

  it("allows removing liquidity proportionally", async () => {
    const { amm, tenant } = await loadFixture(deployAmmFixture);
    const lpBalance = await amm.balanceOf(tenant.address);
    const tx = await amm.connect(tenant).removeLiquidity(lpBalance / 2n);
    await tx.wait();
    expect(await amm.balanceOf(tenant.address)).to.be.gt(0);
  });
});
