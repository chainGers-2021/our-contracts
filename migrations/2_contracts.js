const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const ScaledMath = artifacts.require("ScaledMath");

module.exports = async function (deployer) {
  await deployer.deploy(ScaledMath);
  await deployer.link(ScaledMath, Comptroller);
  await deployer.link(ScaledMath, PrivatePools);
  await deployer.link(ScaledMath, PublicPools);
  
  await deployer.deploy(Comptroller);
  comp = await Comptroller.deployed();

  await deployer.deploy(PrivatePools, comp.address);
  await deployer.deploy(PublicPools, comp.address);
  await deployer.deploy(DonationPools, comp.address);

  pvt = await PrivatePools.deployed();
  pub = await PublicPools.deployed();
  don = await DonationPools.deployed();

  console.log("\n--Setting pool addresses in comptroller--\n");
  // Setting pool addresses in comptroller contract
  await comp.setPoolAddresses(pvt.address, pub.address, don.address);
};
