const RENT = artifacts.require("RENT");
const RentalAgreementNFT = artifacts.require("RentalAgreementNFT");
const DepositStaking = artifacts.require("DepositStaking");
const Vendor = artifacts.require("Vendor");
const MVE = artifacts.require("MVE");
const RentChannel = artifacts.require("RentChannel");

module.exports = async function (deployer, network, accounts) {
  const owner = accounts[0];

  // Deploy core tokens/contracts with required constructor args
  await deployer.deploy(RENT, owner);
  const rent = await RENT.deployed();

  await deployer.deploy(RentalAgreementNFT);
  const nft = await RentalAgreementNFT.deployed();

  await deployer.deploy(DepositStaking, rent.address, nft.address);
  const staking = await DepositStaking.deployed();

  // Vendor and AMM require RENT address and initial owner
  await deployer.deploy(Vendor, rent.address, owner);
  const vendor = await Vendor.deployed();

  await deployer.deploy(MVE, rent.address, owner);
  const mve = await MVE.deployed();

  // Rent payment channel (requires the RentalAgreementNFT address)
  await deployer.deploy(RentChannel, nft.address);
  const channel = await RentChannel.deployed();

  // Grant mint permissions to Vendor and AMM
  await rent.setMinter(vendor.address, true);
  await rent.setMinter(mve.address, true);

  // Output addresses to console for convenience
  console.log("RENT:", rent.address);
  console.log("NFT:", nft.address);
  console.log("Staking:", staking.address);
  console.log("Vendor:", vendor.address);
  console.log("MVE:", mve.address);
  console.log("RentChannel:", channel.address);
};
