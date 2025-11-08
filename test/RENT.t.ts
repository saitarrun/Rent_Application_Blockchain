import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployRentFixture() {
  const [deployer, other, vendor] = await ethers.getSigners();
  const Rent = await ethers.getContractFactory("RENT");
  const rent = await Rent.deploy(deployer.address);
  await rent.waitForDeployment();
  return { rent, deployer, other, vendor };
}

describe("RENT token", () => {
  it("allows owner minting", async () => {
    const { rent, deployer, other } = await loadFixture(deployRentFixture);
    await expect(rent.connect(deployer).mint(other.address, 1000n)).to.emit(rent, "Mint");
    expect(await rent.balanceOf(other.address)).to.equal(1000n);
  });

  it("restricts minting to owner or minter", async () => {
    const { rent, other, deployer, vendor } = await loadFixture(deployRentFixture);
    await expect(rent.connect(other).mint(other.address, 1n)).to.be.revertedWith("RENT:not-minter");
    await rent.connect(deployer).setMinter(vendor.address, true);
    await rent.connect(vendor).mint(other.address, 5n);
    expect(await rent.balanceOf(other.address)).to.equal(5n);
  });

  it("burns tokens and emits event", async () => {
    const { rent, deployer } = await loadFixture(deployRentFixture);
    await rent.connect(deployer).mint(deployer.address, 100n);
    await expect(rent.connect(deployer).burn(40n)).to.emit(rent, "Burn").withArgs(deployer.address, 40n);
    expect(await rent.balanceOf(deployer.address)).to.equal(60n);
  });
});
