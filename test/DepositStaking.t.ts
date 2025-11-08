import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { deployCore, CoreDeployments } from "./helpers";

async function deployFixture(): Promise<CoreDeployments & { tokenId: number }> {
  const base = await deployCore();
  const now = await time.latest();
  const tx = await base.agreements
    .connect(base.deployer)
    .mint(base.tenant.address, base.landlord.address, now, now + 100, 1_000n, ethers.ZeroHash);
  const receipt = await tx.wait();
  const event = receipt!.logs.find((log: any) => log.fragment?.name === "AgreementCreated");
  const tokenId = Number(event?.args?.tokenId ?? 1n);
  return { ...base, tokenId };
}

describe("DepositStaking", () => {
  it("allows tenant to stake and unstake after end", async () => {
    const { staking, rent, tenant, deployer, landlord, tokenId } = await loadFixture(deployFixture);

    await rent.connect(deployer).mint(tenant.address, 1_000n);
    await rent.connect(tenant).approve(await staking.getAddress(), 1_000n);

    await expect(staking.connect(tenant).stake(tokenId, 500n))
      .to.emit(staking, "Staked")
      .withArgs(tokenId, tenant.address, 500n);

    await time.increase(101);

    await expect(staking.connect(tenant).unstake(tokenId, tenant.address))
      .to.emit(staking, "Unstaked")
      .withArgs(tokenId, tenant.address, 500n);
  });

  it("allows landlord slashing up to staked amount", async () => {
    const { staking, rent, tenant, deployer, landlord, tokenId } = await loadFixture(deployFixture);

    await rent.connect(deployer).mint(tenant.address, 1_000n);
    await rent.connect(tenant).approve(await staking.getAddress(), 1_000n);
    await staking.connect(tenant).stake(tokenId, 300n);

    await expect(staking.connect(landlord).slash(tokenId, 500n))
      .to.emit(staking, "Slashed")
      .withArgs(tokenId, landlord.address, 300n);

    expect(await rent.balanceOf(landlord.address)).to.equal(300n);
  });

  it("reverts unstake before end", async () => {
    const { staking, rent, tenant, deployer, tokenId } = await loadFixture(deployFixture);
    await rent.connect(deployer).mint(tenant.address, 100n);
    await rent.connect(tenant).approve(await staking.getAddress(), 100n);
    await staking.connect(tenant).stake(tokenId, 100n);

    await expect(staking.connect(tenant).unstake(tokenId, tenant.address)).to.be.revertedWithCustomError(
      staking,
      "TooEarly"
    );
  });
});
