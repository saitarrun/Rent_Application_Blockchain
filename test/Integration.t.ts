import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { deployCore } from "./helpers";

async function deployIntegrationFixture() {
  const base = await deployCore();
  const now = await time.latest();
  const tx = await base.agreements
    .connect(base.deployer)
    .mint(base.tenant.address, base.landlord.address, now, now + 1000, 1_000n, ethers.ZeroHash);
  const receipt = await tx.wait();
  const event = receipt!.logs.find((log: any) => log.fragment?.name === "AgreementCreated");
  const tokenId = Number(event?.args?.tokenId ?? 1n);
  await base.vendor.connect(base.deployer).setPrices(ethers.parseUnits("100", 18), ethers.parseUnits("1", 16));
  await base.deployer.sendTransaction({ to: await base.vendor.getAddress(), value: ethers.parseEther("10") });
  return { ...base, tokenId };
}

function voucherData(channelAddress: string, chainId: bigint, payload: any) {
  const domain = {
    name: "RentChannel",
    version: "1",
    chainId,
    verifyingContract: channelAddress
  };
  const types = {
    Voucher: [
      { name: "payer", type: "address" },
      { name: "payee", type: "address" },
      { name: "agreementId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" }
    ]
  };
  return { domain, types, value: payload };
}

describe("Integration flow", () => {
  it("runs full lifecycle", async () => {
    const { vendor, staking, rent, tenant, landlord, channel, tokenId, agreements } = await loadFixture(
      deployIntegrationFixture
    );

    await vendor.connect(tenant).buy({ value: ethers.parseEther("1") });
    await rent.connect(tenant).approve(await staking.getAddress(), ethers.MaxUint256);
    await staking.connect(tenant).stake(tokenId, ethers.parseUnits("50", 18));

    await channel.connect(tenant).open(tokenId, 300, { value: ethers.parseEther("1") });

    const { chainId } = await ethers.provider.getNetwork();
    const expiry = BigInt((await time.latest()) + 600);
    const payload = {
      payer: tenant.address,
      payee: landlord.address,
      agreementId: tokenId,
      amount: ethers.parseEther("0.8"),
      nonce: 1n,
      expiry
    };
    const typed = voucherData(await channel.getAddress(), chainId, payload);
    const signature = await tenant.signTypedData(typed.domain, typed.types, typed.value);

    const landlordBefore = await ethers.provider.getBalance(landlord.address);
    await expect(channel.connect(landlord).close(payload, signature)).to.emit(channel, "Closed");
    const landlordAfter = await ethers.provider.getBalance(landlord.address);
    expect(landlordAfter - landlordBefore).to.equal(ethers.parseEther("0.8"));

    await time.increase(1001);
    await expect(staking.connect(tenant).unstake(tokenId, tenant.address)).to.emit(staking, "Unstaked");
    expect(await rent.balanceOf(tenant.address)).to.be.gte(0n);

    await expect(agreements.connect(landlord).burn(tokenId)).to.emit(agreements, "AgreementEnded");
  });
});
