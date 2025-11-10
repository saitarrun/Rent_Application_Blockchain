const RENT = artifacts.require("RENT");
const RentalAgreementNFT = artifacts.require("RentalAgreementNFT");
const DepositStaking = artifacts.require("DepositStaking");
const Vendor = artifacts.require("Vendor");
const MVE = artifacts.require("MVE");
const RentChannel = artifacts.require("RentChannel");

module.exports = async function (deployer, network, accounts) {
  const owner = accounts[0];
  console.log("owner:", owner, "accounts.length:", accounts.length);

  // gas hint to avoid out-of-gas on small block limits
  const TX = { from: owner, gas: 6_500_000 };

  await deployer.deploy(RENT, owner, TX);
  const rent = await RENT.deployed();

  await deployer.deploy(RentalAgreementNFT, TX);
  const nft = await RentalAgreementNFT.deployed();

  await deployer.deploy(DepositStaking, rent.address, nft.address, TX);
  const staking = await DepositStaking.deployed();

  await deployer.deploy(Vendor, rent.address, owner, TX);
  const vendor = await Vendor.deployed();

  await deployer.deploy(MVE, rent.address, owner, TX);
  const mve = await MVE.deployed();

  await deployer.deploy(RentChannel, nft.address, TX);
  const channel = await RentChannel.deployed();

  await rent.setMinter(vendor.address, true, TX);
  await rent.setMinter(mve.address, true, TX);

  console.log("RENT:", rent.address);
  console.log("NFT:", nft.address);
  console.log("Staking:", staking.address);
  console.log("Vendor:", vendor.address);
  console.log("MVE:", mve.address);
  console.log("RentChannel:", channel.address);
};