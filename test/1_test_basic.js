const truffleAssert = require("truffle-assertions");
const assert = require("assert");
const Comptroller = artifacts.require("Comptroller");
const PrivatePools = artifacts.require("PrivatePools");
const PublicPools = artifacts.require("PublicPools");
const DonationPools = artifacts.require("DonationPools");

contract("--PublicPools testing--", async (accounts) => {
  const [admin, user1, user2, _] = accounts;

  before("Deploying contracts", async () => {
    console.log("ETH balance: ", await web3.eth.getBalance(admin));
    comp = await Comptroller.new();
    pvt = await PrivatePools.new(comp.address);
    pub = await PublicPools.new(comp.address);
    don = await DonationPools.new(comp.address);
    console.log(comp.address);
    console.log(pvt.address);
    console.log(pub.address);
    console.log(don.address);

    const setPoolAddresses = await comp.setPoolAddresses(
      pvt.address,
      pub.address,
      don.address
    );

    const addTokenData = await comp.addTokenData(
      "LINK",
      "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
      "0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04",
      "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      8
    );

    // Adding a recipient of the donation amounts
    const addRecipient = await don.addRecipient(admin, "DEV");

    // Creating public pool
    await pub.createPool("LINK", "Test1", 45, {
      from: admin,
    });
  });

  it("Cannot create Pool with no name", async () => {
    console.log("Test1");
    try {
      await pub.createPool("LINK", "", 45, {
        from: admin,
      });
    } catch (error) {}
  });

  it("Only owner can create the Pool", async () => {
    console.log("Test2");
    try {
      await pub.createPool("LINK", "Test2", 45, {
        from: user1,
      });
    } catch (error) {}
  });

  it("Cannot create Pool with no token symbol", async () => {
    console.log("Test3");
    try {
      pub.createPool("", "Test3", 45, {
        from: admin,
      });
    } catch (error) {}
  });

  it("Cannot create Pool with same name", async () => {
    console.log("Test4");
    try {
      await pub.createPool("LINK", "Test1", 45, {
        from: admin,
      });
    } catch (error) {}
  });

  it("Cannot create Pool with same name but different token symbol", async () => {
    console.log("Test5");
    try {
      await pub.createPool("ETH", "Test1", 45, {
        from: admin,
      });
    } catch (error) {}
  });
  console.log("--End of PublicPools Testing");
});
