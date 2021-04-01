const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");

module.exports = async function (callback) {
    const comp = await Comptroller.deployed();
    const pvt = await PrivatePools.deployed();
    const pub = await PublicPools.deployed();
    const don = await DonationPools.deployed();


    // await comp.setPoolAddresses(await pvt.address, await pub.address, await don.address);


}