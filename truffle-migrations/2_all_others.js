const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");

module.exports = async function (deployer) {
  deployer.deploy(Comptroller);
  const comp = await Comptroller.deployed();

  deployer.deploy(PrivatePools, await comp.address);
  deployer.deploy(PublicPools, await comp.address);
  deployer.deploy(DonationPools, await comp.address);
};