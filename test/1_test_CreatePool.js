const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");

contract("Everything", async (addresses) => {
  it("is deployable.", async () => {
    const comp = await Comptroller.new();
    await PrivatePools.new(await comp.address);
    await PublicPools.new(await comp.address);
    await DonationPools.new(await comp.address);
  });
});
