import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { deployCore, CoreDeployments } from "./helpers";

async function deployChannelFixture(): Promise<CoreDeployments & { tokenId: number }> {
  const base = await deployCore();
  const now = await time.latest();
  const tx = await base.agreements
    .connect(base.deployer)
    .mint(base.tenant.address, base.landlord.address, now - 10, now + 1000, 1_000n, ethers.ZeroHash);
  const receipt = await tx.wait();
  const event = receipt!.logs.find((log: any) => log.fragment?.name === "AgreementCreated");
  const tokenId = Number(event?.args?.tokenId ?? 1n);
  return { ...base, tokenId };
}

function buildVoucher(
  channelAddress: string,
  chainId: bigint,
  payer: string,
  payee: string,
  agreementId: number,
  amount: bigint,
  nonce: bigint,
  expiry: bigint
) {
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

  const value = {
    payer,
    payee,
    agreementId,
    amount,
    nonce,
    expiry
  };

  return { domain, types, value };
}

describe("RentChannel", () => {
  it("opens, accepts voucher, pays landlord and refunds tenant", async () => {
    const { channel, tenant, landlord, tokenId } = await loadFixture(deployChannelFixture);

    await channel.connect(tenant).open(tokenId, 300, { value: ethers.parseEther("1") });

    const { chainId } = await ethers.provider.getNetwork();
    const voucherData = buildVoucher(
      await channel.getAddress(),
      chainId,
      tenant.address,
      landlord.address,
      tokenId,
      ethers.parseEther("0.6"),
      1n,
      BigInt((await time.latest()) + 600)
    );

    const signature = await tenant.signTypedData(voucherData.domain, voucherData.types, voucherData.value);

    const landlordBalanceBefore = await ethers.provider.getBalance(landlord.address);
    const tenantBalanceBefore = await ethers.provider.getBalance(tenant.address);

    const tx = await channel.connect(landlord).close(voucherData.value, signature);
    await tx.wait();

    const landlordBalanceAfter = await ethers.provider.getBalance(landlord.address);
    const tenantBalanceAfter = await ethers.provider.getBalance(tenant.address);

    expect(landlordBalanceAfter - landlordBalanceBefore).to.equal(ethers.parseEther("0.6"));
    expect(tenantBalanceAfter - tenantBalanceBefore).to.equal(ethers.parseEther("0.4"));
  });

  it("rejects replayed nonce", async () => {
    const { channel, tenant, landlord, tokenId } = await loadFixture(deployChannelFixture);
    await channel.connect(tenant).open(tokenId, 300, { value: ethers.parseEther("1") });
    const { chainId } = await ethers.provider.getNetwork();
    const expiry = BigInt((await time.latest()) + 600);

    const voucherData = buildVoucher(
      await channel.getAddress(),
      chainId,
      tenant.address,
      landlord.address,
      tokenId,
      ethers.parseEther("0.3"),
      1n,
      expiry
    );
    const signature = await tenant.signTypedData(voucherData.domain, voucherData.types, voucherData.value);

    await channel.connect(landlord).close(voucherData.value, signature);

    await channel.connect(tenant).open(tokenId, 300, { value: ethers.parseEther("1") });
    await expect(channel.connect(landlord).close(voucherData.value, signature)).to.be.revertedWith(
      "RentChannel:nonce"
    );
  });

  it("allows timeout refund", async () => {
    const { channel, tenant, tokenId } = await loadFixture(deployChannelFixture);
    await channel.connect(tenant).open(tokenId, 1, { value: ethers.parseEther("0.5") });
    await time.increase(2);
    await expect(channel.connect(tenant).timeoutClose(tokenId)).to.emit(channel, "TimeoutClosed");
  });

  it("blocks expired vouchers", async () => {
    const { channel, tenant, landlord, tokenId } = await loadFixture(deployChannelFixture);
    await channel.connect(tenant).open(tokenId, 300, { value: ethers.parseEther("0.5") });
    const { chainId } = await ethers.provider.getNetwork();
    const expiry = BigInt((await time.latest()) - 10);

    const voucherData = buildVoucher(
      await channel.getAddress(),
      chainId,
      tenant.address,
      landlord.address,
      tokenId,
      ethers.parseEther("0.1"),
      1n,
      expiry
    );
    const signature = await tenant.signTypedData(voucherData.domain, voucherData.types, voucherData.value);
    await expect(channel.connect(landlord).close(voucherData.value, signature)).to.be.revertedWith(
      "RentChannel:expired"
    );
  });
});
