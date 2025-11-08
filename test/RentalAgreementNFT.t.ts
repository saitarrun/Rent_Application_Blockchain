import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

async function deployFixture() {
  const [owner, landlord, tenant, stranger] = await ethers.getSigners();
  const Agreements = await ethers.getContractFactory("RentalAgreementNFT");
  const agreements = await Agreements.deploy(owner.address);
  await agreements.waitForDeployment();
  return { agreements, owner, landlord, tenant, stranger };
}

describe("RentalAgreementNFT", () => {
  it("stores terms on mint", async () => {
    const { agreements, owner, landlord, tenant } = await loadFixture(deployFixture);
    const start = (await time.latest()) + 10;
    const end = start + 100;
    const tx = await agreements
      .connect(owner)
      .mint(tenant.address, landlord.address, start, end, 1000n, ethers.keccak256(ethers.toUtf8Bytes("terms")));
    const receipt = await tx.wait();
    const event = receipt!.logs.find((l: any) => l.fragment?.name === "AgreementCreated");
    const tokenId = event?.args?.tokenId;

    const info = await agreements.terms(tokenId);
    expect(info.landlord).to.equal(landlord.address);
    expect(info.tenant).to.equal(tenant.address);
    expect(info.start).to.equal(start);
    expect(info.end).to.equal(end);
  });

  it("blocks transfers to enforce soulbound", async () => {
    const { agreements, owner, landlord, tenant, stranger } = await loadFixture(deployFixture);
    const now = await time.latest();
    await agreements
      .connect(owner)
      .mint(tenant.address, landlord.address, now, now + 100, 500n, ethers.ZeroHash);

    await expect(
      agreements.connect(tenant).transferFrom(tenant.address, stranger.address, 1)
    ).to.be.revertedWithCustomError(agreements, "Soulbound");
  });

  it("allows landlord to burn after end", async () => {
    const { agreements, owner, landlord, tenant } = await loadFixture(deployFixture);
    const now = await time.latest();
    await agreements
      .connect(owner)
      .mint(tenant.address, landlord.address, now, now + 10, 500n, ethers.ZeroHash);
    await time.increase(11);

    await expect(agreements.connect(landlord).burn(1)).to.emit(agreements, "AgreementEnded");
    expect(await agreements.balanceOf(tenant.address)).to.equal(0);
  });
});
