const Comptroller = artifacts.require("Comptroller");
const Pools = artifacts.require("Pools");
const DonationPools = artifacts.require("DonationPools");
const ScaledMath = artifacts.require("ScaledMath");

module.exports = async function (deployer) {
  await deployer.deploy(ScaledMath);
  await deployer.link(ScaledMath, Comptroller);
  await deployer.link(ScaledMath, Pools);
  await deployer.link(ScaledMath, DonationPools);

  await deployer.deploy(Comptroller);
  comp = await Comptroller.deployed();

  await deployer.deploy(Pools, comp.address);
  await deployer.deploy(DonationPools, comp.address);

  pools = await Pools.deployed();
  don = await DonationPools.deployed();

  console.log("\n--Setting pool addresses in comptroller--\n");
  // Setting pool addresses in comptroller contract
  await comp.setPoolAddresses(pools.address, don.address);
};
