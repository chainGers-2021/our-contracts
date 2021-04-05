const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");

module.exports = async function (deployer) {
  await deployer.deploy(Comptroller);
  const comp = await Comptroller.deployed();
  
  await deployer.deploy(PrivatePools, comp.address);
  await deployer.deploy(PublicPools, comp.address);
  await deployer.deploy(DonationPools, comp.address);
};