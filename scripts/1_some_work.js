const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");
const assert = require("assert");

module.exports = async callback=> {
  const comp = await Comptroller.deployed();
  const pvt = await PrivatePools.deployed();
  const pub = await PublicPools.deployed();
  const don = await DonationPools.deployed();

  await comp.setPoolAddresses(
    pvt.address,
    pub.address,
    don.address
  );

  assert.strictEqual(await comp.donationPoolsContract(), don.address);
  assert.strictEqual(await comp.privatePoolsContract(), pvt.address);
  assert.strictEqual(await comp.publicPoolsContract(), pub.address);

  callback("All done.");
};
